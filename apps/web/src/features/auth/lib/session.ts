import type { AuthSession } from "./auth-api";

const KEY = "siriinvest.session";

export interface StoredSession {
  accessToken: string;
  user: AuthSession["user"];
  /** `Date.now()` when the token was issued, so a caller could tell it's stale. */
  issuedAt: number;
  expiresIn: number;
}

/**
 * The one place that knows where the signed-in customer's token lives.
 *
 * Local storage rather than a cookie: there is no server session to keep it
 * for, every call that needs it already runs in the browser, and the KYC
 * upload step needs the raw token to hand the bucket nothing but a signed
 * URL. Every read is wrapped, because a private window or blocked storage
 * must degrade to "signed out", not a crash.
 */
export function saveSession(session: AuthSession): void {
  const stored: StoredSession = {
    accessToken: session.accessToken,
    user: session.user,
    issuedAt: Date.now(),
    expiresIn: session.expiresIn,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Nothing to fall back to — the session just will not survive a reload.
  }
}

export function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return getSession()?.accessToken ?? null;
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Already unreadable, so already as good as cleared.
  }
}
