/**
 * Three states, because that is what the account screen can draw. A rejected
 * check reads as `unverified`: the customer's next move is the same either way
 * — send it again — and the reason belongs in a notification, not a badge.
 */
export type KycStatus = 'unverified' | 'pending' | 'verified';

/**
 * The signed-in customer, shaped for the app shell.
 *
 * Deliberately the same field names as `User` in
 * `apps/web/src/shared/types/index.ts`, so swapping the mock for this is an
 * import change and nothing else.
 */
export interface Profile {
  id: string;
  name: string;
  email: string;
  /** E.164. Formatting for display is the screen's job. */
  phone: string;
  /** Precomputed here so three components do not each slice the name. */
  initials: string;
  kycStatus: KycStatus;
  joinedAt: string;
}
