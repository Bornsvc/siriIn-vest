import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ApiExceptionFilter } from './../src/common/filters/api-exception.filter';
import { buildValidationPipe } from './../src/common/validation/validation.pipe';
import { PrismaService } from './../src/prisma/prisma.service';
import { Profile } from './../src/profile/profile.types';
import { ObjectStorage } from './../src/storage/object-storage';
import { FakeObjectStorage } from './fake-object-storage';

interface ErrorBody {
  error: { code: string; message: string };
}

function bodyOf<T>(response: request.Response): T {
  return response.body as T;
}

describe('Profile (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let storage: FakeObjectStorage;
  let token: string;
  let userId: string;

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
    await prisma.user.deleteMany();
    storage.clear();

    const signUp = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({
        name: 'Sayasith Souvannachack',
        email: 'profile@example.com',
        phone: '20 5551 3131',
        password: 'vientiane1',
        acceptedTerms: true,
      })
      .expect(201);

    const body = signUp.body as { accessToken: string; user: { id: string } };
    token = body.accessToken;
    userId = body.user.id;
  });

  function profile() {
    return request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${token}`);
  }

  it('answers with the shape the app shell already expects', async () => {
    const response = await profile().expect(200);

    expect(bodyOf<Profile>(response)).toEqual({
      id: userId,
      name: 'Sayasith Souvannachack',
      email: 'profile@example.com',
      phone: '+8562055513131',
      initials: 'SS',
      kycStatus: 'unverified',
      joinedAt: expect.any(String) as string,
    });
  });

  it('never puts the password hash on the response', async () => {
    const response = await profile().expect(200);

    expect(JSON.stringify(response.body)).not.toContain('$2b$');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  describe('kycStatus', () => {
    async function submitCheck() {
      const photos = [];
      for (const kind of ['id_front', 'id_back', 'selfie']) {
        const ticket = await request(app.getHttpServer())
          .post('/kyc/uploads')
          .set('Authorization', `Bearer ${token}`)
          .send({ kind, contentType: 'image/jpeg' })
          .expect(201);
        const { storageKey } = ticket.body as { storageKey: string };
        storage.put(storageKey);
        photos.push({ kind, storageKey });
      }

      await request(app.getHttpServer())
        .post('/kyc/submissions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          fullName: 'Sayasith Souvannachack',
          dateOfBirth: '1994-07-21',
          village: 'Ban Sisaket',
          district: 'Chanthabouly',
          provinceCode: 'vientiane-prefecture',
          fundSourceCode: 'salary',
          documentType: 'national_id',
          documentNumber: '1 2345 6789 012',
          photos,
        })
        .expect(201);
    }

    it('is unverified before anything is sent', async () => {
      expect(bodyOf<Profile>(await profile().expect(200)).kycStatus).toBe(
        'unverified',
      );
    });

    it('turns pending while a check is with the reviewer', async () => {
      await submitCheck();

      expect(bodyOf<Profile>(await profile().expect(200)).kycStatus).toBe(
        'pending',
      );
    });

    it('reads verified from the account, not from the submission', async () => {
      await submitCheck();
      // What a reviewer approving a check would do.
      await prisma.kycSubmission.updateMany({
        where: { userId },
        data: { status: 'approved', reviewedAt: new Date() },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'verified' },
      });

      expect(bodyOf<Profile>(await profile().expect(200)).kycStatus).toBe(
        'verified',
      );
    });

    it('falls back to unverified when a check was rejected', async () => {
      await submitCheck();
      await prisma.kycSubmission.updateMany({
        where: { userId },
        data: { status: 'rejected', reviewedAt: new Date() },
      });

      expect(bodyOf<Profile>(await profile().expect(200)).kycStatus).toBe(
        'unverified',
      );
    });
  });

  describe('initials', () => {
    it.each([
      ['Sayasith Souvannachack', 'SS'],
      ['Mary Jane Watson', 'MW'],
      ['Prince', 'P'],
      ['ສະບາຍ ດີ', 'ສດ'],
    ])('turns %p into %p', async (name, expected) => {
      await prisma.user.update({
        where: { id: userId },
        data: { fullName: name },
      });

      expect(bodyOf<Profile>(await profile().expect(200)).initials).toBe(
        expected,
      );
    });
  });

  it('needs a token', async () => {
    const response = await request(app.getHttpServer())
      .get('/profile')
      .expect(401);

    expect(bodyOf<ErrorBody>(response).error.code).toBe('UNAUTHENTICATED');
  });
});
