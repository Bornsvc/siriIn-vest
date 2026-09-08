import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ApiExceptionFilter } from './../src/common/filters/api-exception.filter';
import { buildValidationPipe } from './../src/common/validation/validation.pipe';
import { KycSubmissionView } from './../src/kyc/kyc.types';
import { PrismaService } from './../src/prisma/prisma.service';
import { ObjectStorage, UploadTicket } from './../src/storage/object-storage';
import { FakeObjectStorage } from './fake-object-storage';

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details: { field: string; message: string }[];
  };
}

function bodyOf<T>(response: request.Response): T {
  return response.body as T;
}

const DETAILS = {
  fullName: 'Sayasith Souvannachack',
  dateOfBirth: '1994-07-21',
  village: 'Ban Sisaket',
  district: 'Chanthabouly',
  provinceCode: 'vientiane-prefecture',
  fundSourceCode: 'salary',
  documentType: 'national_id',
  documentNumber: '1 2345 6789 012',
};

describe('KYC (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storage: FakeObjectStorage;
  let token: string;

  beforeAll(async () => {
    storage = new FakeObjectStorage();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ObjectStorage)
      .useValue(storage)
      .compile();

    prisma = moduleFixture.get(PrismaService);
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(buildValidationPipe());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Submissions cascade with their user, so this clears both tables.
    await prisma.user.deleteMany();
    storage.clear();

    const signUp = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({
        name: 'Sayasith Souvannachack',
        email: 'kyc@example.com',
        phone: '20 5551 4242',
        password: 'vientiane1',
        acceptedTerms: true,
      })
      .expect(201);

    token = (signUp.body as { accessToken: string }).accessToken;
  });

  function ticketFor(kind: string, contentType = 'image/jpeg') {
    return request(app.getHttpServer())
      .post('/kyc/uploads')
      .set('Authorization', `Bearer ${token}`)
      .send({ kind, contentType });
  }

  /** Ask for a place to put a photo, then pretend the browser put one there. */
  async function uploaded(kind: string, object = {}) {
    const response = await ticketFor(kind).expect(201);
    const { storageKey } = bodyOf<UploadTicket>(response);
    storage.put(storageKey, object);
    return { kind, storageKey };
  }

  async function idCardPhotos() {
    return [
      await uploaded('id_front'),
      await uploaded('id_back'),
      await uploaded('selfie'),
    ];
  }

  function submit(body: object) {
    return request(app.getHttpServer())
      .post('/kyc/submissions')
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  }

  describe('POST /kyc/uploads', () => {
    it('hands out a signed URL under a key of our choosing', async () => {
      const response = await ticketFor('id_front').expect(201);
      const ticket = bodyOf<UploadTicket>(response);

      expect(ticket.method).toBe('PUT');
      expect(ticket.headers['Content-Type']).toBe('image/jpeg');
      expect(ticket.storageKey).toMatch(
        /^kyc\/[0-9a-f-]{36}\/id_front\/[0-9a-f-]{36}\.jpg$/,
      );
      expect(Date.parse(ticket.expiresAt)).toBeGreaterThan(Date.now());
    });

    it('never lets the client choose where its file lands', async () => {
      const first = bodyOf<UploadTicket>(await ticketFor('selfie').expect(201));
      const second = bodyOf<UploadTicket>(
        await ticketFor('selfie').expect(201),
      );

      expect(first.storageKey).not.toBe(second.storageKey);
    });

    it('refuses a file type a reviewer could not open', async () => {
      const response = await ticketFor('id_front', 'application/pdf').expect(
        400,
      );

      expect(bodyOf<ErrorBody>(response).error.details).toEqual([
        { field: 'contentType', message: 'Use a photo — JPEG, PNG or HEIC.' },
      ]);
    });

    it('needs a token', async () => {
      await request(app.getHttpServer())
        .post('/kyc/uploads')
        .send({ kind: 'id_front', contentType: 'image/jpeg' })
        .expect(401);
    });
  });

  describe('POST /kyc/submissions', () => {
    it('accepts a complete ID-card check and answers with a reference', async () => {
      const response = await submit({
        ...DETAILS,
        photos: await idCardPhotos(),
      }).expect(201);

      const view = bodyOf<KycSubmissionView>(response);

      expect(view.reference).toMatch(/^SI-KYC-\d{7}$/);
      expect(view.status).toBe('in_review');
      expect(view.details).toMatchObject({
        dateOfBirth: '1994-07-21',
        province: {
          code: 'vientiane-prefecture',
          name: 'Vientiane Prefecture',
        },
        fundSource: { code: 'salary', label: 'Salary or wages' },
      });
      expect(view.document.number).toBe('••••••••9012');
      expect(JSON.stringify(response.body)).not.toContain('kyc/');
    });

    it('records what the bucket holds, not what the request claimed', async () => {
      const photos = await idCardPhotos();
      storage.put(photos[0].storageKey, {
        contentType: 'image/png',
        byteSize: 999_111,
        checksum: 'Zm9vYmFyYmF6cXV4MDAwMA==',
      });

      const response = await submit({ ...DETAILS, photos }).expect(201);
      const { id } = bodyOf<KycSubmissionView>(response);

      const row = await prisma.kycSubmission.findUniqueOrThrow({
        where: { id },
        include: { documents: true },
      });
      const front = row.documents.find((d) => d.kind === 'id_front');

      expect(front).toMatchObject({
        contentType: 'image/png',
        byteSize: 999_111,
        checksum: 'Zm9vYmFyYmF6cXV4MDAwMA==',
      });
    });

    it('refuses a key nothing was ever uploaded to', async () => {
      const photos = await idCardPhotos();
      await storage.delete(photos[1].storageKey);

      const response = await submit({ ...DETAILS, photos }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.details).toEqual([
        {
          field: 'photos.1.storageKey',
          message: 'That photo did not finish uploading. Try again.',
        },
      ]);
    });

    it('refuses a key under somebody elses prefix', async () => {
      const photos = await idCardPhotos();
      const stolen = 'kyc/11111111-2222-3333-4444-555555555555/selfie/x.jpg';
      storage.put(stolen);

      const response = await submit({
        ...DETAILS,
        photos: [photos[0], photos[1], { kind: 'selfie', storageKey: stolen }],
      }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.details).toEqual([
        {
          field: 'photos.2.storageKey',
          message: 'That photo is not one of yours.',
        },
      ]);
    });

    it('refuses a photo the bucket says is over 10 MB', async () => {
      const photos = await idCardPhotos();
      storage.put(photos[0].storageKey, { byteSize: 11 * 1024 * 1024 });

      const response = await submit({ ...DETAILS, photos }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.message).toBe(
        'That photo is over 10 MB. Try again at a lower resolution.',
      );
    });

    it('refuses a storage key that tries to climb out of its prefix', async () => {
      const photos = await idCardPhotos();

      const response = await submit({
        ...DETAILS,
        photos: [
          { kind: 'id_front', storageKey: '../../etc/passwd' },
          photos[1],
          photos[2],
        ],
      }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.details[0].field).toBe(
        'photos.0.storageKey',
      );
    });

    it('takes a passport with its one photo page', async () => {
      const response = await submit({
        ...DETAILS,
        documentType: 'passport',
        documentNumber: 'P1234567',
        photos: [await uploaded('passport_page'), await uploaded('selfie')],
      }).expect(201);

      expect(bodyOf<KycSubmissionView>(response).document.type).toBe(
        'passport',
      );
    });

    it('refuses an ID card missing its back', async () => {
      const response = await submit({
        ...DETAILS,
        photos: [await uploaded('id_front'), await uploaded('selfie')],
      }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.details).toEqual([
        {
          field: 'photos',
          message:
            'An ID card check needs the front, the back, and one photo of your face.',
        },
      ]);
    });

    it('judges the document number by the document type', async () => {
      const response = await submit({
        ...DETAILS,
        documentNumber: 'P1234567',
        photos: await idCardPhotos(),
      }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.details).toEqual([
        {
          field: 'documentNumber',
          message: 'Enter the 8 to 14 digit number printed on your ID card.',
        },
      ]);
    });

    it('will not take a customer under 18', async () => {
      const response = await submit({
        ...DETAILS,
        dateOfBirth: '2019-01-01',
        photos: await idCardPhotos(),
      }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.message).toBe(
        'You have to be 18 or older to hold a brokerage account.',
      );
    });

    it('refuses a province code that names no row', async () => {
      const response = await submit({
        ...DETAILS,
        provinceCode: 'atlantis',
        photos: await idCardPhotos(),
      }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.details).toEqual([
        { field: 'provinceCode', message: 'Select your province.' },
      ]);
    });

    it('will not queue a second check while one is in review', async () => {
      await submit({ ...DETAILS, photos: await idCardPhotos() }).expect(201);

      const response = await submit({
        ...DETAILS,
        photos: await idCardPhotos(),
      }).expect(409);

      expect(bodyOf<ErrorBody>(response).error.code).toBe(
        'KYC_ALREADY_IN_REVIEW',
      );
    });

    it('needs a token', async () => {
      const response = await request(app.getHttpServer())
        .post('/kyc/submissions')
        .send(DETAILS)
        .expect(401);

      expect(bodyOf<ErrorBody>(response).error.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('GET /kyc/submissions/me', () => {
    it('answers with the check the caller sent', async () => {
      const created = await submit({
        ...DETAILS,
        photos: await idCardPhotos(),
      }).expect(201);

      const response = await request(app.getHttpServer())
        .get('/kyc/submissions/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(bodyOf<KycSubmissionView>(response).reference).toBe(
        bodyOf<KycSubmissionView>(created).reference,
      );
    });

    it('says so plainly when there is nothing to show', async () => {
      const response = await request(app.getHttpServer())
        .get('/kyc/submissions/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(bodyOf<ErrorBody>(response).error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /fund-sources', () => {
    it('lists them in the order the form offers them', async () => {
      const response = await request(app.getHttpServer())
        .get('/fund-sources')
        .expect(200);

      const { fundSources } = response.body as {
        fundSources: { code: string; label: string }[];
      };

      expect(fundSources).toHaveLength(6);
      expect(fundSources[0]).toEqual({
        code: 'salary',
        label: 'Salary or wages',
      });
      expect(response.headers['cache-control']).toBe('public, max-age=3600');
    });
  });
});
