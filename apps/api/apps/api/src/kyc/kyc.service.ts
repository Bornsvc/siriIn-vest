import { randomInt, randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@db';
import { normalizeFullName } from '../auth/validation/account-rules';
import { PrismaService } from '../prisma/prisma.service';
import {
  ObjectStorage,
  StoredObject,
  UploadTicket,
} from '../storage/object-storage';
import { RequestUploadDto } from './dto/request-upload.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import {
  kycAlreadyApproved,
  kycAlreadyInReview,
  kycNotFound,
  kycRejected,
} from './kyc.errors';
import { KycSubmissionView } from './kyc.types';
import {
  IMAGE_TYPES,
  REQUIRED_DOCUMENTS,
  maskDocumentNumber,
  validateByteSize,
  validateImageContentType,
} from './validation/kyc-rules';

/**
 * Five years, which is the common anti-money-laundering retention period and a
 * placeholder until someone reads the Lao rule and sets `KYC_RETENTION_DAYS`.
 * It is a number in the environment rather than a constant here precisely
 * because it is a regulatory answer, not an engineering one.
 */
const DEFAULT_RETENTION_DAYS = 5 * 365;

const UNIQUE_VIOLATION = 'P2002';
const REFERENCE_ATTEMPTS = 5;

const WITH_RELATIONS = {
  province: true,
  fundSource: true,
  documents: { orderBy: { kind: 'asc' } },
} as const;

type SubmissionRow = Prisma.KycSubmissionGetPayload<{
  include: typeof WITH_RELATIONS;
}>;

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: ObjectStorage,
    private readonly config: ConfigService,
  ) {}

  /**
   * Somewhere to put one photo. The key is minted here, under the caller's own
   * prefix, so one customer cannot name a path belonging to another — and so
   * `submit` can tell whose upload it is being handed.
   */
  requestUpload(userId: string, dto: RequestUploadDto): Promise<UploadTicket> {
    const extension = IMAGE_TYPES[dto.contentType.toLowerCase()];
    const key = `kyc/${userId}/${dto.kind}/${randomUUID()}.${extension}`;

    return this.storage.createUploadTicket({
      key,
      contentType: dto.contentType,
    });
  }

  async submit(userId: string, dto: SubmitKycDto): Promise<KycSubmissionView> {
    await this.assertNothingInFlight(userId);
    assertPhotoSet(dto);
    await this.assertReferencedRowsExist(dto);
    const objects = await this.readUploads(userId, dto);

    const row = await this.create(userId, dto, objects);

    // The reference, not the customer's details: this line goes to a log.
    this.logger.log(
      JSON.stringify({ message: 'KYC submitted', reference: row.reference }),
    );

    return toView(row);
  }

  /** The caller's most recent submission. */
  async latest(userId: string): Promise<KycSubmissionView> {
    const row = await this.prisma.kycSubmission.findFirst({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      include: WITH_RELATIONS,
    });

    if (!row) throw kycNotFound();
    return toView(row);
  }

  /**
   * One check at a time. A customer who is already verified has nothing to
   * send, and one already in review would give the reviewer two of the same.
   */
  private async assertNothingInFlight(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });
    if (user?.status === 'verified') throw kycAlreadyApproved();

    const inReview = await this.prisma.kycSubmission.findFirst({
      where: { userId, status: 'in_review' },
      select: { id: true },
    });
    if (inReview) throw kycAlreadyInReview();
  }

  /** A code that names no row is a 400 about that field, not a foreign key crash. */
  private async assertReferencedRowsExist(dto: SubmitKycDto): Promise<void> {
    const [province, fundSource] = await Promise.all([
      this.prisma.province.findUnique({
        where: { code: dto.provinceCode },
        select: { code: true },
      }),
      this.prisma.fundSource.findUnique({
        where: { code: dto.fundSourceCode },
        select: { code: true },
      }),
    ]);

    if (!province) throw kycRejected('provinceCode', 'Select your province.');
    if (!fundSource) {
      throw kycRejected(
        'fundSourceCode',
        'Select where the money you invest comes from.',
      );
    }
  }

  /**
   * What the bucket actually holds, for each key quoted. Type, size and
   * checksum come from here rather than from the request: the browser can say
   * anything, and the only thing worth recording is what was really stored.
   */
  private async readUploads(
    userId: string,
    dto: SubmitKycDto,
  ): Promise<Map<string, StoredObject>> {
    const prefix = `kyc/${userId}/`;
    const objects = new Map<string, StoredObject>();

    for (const [index, photo] of dto.photos.entries()) {
      const field = `photos.${index}.storageKey`;

      // The key was minted for one customer. Quoting somebody else's is not a
      // mistake anyone makes by accident.
      if (!photo.storageKey.startsWith(prefix)) {
        throw kycRejected(field, 'That photo is not one of yours.');
      }

      const object = await this.storage.stat(photo.storageKey);
      if (!object) {
        throw kycRejected(
          field,
          'That photo did not finish uploading. Try again.',
        );
      }

      const wrongType = validateImageContentType(object.contentType);
      if (wrongType) throw kycRejected(field, wrongType);

      const wrongSize = validateByteSize(object.byteSize);
      if (wrongSize) throw kycRejected(field, wrongSize);

      objects.set(photo.storageKey, object);
    }

    return objects;
  }

  private async create(
    userId: string,
    dto: SubmitKycDto,
    objects: Map<string, StoredObject>,
  ): Promise<SubmissionRow> {
    const purgeAfter = new Date(
      Date.now() + this.retentionDays() * 24 * 60 * 60 * 1000,
    );

    for (let attempt = 1; attempt <= REFERENCE_ATTEMPTS; attempt += 1) {
      try {
        return await this.prisma.kycSubmission.create({
          data: {
            userId,
            reference: newReference(),
            fullName: normalizeFullName(dto.fullName),
            // Stored as a date, so a customer's birthday does not move with
            // the timezone the server happens to run in.
            dateOfBirth: new Date(`${dto.dateOfBirth}T00:00:00Z`),
            village: dto.village.trim(),
            district: dto.district.trim(),
            provinceCode: dto.provinceCode,
            fundSourceCode: dto.fundSourceCode,
            documentType: dto.documentType,
            documentNumber: dto.documentNumber.trim(),
            purgeAfter,
            documents: {
              create: dto.photos.map((photo) => {
                const object = objects.get(photo.storageKey)!;
                return {
                  kind: photo.kind,
                  storageKey: photo.storageKey,
                  contentType: object.contentType,
                  byteSize: object.byteSize,
                  checksum: object.checksum,
                };
              }),
            },
          },
          include: WITH_RELATIONS,
        });
      } catch (error) {
        if (!isReferenceCollision(error)) throw error;
        // Seven digits collide about as often as you would expect, which is
        // rarely — but "rarely" is not "never" once there are enough rows.
      }
    }

    throw new Error(
      `Could not find an unused KYC reference in ${REFERENCE_ATTEMPTS} attempts.`,
    );
  }

  private retentionDays(): number {
    const raw = this.config.get<string>('KYC_RETENTION_DAYS');
    const days = raw ? Number.parseInt(raw, 10) : Number.NaN;
    return Number.isFinite(days) && days > 0 ? days : DEFAULT_RETENTION_DAYS;
  }
}

