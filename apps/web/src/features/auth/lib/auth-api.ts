import { apiRequest } from "@/shared/lib/api-client";

/** The account's own status, distinct from a KYC submission's — a customer
    stays `unverified` until a reviewer approves a check. */
export type UserStatus = "unverified" | "verified";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: UserStatus;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

/** `phone` is the national part only — +856 is furniture on the form. */
export function signUp(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  acceptedTerms: boolean;
}): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/sign-up", {
    method: "POST",
    body: input,
  });
}

/** `identifier` is an email address or a Lao phone number — one field. */
export function signIn(input: {
  identifier: string;
  password: string;
}): Promise<AuthSession> {
  return apiRequest<AuthSession>("/auth/sign-in", {
    method: "POST",
    body: input,
  });
}
