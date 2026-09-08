import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PublicUser, toPublicUser, User } from '../users/user.entity';
import { DuplicateUserError, UsersRepository } from '../users/users.repository';
import { AUTH_CONFIG, AuthConfig } from './auth.config';
import {
  emailAlreadyRegistered,
  invalidCredentials,
  phoneAlreadyRegistered,
  unauthenticated,
} from './auth.errors';
import { AuthSession } from './auth.types';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { PasswordHasher } from './password-hasher';
import {
  laoPhoneToE164,
  normalizeEmail,
  normalizeFullName,
  toE164LaoPhone,
} from './validation/account-rules';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwords: PasswordHasher,
    private readonly jwt: JwtService,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  /**
   * Opens an account. The customer is `unverified` until KYC clears — the
   * register form sends them straight to /verify for exactly that reason.
   */
  async signUp(dto: SignUpDto): Promise<AuthSession> {
    const email = normalizeEmail(dto.email);
    const phone = toE164LaoPhone(dto.phone);

    // Asked first so the common case gets a precise 409 naming the field,
    // and asked again by the repository's unique indexes so a race between
    // two sign-ups cannot land two accounts on one email.
    if (await this.users.findByEmail(email)) throw emailAlreadyRegistered();
    if (await this.users.findByPhone(phone)) throw phoneAlreadyRegistered();

    const passwordHash = await this.passwords.hash(dto.password);

    try {
      const user = await this.users.create({
        fullName: normalizeFullName(dto.name),
        email,
        phone,
        passwordHash,
        acceptedTermsAt: new Date(),
      });
      return await this.issue(user);
    } catch (error) {
      if (error instanceof DuplicateUserError) {
        throw error.field === 'email'
          ? emailAlreadyRegistered()
          : phoneAlreadyRegistered();
      }
      throw error;
    }
  }

  async signIn(dto: SignInDto): Promise<AuthSession> {
    const user = await this.findByIdentifier(dto.identifier);

    // Compared even when no account matched, against a hash of nothing, so
    // the two outcomes take the same time and cannot be told apart.
    const hash = user?.passwordHash ?? (await this.passwords.decoyHash());
    const matches = await this.passwords.verify(dto.password, hash);

    if (!user || !matches) throw invalidCredentials();

    return this.issue(user);
  }

  /**
   * Email or phone, decided by the shape of what was typed. A phone that
   * cannot be parsed resolves to no account rather than an error, so a
   * malformed number and an unregistered one are answered identically.
   */
  private findByIdentifier(identifier: string): Promise<User | null> {
    const trimmed = identifier.trim();

    if (trimmed.includes('@')) {
      return this.users.findByEmail(normalizeEmail(trimmed));
    }

    const phone = laoPhoneToE164(trimmed);
    return phone ? this.users.findByPhone(phone) : Promise.resolve(null);
  }

  /** The caller's own record. Anything else is another endpoint's job. */
  async profile(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      // A signed token for an account that is gone: valid signature, no
      // subject. Until there is a database, a restart is the usual cause.
      throw unauthenticated('Your session is no longer valid. Sign in again.');
    }
    return toPublicUser(user);
  }

  private async issue(user: User): Promise<AuthSession> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      user: toPublicUser(user),
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.config.ttlSeconds,
    };
  }
}