/** The form will not submit an incomplete set; neither will this. */
function assertPhotoSet(dto: SubmitKycDto): void {
  const required = [...REQUIRED_DOCUMENTS[dto.documentType]];
  const given = dto.photos.map((photo) => photo.kind);

  if (new Set(given).size !== given.length) {
    throw kycRejected('photos', 'Send each photo once.');
  }

  const missing = required.filter((kind) => !given.includes(kind));
  const extra = given.filter((kind) => !required.includes(kind));

  if (missing.length || extra.length) {
    throw kycRejected(
      'photos',
      dto.documentType === 'passport'
        ? 'A passport check needs the photo page and one photo of your face.'
        : 'An ID card check needs the front, the back, and one photo of your face.',
    );
  }
}

function newReference(): string {
  return `SI-KYC-${randomInt(1_000_000, 10_000_000)}`;
}

function isReferenceCollision(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_VIOLATION &&
    JSON.stringify(error.meta ?? '').includes('reference')
  );
}

function toView(row: SubmissionRow): KycSubmissionView {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    submittedAt: row.submittedAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    details: {
      fullName: row.fullName,
      dateOfBirth: row.dateOfBirth.toISOString().slice(0, 10),
      village: row.village,
      district: row.district,
      province: { code: row.province.code, name: row.province.name },
      fundSource: { code: row.fundSource.code, label: row.fundSource.label },
    },
    document: {
      type: row.documentType,
      number: maskDocumentNumber(row.documentNumber),
    },
    // Deliberately no storage keys: the customer has no use for them, and the
    // bucket is not something this response should hand out a map of.
    photos: row.documents.map((document) => ({
      kind: document.kind,
      uploadedAt: document.uploadedAt.toISOString(),
    })),
  };
}
