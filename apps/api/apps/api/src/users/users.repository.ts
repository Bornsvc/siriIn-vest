import { NewUser, User } from './user.entity';

/** Raised when a unique field is already taken. Named, so callers can map it. */
export class DuplicateUserError extends Error {
  constructor(readonly field: 'email' | 'phone') {
    super(`A user with that ${field} already exists.`);
    this.name = 'DuplicateUserError';
  }
}

/**
 * The storage seam. Services depend on this, never on a driver — swapping the
 * in-memory store for Postgres is a provider change in `UsersModule` and
 * nothing else.
 */
export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByPhone(phone: string): Promise<User | null>;
  /** Rejects with {@link DuplicateUserError} when email or phone is taken. */
  abstract create(input: NewUser): Promise<User>;
}
