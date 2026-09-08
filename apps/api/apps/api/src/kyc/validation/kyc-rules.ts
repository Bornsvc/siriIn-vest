/**
 * The identity-check rules, kept in step with the three steps of the form in
 * `apps/web/src/features/auth/lib/validation.ts`. Same input, same sentence —
 * the browser answers first, this one decides.
 */

export const DOCUMENT_TYPES = ['national_id', 'passport'] as const;
export type DocumentTypeValue = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_KINDS = [
  'id_front',
  'id_back',
  'passport_page',
  'selfie',
] as const;
export type DocumentKindValue = (typeof DOCUMENT_KINDS)[number];

/** Which photos each document type has to arrive with. */
export const REQUIRED_DOCUMENTS: Record<
  DocumentTypeValue,
  readonly DocumentKindValue[]
> = {
  national_id: ['id_front', 'id_back', 'selfie'],
  passport: ['passport_page', 'selfie'],
};

/** The same ceiling the upload field enforces in the browser. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateDateOfBirth(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return 'Enter your date of birth.';
  if (!ISO_DATE.test(value)) return 'Enter a date like 1994-07-21.';

  const born = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(born.getTime())) return 'Enter a date like 1994-07-21.';

  const today = new Date();
  if (born > today) return 'Enter a date in the past.';

  let age = today.getUTCFullYear() - born.getUTCFullYear();
  const beforeBirthday =
    today.getUTCMonth() < born.getUTCMonth() ||
    (today.getUTCMonth() === born.getUTCMonth() &&
      today.getUTCDate() < born.getUTCDate());
  if (beforeBirthday) age -= 1;

  if (age < 18)
    return 'You have to be 18 or older to hold a brokerage account.';
  if (age > 110) return 'Check the year — that is more than 110 years ago.';
  return null;
}

function place(what: string) {
  return (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? null : `Enter your ${what}.`;
}

export const validateVillage = place('village');
export const validateDistrict = place('district');

/** Shape only. Whether the row exists is the database's answer, not a regex's. */
function code(what: string) {
  return (value: unknown): string | null => {
    if (typeof value !== 'string' || !value.trim())
      return `Select your ${what}.`;
    return /^[a-z]+(-[a-z]+)*$/.test(value) ? null : `Select your ${what}.`;
  };
}

export const validateProvinceCode = code('province');

export function validateFundSourceCode(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Select where the money you invest comes from.';
  }
  return /^[a-z]+$/.test(value)
    ? null
    : 'Select where the money you invest comes from.';
}

export function validateDocumentType(value: unknown): string | null {
  return DOCUMENT_TYPES.includes(value as DocumentTypeValue)
    ? null
    : 'Choose a Lao ID card or a passport.';
}

export function validateDocumentKind(value: unknown): string | null {
  return DOCUMENT_KINDS.includes(value as DocumentKindValue)
    ? null
    : 'That is not a photo this check asks for.';
}

/**
 * A passport number and an ID card number are different shapes, so this one
 * rule has to see the document type beside it.
 */
export function validateDocumentNumber(
  value: unknown,
  object?: unknown,
): string | null {
  const type = (object as { documentType?: unknown })?.documentType;
  const trimmed = typeof value === 'string' ? value.trim() : '';

  if (type === 'passport') {
    if (!trimmed) return 'Enter your passport number.';
    const compact = trimmed.replace(/[\s-]/g, '').toUpperCase();
    return /^[A-Z0-9]{6,12}$/.test(compact)
      ? null
      : 'Enter 6 to 12 letters and digits, like P1234567.';
  }

  if (!trimmed) return 'Enter the number printed on your ID card.';
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 14
    ? null
    : 'Enter the 8 to 14 digit number printed on your ID card.';
}

/**
 * The object name in the bucket. Rejects anything that could climb out of the
 * prefix it was handed — a storage key is built by us, never chosen freely.
 */
export function validateStorageKey(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Upload the photo before submitting.';
  }
  if (value.length > 512) return 'That upload reference is too long.';
  if (value.startsWith('/') || value.includes('..') || /[\s\\]/.test(value)) {
    return 'That upload reference is not one of ours.';
  }
  return null;
}

/**
 * An allowlist rather than `image/*`: a reviewer has to be able to open the
 * file, and the extension a storage key gets is derived from this.
 */
export const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

export function validateImageContentType(value: unknown): string | null {
  return typeof value === 'string' && value.toLowerCase() in IMAGE_TYPES
    ? null
    : 'Use a photo — JPEG, PNG or HEIC.';
}

/** Checked against what the bucket says it holds, not against a claim. */
export function validateByteSize(value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return 'That photo did not finish uploading. Try again.';
  }
  return value > MAX_UPLOAD_BYTES
    ? 'That photo is over 10 MB. Try again at a lower resolution.'
    : null;
}

/** Shown back on the review screen — the last four are enough to recognise. */
export function maskDocumentNumber(value: string): string {
  const compact = value.replace(/\s+/g, '');
  if (compact.length <= 4) return compact;
  return `${'•'.repeat(Math.min(compact.length - 4, 8))}${compact.slice(-4)}`;
}
