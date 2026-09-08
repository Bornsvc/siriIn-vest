import type { User } from "@/shared/types";
import { apiRequest } from "@/shared/lib/api-client";

/**
 * The signed-in customer as the shell draws them. The API answers with the
 * field names `User` already uses, plus the id — so this is that type, not a
 * parallel one to keep in step with it.
 */
export type Profile = User & { id: string };

export function fetchProfile(token: string): Promise<Profile> {
  return apiRequest<Profile>("/profile", { token });
}
