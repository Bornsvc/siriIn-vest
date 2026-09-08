import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { NewUser, User } from './user.entity';
import { DuplicateUserError, UsersRepository } from './users.repository';

/**
 * Process memory, standing in until the account service has a database. The
 * lookup maps are the unique indexes a real schema would carry, so the code
 * that depends on them does not change when the store does.
 *
 * Everything here is lost on restart. That is the honest state of the MVP.
 */
@Injectable()
export class InMemoryUsersRepository extends UsersRepository {
  private readonly byId = new Map<string, User>();
  private readonly idByEmail = new Map<string, string>();
  private readonly idByPhone = new Map<string, string>();

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.byId.get(id) ?? null);
  }

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(this.lookup(this.idByEmail, email));
  }

  findByPhone(phone: string): Promise<User | null> {
    return Promise.resolve(this.lookup(this.idByPhone, phone));
  }

  create(input: NewUser): Promise<User> {
    // The uniqueness check and the write happen in one synchronous block, so
    // no await can interleave between them — the constraint holds the way a
    // unique index would.
    if (this.idByEmail.has(input.email)) {
      return Promise.reject(new DuplicateUserError('email'));
    }
    if (this.idByPhone.has(input.phone)) {
      return Promise.reject(new DuplicateUserError('phone'));
    }

    const user: User = {
      id: randomUUID(),
      ...input,
      status: 'unverified',
      createdAt: new Date(),
    };

    this.byId.set(user.id, user);
    this.idByEmail.set(user.email, user.id);
    this.idByPhone.set(user.phone, user.id);

    return Promise.resolve(user);
  }

  private lookup(index: Map<string, string>, key: string): User | null {
    const id = index.get(key);
    return id ? (this.byId.get(id) ?? null) : null;
  }
}
