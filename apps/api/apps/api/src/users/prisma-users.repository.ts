import { Injectable } from '@nestjs/common';
import { Prisma, type User as UserRow } from '@db';
import { PrismaService } from '../prisma/prisma.service';
import { NewUser, User } from './user.entity';
import { DuplicateUserError, UsersRepository } from './users.repository';

/** Postgres' unique-violation code, as Prisma reports it. */
const UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    return toUser(await this.prisma.user.findUnique({ where: { id } }));
  }

  async findByEmail(email: string): Promise<User | null> {
    return toUser(await this.prisma.user.findUnique({ where: { email } }));
  }

  async findByPhone(phone: string): Promise<User | null> {
    return toUser(await this.prisma.user.findUnique({ where: { phone } }));
  }

  async create(input: NewUser): Promise<User> {
    try {
      return toUser(await this.prisma.user.create({ data: input }))!;
    } catch (error) {
      // The unique indexes are the real check. The service asks first for a
      // precise message, but two sign-ups racing each other land here.
      const field = duplicatedField(error);
      if (field) throw new DuplicateUserError(field);
      throw error;
    }
  }
}

/** Which unique index rejected the write, or null if it was not a duplicate. */
function duplicatedField(error: unknown): 'email' | 'phone' | null {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== UNIQUE_VIOLATION
  ) {
    return null;
  }

  const constraint = constraintOf(error.meta);
  if (constraint.includes('email')) return 'email';
  if (constraint.includes('phone')) return 'phone';
  return null;
}

/**
 * The name of the index Postgres refused. Prisma 7 routes SQL through a driver
 * adapter and reports the constraint underneath it (`users_email_key`); the
 * pre-adapter shape put a column list on `meta.target`. Both are read, neither
 * is assumed, and `prisma-users.repository.e2e-spec.ts` pins the shape by
 * provoking a real duplicate rather than trusting this comment.
 */
function constraintOf(meta: unknown): string {
  const index = dig(meta, 'driverAdapterError', 'cause', 'constraint', 'index');
  if (typeof index === 'string') return index;

  const target = dig(meta, 'target');
  return typeof target === 'string' ? target : JSON.stringify(target ?? '');
}

function dig(value: unknown, ...keys: string[]): unknown {
  return keys.reduce<unknown>(
    (current, key) =>
      typeof current === 'object' && current !== null
        ? (current as Record<string, unknown>)[key]
        : undefined,
    value,
  );
}

/** The row is already the domain shape; this only narrows the enum. */
function toUser(row: UserRow | null): User | null {
  return row === null ? null : { ...row, status: row.status };
}
