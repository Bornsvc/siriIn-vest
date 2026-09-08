import { ApiError, apiRequest } from "@/shared/lib/api-client";
import type { DocumentType } from "./verify";

export type DocumentKindValue = "id_front" | "id_back" | "passport_page" | "selfie";

interface UploadTicket {
  storageKey: string;
  uploadUrl: string;
  method: "PUT";
  /** Sent to the bucket verbatim — the signature is bound to these. */
  headers: Record<string, string>;
  expiresAt: string;
  maxBytes: number;
}

export type KycSubmissionStatus = "in_review" | "approved" | "rejected";

/** A submission as its owner sees it: the document number already masked. */
export interface KycSubmissionView {
  id: string;
  reference: string;
  status: KycSubmissionStatus;
  submittedAt: string;
  reviewedAt: string | null;
  details: {
    fullName: string;
    dateOfBirth: string;
    village: string;
    district: string;
    province: { code: string; name: string };
    fundSource: { code: string; label: string };
  };
  document: {
    type: DocumentType;
    number: string;
  };
  photos: { kind: DocumentKindValue; uploadedAt: string }[];
}

export interface SubmitKycInput {
  fullName: string;
  dateOfBirth: string;
  village: string;
  district: string;
  provinceCode: string;
  fundSourceCode: string;
  documentType: DocumentType;
  documentNumber: string;
  photos: { kind: DocumentKindValue; storageKey: string }[];
}

function requestUpload(
  token: string,
  kind: DocumentKindValue,
  contentType: string,
): Promise<UploadTicket> {
  return apiRequest<UploadTicket>("/kyc/uploads", {
    method: "POST",
    token,
    body: { kind, contentType },
  });
}

/** The signed URL, not the API — the bytes go straight to the bucket. */
async function putToBucket(ticket: UploadTicket, file: File): Promise<void> {
  let response: Response;
  try {
    response = await fetch(ticket.uploadUrl, {
      method: ticket.method,
      headers: ticket.headers,
      body: file,
    });
  } catch {
    throw new Error("The upload did not go through. Try again.");
  }
  if (!response.ok) {
    throw new Error("The upload did not go through. Try again.");
  }
}

/**
 * One photo, start to finish: a ticket, then the bytes. Called the moment a
 * file is chosen, not saved up for the final submit — a ticket is only good
 * for 15 minutes, so asking early and using it immediately is what keeps a
 * slow form fill from expiring it.
 */
export async function uploadKycPhoto(
  token: string,
  kind: DocumentKindValue,
  file: File,
): Promise<string> {
  const ticket = await requestUpload(token, kind, file.type);
  await putToBucket(ticket, file);
  return ticket.storageKey;
}

export function submitKyc(
  token: string,
  input: SubmitKycInput,
): Promise<KycSubmissionView> {
  return apiRequest<KycSubmissionView>("/kyc/submissions", {
    method: "POST",
    token,
    body: input,
  });
}

/** The caller's most recent check. Null for the ordinary case of never having sent one. */
export async function fetchLatestSubmission(
  token: string,
): Promise<KycSubmissionView | null> {
  try {
    return await apiRequest<KycSubmissionView>("/kyc/submissions/me", { token });
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") return null;
    throw error;
  }
}
