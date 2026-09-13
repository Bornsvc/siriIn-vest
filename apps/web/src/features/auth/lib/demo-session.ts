import { USER } from "@/mock/account";
import type { AuthSession } from "./auth-api";
import type { KycSubmissionView } from "./kyc-api";
import type { Profile } from "./profile-api";

/**
 * What demo mode signs everyone in as. The rest of the signed-in shell
 * already runs on this same constant — home, wallet, portfolio — so a demo
 * session and a demo profile just have to agree with it, not invent a
 * second identity for the product to be inconsistent about.
 */
const DEMO_USER_ID = "demo-user";

export function demoSession(): AuthSession {
  return {
    user: {
      id: DEMO_USER_ID,
      fullName: USER.name,
      email: USER.email,
      phone: USER.phone,
      status: USER.kycStatus === "verified" ? "verified" : "unverified",
      createdAt: USER.joinedAt,
    },
    // Never sent anywhere in demo mode, so its contents don't matter — only
    // that `getAccessToken()` sees something and lets the signed-in screens
    // past their own guard.
    accessToken: "demo-token",
    tokenType: "Bearer",
    expiresIn: 60 * 60 * 24 * 365,
  };
}

export function demoProfile(): Profile {
  return { ...USER, id: DEMO_USER_ID };
}

const SUBMISSION_KEY = "siriinvest.demoKycSubmission";

/** So a reload of /verify shows the same receipt, the way the real API would. */
export function saveDemoSubmission(submission: KycSubmissionView): void {
  try {
    window.localStorage.setItem(SUBMISSION_KEY, JSON.stringify(submission));
  } catch {
    // The receipt just will not survive a reload — nothing to recover here.
  }
}

export function getDemoSubmission(): KycSubmissionView | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SUBMISSION_KEY);
    return raw ? (JSON.parse(raw) as KycSubmissionView) : null;
  } catch {
    return null;
  }
}
