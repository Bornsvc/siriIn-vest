import { JwtService } from '@nestjs/jwt';
import { ApiErrorCode, ApiException } from '../common/errors/api-error';
import { InMemoryUsersRepository } from '../users/in-memory-users.repository';
import { AuthConfig } from './auth.config';
import { AuthService } from './auth.service';
import { AccessTokenPayload } from './auth.types';
import { PasswordHasher } from './password-hasher';

/** Real bcrypt is deliberately slow; the service does not care which it got. */
class FakePasswordHasher extends PasswordHasher {
  hash(plain: string): Promise<string> {
    return Promise.resolve(`hashed:${plain}`);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${plain}`);
  }

  decoyHash(): Promise<string> {
    return Promise.resolve('hashed:__decoy__');
  }
}

const CONFIG: AuthConfig = { secret: 'test-secret', ttlSeconds: 900 };

const SIGN_UP = {
  name: 'Sayasith Souvannachack',
  email: 'Name@Example.com',
  phone: '20 5551 8842',
  password: 'vientiane1',
  acceptedTerms: true as const,
};

describe('AuthService', () => {
  let users: InMemoryUsersRepository;
  let jwt: JwtService;
  let service: AuthService;

  beforeEach(() => {
    users = new InMemoryUsersRepository();
    jwt = new JwtService({
      secret: CONFIG.secret,
      signOptions: { expiresIn: CONFIG.ttlSeconds },
    });
    service = new AuthService(users, new FakePasswordHasher(), jwt, CONFIG);
  });

  describe('signUp', () => {
    it('opens an unverified account and returns a usable session', async () => {
      const session = await service.signUp({ ...SIGN_UP });

      expect(session.user.status).toBe('unverified');
      expect(session.tokenType).toBe('Bearer');
      expect(session.expiresIn).toBe(900);

      const payload = jwt.verify<AccessTokenPayload>(session.accessToken);
      expect(payload.sub).toBe(session.user.id);
      expect(payload.email).toBe('name@example.com');
    });

    it('never puts the password hash on the response', async () => {
      const session = await service.signUp({ ...SIGN_UP });

      expect(JSON.stringify(session)).not.toContain('hashed:');
      expect(session.user).not.toHaveProperty('passwordHash');
    });

    it('stores the email folded and the phone in E.164', async () => {
      const session = await service.signUp({ ...SIGN_UP });

      expect(session.user.email).toBe('name@example.com');
      expect(session.user.phone).toBe('+8562055518842');
      expect(session.user.fullName).toBe('Sayasith Souvannachack');
    });

    it('rejects an email that differs only by case', async () => {
      await service.signUp({ ...SIGN_UP });

      await expect(
        codeOf(service.signUp({ ...SIGN_UP, email: 'NAME@example.com' })),
      ).resolves.toBe(ApiErrorCode.EMAIL_ALREADY_REGISTERED);
    });

    it('rejects a phone that differs only by spacing', async () => {
      await service.signUp({ ...SIGN_UP });

      await expect(
        codeOf(
          service.signUp({
            ...SIGN_UP,
            email: 'other@example.com',
            phone: '2055518842',
          }),
        ),
      ).resolves.toBe(ApiErrorCode.PHONE_ALREADY_REGISTERED);
    });

    it('names the field that clashed, so the form can point at it', async () => {
      await service.signUp({ ...SIGN_UP });

      const error = await failure(service.signUp({ ...SIGN_UP }));

      expect(error.body.error.details).toEqual([
        { field: 'email', message: expect.any(String) as string },
      ]);
    });
  });

  describe('signIn', () => {
    beforeEach(async () => {
      await service.signUp({ ...SIGN_UP });
    });

    it('returns a session for the right password', async () => {
      const session = await service.signIn({
        identifier: 'name@example.com',
        password: 'vientiane1',
      });

      expect(session.user.email).toBe('name@example.com');
      expect(session.accessToken).toEqual(expect.any(String));
    });

    it('accepts the email in any case', async () => {
      await expect(
        service.signIn({
          identifier: '  NAME@Example.com ',
          password: 'vientiane1',
        }),
      ).resolves.toBeDefined();
    });

    it('rejects a wrong password', async () => {
      await expect(
        codeOf(
          service.signIn({
            identifier: 'name@example.com',
            password: 'wrong-one1',
          }),
        ),
      ).resolves.toBe(ApiErrorCode.INVALID_CREDENTIALS);
    });

    it.each([
      ['the national part, as sign-up took it', '20 5551 8842'],
      ['no spaces', '2055518842'],
      ['the trunk zero the form rejects', '020 5551 8842'],
      ['the country code written out', '+856 20 5551 8842'],
      ['the country code without a plus', '8562055518842'],
      ['the international prefix', '008562055518842'],
    ])('signs in by phone written %s', async (_case, identifier) => {
      const session = await service.signIn({
        identifier,
        password: 'vientiane1',
      });

      expect(session.user.phone).toBe('+8562055518842');
    });

    it('does not treat an unparseable phone as an error of its own', async () => {
      await expect(
        codeOf(service.signIn({ identifier: '12', password: 'vientiane1' })),
      ).resolves.toBe(ApiErrorCode.INVALID_CREDENTIALS);
    });

    it('answers an unknown identifier exactly as it answers a wrong password', async () => {
      const unknown = await failure(
        service.signIn({
          identifier: 'nobody@example.com',
          password: 'vientiane1',
        }),
      );
      const wrong = await failure(
        service.signIn({
          identifier: 'name@example.com',
          password: 'wrong-one1',
        }),
      );

      expect(unknown.body).toEqual(wrong.body);
      expect(unknown.getStatus()).toBe(wrong.getStatus());
    });
  });

  describe('profile', () => {
    it('returns the caller', async () => {
      const session = await service.signUp({ ...SIGN_UP });

      await expect(service.profile(session.user.id)).resolves.toEqual(
        session.user,
      );
    });

    it('refuses a token whose account is gone', async () => {
      await expect(
        codeOf(service.profile('11111111-2222-3333-4444-555555555555')),
      ).resolves.toBe(ApiErrorCode.UNAUTHENTICATED);
    });
  });
});

/** Resolves with the error the call raised, or fails the test if it succeeded. */
async function failure(action: Promise<unknown>): Promise<ApiException> {
  try {
    await action;
  } catch (error) {
    if (error instanceof ApiException) return error;
    throw error;
  }
  throw new Error('Expected the call to be rejected, but it resolved.');
}

async function codeOf(action: Promise<unknown>): Promise<string> {
  return (await failure(action)).body.error.code;
}
