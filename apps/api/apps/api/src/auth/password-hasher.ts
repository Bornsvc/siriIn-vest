import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * The hashing seam. Cost and algorithm are an implementation detail; moving to
 * argon2 later is a provider swap, and the stored prefix says which made a hash.
 */
export abstract class PasswordHasher {
  abstract hash(plain: string): Promise<string>;
  abstract verify(plain: string, hash: string): Promise<boolean>;
  /**
   * A hash of nothing in particular, to compare against when no account
   * matched — so a miss costs the same time as a hit and the response cannot
   * be timed to tell whether an email is registered.
   */
  abstract decoyHash(): Promise<string>;
}

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  private static readonly COST = 12;

  private decoy: Promise<string> | null = null;

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, BcryptPasswordHasher.COST);
  }

  verify(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  decoyHash(): Promise<string> {
    // Computed once, then reused: the cost per miss stays the cost of one
    // comparison rather than a comparison plus a fresh hash.
    this.decoy ??= bcrypt.hash(randomUUID(), BcryptPasswordHasher.COST);
    return this.decoy;
  }
}
