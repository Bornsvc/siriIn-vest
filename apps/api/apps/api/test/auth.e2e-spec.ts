import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ApiExceptionFilter } from './../src/common/filters/api-exception.filter';
import { buildValidationPipe } from './../src/common/validation/validation.pipe';
import { PrismaService } from './../src/prisma/prisma.service';

interface SessionBody {
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
  };
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details: { field: string; message: string }[];
  };
}

/** supertest hands back `any`; every assertion below goes through this. */
function bodyOf<T>(response: request.Response): T {
  return response.body as T;
}

const REGISTERED = {
  name: 'Sayasith Souvannachack',
  email: 'sayasith@example.com',
  phone: '20 5551 8842',
  password: 'vientiane1',
  acceptedTerms: true,
};

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleFixture.get(PrismaService);
    app = moduleFixture.createNestApplication();
    // The same pipe and filter main.ts installs — the point of this suite is
    // the whole stack, not the controller in isolation.
    app.useGlobalPipes(buildValidationPipe());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();

    // Whatever a previous run left behind is not this run's fixture.
    await prisma.user.deleteMany();
    await post('/auth/sign-up', REGISTERED).expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  function post(path: string, body: object) {
    return request(app.getHttpServer()).post(path).send(body);
  }

  describe('POST /auth/sign-up', () => {
    it('creates an account and returns a session', async () => {
      const response = await post('/auth/sign-up', {
        ...REGISTERED,
        email: 'new.customer@example.com',
        phone: '20 7777 1234',
      }).expect(201);

      const session = bodyOf<SessionBody>(response);

      expect(session).toMatchObject({
        user: {
          fullName: 'Sayasith Souvannachack',
          email: 'new.customer@example.com',
          phone: '+8562077771234',
          status: 'unverified',
        },
        tokenType: 'Bearer',
      });
      expect(session.accessToken).toEqual(expect.any(String));
      expect(session.user).not.toHaveProperty('passwordHash');
    });

    it('answers a bad field with the message the form shows', async () => {
      const response = await post('/auth/sign-up', {
        ...REGISTERED,
        email: 'someone@example.com',
        phone: '020 5551 8842',
      }).expect(400);

      expect(bodyOf<ErrorBody>(response)).toEqual({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Drop the leading 0 — +856 replaces it.',
          details: [
            {
              field: 'phone',
              message: 'Drop the leading 0 — +856 replaces it.',
            },
          ],
        },
      });
    });

    it('will not open an account without the terms', async () => {
      const response = await post('/auth/sign-up', {
        ...REGISTERED,
        email: 'no.terms@example.com',
        phone: '20 3333 1234',
        acceptedTerms: false,
      }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.details).toEqual([
        {
          field: 'acceptedTerms',
          message: 'Accept the terms to create your account.',
        },
      ]);
    });

    it('rejects a field the DTO never declared', async () => {
      const response = await post('/auth/sign-up', {
        ...REGISTERED,
        email: 'extra.field@example.com',
        phone: '20 4444 1234',
        status: 'verified',
      }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.code).toBe('VALIDATION_FAILED');
    });

    it('refuses an email that is already registered', async () => {
      const response = await post('/auth/sign-up', {
        ...REGISTERED,
        phone: '20 9999 1234',
      }).expect(409);

      expect(bodyOf<ErrorBody>(response).error.code).toBe(
        'EMAIL_ALREADY_REGISTERED',
      );
    });

    it('refuses a phone number that is already registered', async () => {
      const response = await post('/auth/sign-up', {
        ...REGISTERED,
        email: 'second.account@example.com',
      }).expect(409);

      expect(bodyOf<ErrorBody>(response).error.code).toBe(
        'PHONE_ALREADY_REGISTERED',
      );
    });
  });

  describe('POST /auth/sign-in', () => {
    it('returns a session for the right password', async () => {
      const response = await post('/auth/sign-in', {
        identifier: REGISTERED.email,
        password: REGISTERED.password,
      }).expect(200);

      const session = bodyOf<SessionBody>(response);

      expect(session.user.email).toBe(REGISTERED.email);
      expect(session.accessToken).toEqual(expect.any(String));
    });

    it('takes the phone number instead, however it is written', async () => {
      for (const identifier of [
        '20 5551 8842',
        '2055518842',
        '020 5551 8842',
        '+856 20 5551 8842',
      ]) {
        const response = await post('/auth/sign-in', {
          identifier,
          password: REGISTERED.password,
        }).expect(200);

        expect(bodyOf<SessionBody>(response).user.email).toBe(REGISTERED.email);
      }
    });

    it('asks for one field, not two', async () => {
      const response = await post('/auth/sign-in', {
        email: REGISTERED.email,
        password: REGISTERED.password,
      }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.code).toBe('VALIDATION_FAILED');
    });

    it('gives a wrong password and an unknown email the same answer', async () => {
      const wrong = await post('/auth/sign-in', {
        identifier: REGISTERED.email,
        password: 'not-the-one1',
      }).expect(401);

      const unknown = await post('/auth/sign-in', {
        identifier: 'nobody@example.com',
        password: 'not-the-one1',
      }).expect(401);

      expect(bodyOf<ErrorBody>(wrong)).toEqual(bodyOf<ErrorBody>(unknown));
      expect(bodyOf<ErrorBody>(wrong).error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /auth/me', () => {
    it('returns the caller when the token is good', async () => {
      const signIn = await post('/auth/sign-in', {
        identifier: REGISTERED.email,
        password: REGISTERED.password,
      }).expect(200);

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set(
          'Authorization',
          `Bearer ${bodyOf<SessionBody>(signIn).accessToken}`,
        )
        .expect(200);

      expect(bodyOf<SessionBody['user']>(response)).toMatchObject({
        email: REGISTERED.email,
        status: 'unverified',
      });
    });

    it.each([
      ['no header', undefined],
      ['a token that was not signed by us', 'Bearer not.a.token'],
      ['the wrong scheme', 'Basic abcdef'],
    ])('refuses %s', async (_case, header) => {
      const call = request(app.getHttpServer()).get('/auth/me');
      if (header) call.set('Authorization', header);

      const response = await call.expect(401);

      expect(bodyOf<ErrorBody>(response).error.code).toBe('UNAUTHENTICATED');
    });
  });
});
