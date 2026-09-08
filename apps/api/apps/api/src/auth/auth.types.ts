import { PublicUser } from '../users/user.entity';

/** Claims we sign. Nothing here is secret; it is signed, not encrypted. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
}

/** What a guard puts on the request once a token checks out. */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

/** The body of a successful sign-up or sign-in. */
export interface AuthSession {
  user: PublicUser;
  accessToken: string;
  tokenType: 'Bearer';
  /** Seconds until the access token expires. */
  expiresIn: number;
}
