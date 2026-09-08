/**
 * The account rules, kept word for word in step with the signed-out forms in
 * `apps/web/src/features/auth/lib/validation.ts`. The browser checks first so
 * the customer gets an answer without a round trip; this is the copy that
 * decides, because a form is a convenience and never a control.
 *
 * Every message says what to fix and how — never "oops", never "invalid".
 */

/** Deliberately loose: shape only. Real verification is the email we send. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateFullName(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim())
    return 'Enter your full name.';
  if (value.trim().length < 2) {
    return 'Enter your name as it appears on your ID.';
  }
  return null;
}

export function validateEmail(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Enter your email address.';
  }
  if (!EMAIL_SHAPE.test(value.trim())) {
    return 'Enter an email address like name@example.com.';
  }
  return null;
}

/**
 * The +856 country code is a fixed adornment on the field, so this validates
 * only the national part: 8–10 digits, no leading zero.
 */
export function validateLaoPhone(value: unknown): string | null {
  if (typeof value !== 'string') return 'Enter your phone number.';
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Enter your phone number.';
  if (digits.startsWith('0')) return 'Drop the leading 0 — +856 replaces it.';
  if (digits.length < 8 || digits.length > 10) {
    return 'Enter 8 to 10 digits after +856, like 20 5551 8842.';
  }
  return null;
}

export type StrengthLevel = 0 | 1 | 2 | 3;

export interface PasswordStrength {
  level: StrengthLevel;
  label: string;
  /** The one honest next step, or null when nothing is left to add. */
  advice: string | null;
}

/** Lower-case, upper-case, digit, everything else. */
const CHARACTER_CLASSES = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];

/**
 * Length plus variety, and that is all it claims to measure. It does not
 * pretend to know about dictionaries or breach lists.
 */
export function scorePassword(password: string): PasswordStrength {
  if (!password) {
    return {
      level: 0,
      label: '',
      advice: 'At least 8 characters, mixing letters with numbers or symbols.',
    };
  }

  const variety = CHARACTER_CLASSES.filter((re) => re.test(password)).length;

  if (password.length < 8) {
    return { level: 1, label: 'Weak', advice: 'Use at least 8 characters.' };
  }
  if (variety < 2) {
    return {
      level: 1,
      label: 'Weak',
      advice: 'Mix in a capital letter, a number or a symbol.',
    };
  }
  if (password.length >= 12 && variety >= 3) {
    return { level: 3, label: 'Strong', advice: null };
  }
  return {
    level: 2,
    label: 'Fair',
    advice:
      password.length < 12
        ? 'Make it 12 characters or more.'
        : 'Mix in a third kind of character.',
  };
}

/** A password has to reach Fair before it can open an account. */
export function validatePassword(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return 'Create a password.';
  const strength = scorePassword(value);
  if (strength.level < 2) {
    return strength.advice ?? 'Use a longer, more varied password.';
  }
  return null;
}

/** Sign-in only asks that something was typed; the hash decides the rest. */
export function validateGivenPassword(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return 'Enter your password.';
  return null;
}

/** Case and stray whitespace must not create a second account. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** One space between name parts, none at the ends. */
export function normalizeFullName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** Stored E.164, the way it is dialled: +856 then the national digits. */
export function toE164LaoPhone(value: string): string {
  return `+856${value.replace(/\D/g, '')}`;
}

/**
 * The forgiving counterpart, for signing in.
 *
 * Sign-up insists on the national part alone, because the form puts +856
 * beside the field and a customer is reading it off their own SIM. Signing in
 * is a different moment: they type the number the way they hold it in their
 * head — with the country code, with the trunk zero, with spaces — and any of
 * those should find the account rather than be corrected.
 *
 * Returns null when nothing sensible can be made of it.
 */
export function laoPhoneToE164(value: string): string | null {
  let digits = value.trim().replace(/[\s\-().]/g, '');

  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);

  if (!/^\d+$/.test(digits)) return null;

  // A national number never begins 856 — the mobile prefixes are 20 and 30 —
  // so a leading 856 is the country code, not part of the subscriber number.
  if (digits.startsWith('856')) digits = digits.slice(3);

  // The trunk zero, which +856 replaces. Only one: 0055… is not a number.
  digits = digits.replace(/^0/, '');

  if (digits.length < 8 || digits.length > 10) return null;
  return `+856${digits}`;
}

/**
 * Sign-in takes either. An `@` is the only thing that separates the two
 * intentions — no Lao phone number contains one, and no email omits one.
 */
export function validateSignInIdentifier(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return 'Enter your email or phone number.';
  }

  const trimmed = value.trim();
  if (trimmed.includes('@')) return validateEmail(trimmed);

  return laoPhoneToE164(trimmed)
    ? null
    : 'Enter the email or phone number you signed up with.';
}
