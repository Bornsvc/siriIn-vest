/** Identity is verified once, before the account can hold money or trade. */
export type UserStatus = 'unverified' | 'verified';

export interface User {
  id: string;
  fullName: string;
  /** Normalized: trimmed and lower-cased. Unique. */
  email: string;
  /** E.164, +856 followed by the national digits. Unique. */
  phone: string;
  passwordHash: string;
  status: UserStatus;
  acceptedTermsAt: Date;
  createdAt: Date;
}

export interface NewUser {
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  acceptedTermsAt: Date;
}

/** What leaves the process. The hash is not on it, and never will be. */
export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: UserStatus;
  createdAt: string;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}
