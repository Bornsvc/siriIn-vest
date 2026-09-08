import type { DocumentType } from "./verify";

/**
 * Client-side validation for the signed-out forms.
 *
 * Every message says what to fix and how — never "oops", never "invalid".
 * These are pure functions so the forms stay declarative and testable.
 */

/** Deliberately loose: shape only. Real verification is the email we send. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateName(value: string): string | null {
  if (!value.trim()) return "Enter your full name.";
  if (value.trim().length < 2) return "Enter your name as it appears on your ID.";
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value.trim()) return "Enter your email address.";
  if (!EMAIL_SHAPE.test(value.trim())) {
    return "Enter an email address like name@example.com.";
  }
  return null;
}

/**
 * The +856 country code is a fixed adornment on the field, so this validates
 * only the national part: 8–10 digits, no leading zero.
 */
export function validateLaoPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Enter your phone number.";
  if (digits.startsWith("0")) return "Drop the leading 0 — +856 replaces it.";
  if (digits.length < 8 || digits.length > 10) {
    return "Enter 8 to 10 digits after +856, like 20 5551 8842.";
  }
  return null;
}

export type StrengthLevel = 0 | 1 | 2 | 3;

export type PasswordStrength = {
  level: StrengthLevel;
  /** A word, not just a colour — the meter has to read in greyscale. */
  label: string;
  /** The one honest next step, or null when nothing is left to add. */
  advice: string | null;
};

/** Lower-case, upper-case, digit, everything else. */
const CHARACTER_CLASSES = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/];

/**
 * Length plus variety, and that is all it claims to measure. It does not
 * pretend to know about dictionaries or breach lists, so it never tells a
 * customer that "Vientiane1!" is strong on the strength of its symbols alone —
 * twelve characters is the bar for the top level.
 */
export function scorePassword(password: string): PasswordStrength {
  if (!password) {
    return {
      level: 0,
      label: "",
      advice: "At least 8 characters, mixing letters with numbers or symbols.",
    };
  }

  const variety = CHARACTER_CLASSES.filter((re) => re.test(password)).length;

  if (password.length < 8) {
    return { level: 1, label: "Weak", advice: "Use at least 8 characters." };
  }
  if (variety < 2) {
    return {
      level: 1,
      label: "Weak",
      advice: "Mix in a capital letter, a number or a symbol.",
    };
  }
  if (password.length >= 12 && variety >= 3) {
    return { level: 3, label: "Strong", advice: null };
  }
  return {
    level: 2,
    label: "Fair",
    advice:
      password.length < 12
        ? "Make it 12 characters or more."
        : "Mix in a third kind of character.",
  };
}

/** A password has to reach Fair before it can open an account. */
export function validatePassword(value: string): string | null {
  if (!value) return "Create a password.";
  const strength = scorePassword(value);
  if (strength.level < 2) {
    return strength.advice ?? "Use a longer, more varied password.";
  }
  return null;
}

/* ------------------------------------------------------------------
   Identity check
   ------------------------------------------------------------------ */

/** A brokerage account holder has to be an adult, and the ID has to prove it. */
export function validateDateOfBirth(value: string): string | null {
  if (!value) return "Enter your date of birth.";

  const born = new Date(`${value}T00:00:00`);
  if (Number.isNaN(born.getTime())) return "Enter a date like 1994-07-21.";

  const today = new Date();
  if (born > today) return "Enter a date in the past.";

  let age = today.getFullYear() - born.getFullYear();
  const beforeBirthday =
    today.getMonth() < born.getMonth() ||
    (today.getMonth() === born.getMonth() && today.getDate() < born.getDate());
  if (beforeBirthday) age -= 1;

  if (age < 18) return "You have to be 18 or older to hold a brokerage account.";
  if (age > 110) return "Check the year — that is more than 110 years ago.";
  return null;
}

/**
 * Village, district and province are presence checks. A reviewer reads the
 * address against the document; no parser is going to do better.
 */
export function validatePlace(value: string, what: string): string | null {
  if (!value.trim()) return `Enter your ${what}.`;
  return null;
}

/**
 * Shape only, and different shapes per document. Whether the number belongs to
 * the person is what the reviewer and the document photo settle.
 */
export function validateIdNumber(
  value: string,
  type: DocumentType,
): string | null {
  const trimmed = value.trim();

  if (type === "passport") {
    if (!trimmed) return "Enter your passport number.";
    const compact = trimmed.replace(/[\s-]/g, "").toUpperCase();
    if (!/^[A-Z0-9]{6,12}$/.test(compact)) {
      return "Enter 6 to 12 letters and digits, like P1234567.";
    }
    return null;
  }

  if (!trimmed) return "Enter the number printed on your ID card.";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 14) {
    return "Enter the 8 to 14 digit number printed on your ID card.";
  }
  return null;
}

/** 10 MB is what the reviewer's tooling accepts, so it is what we accept. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function validateUpload(file: File | null, what: string): string | null {
  if (!file) return `Add a photo of ${what}.`;
  if (!file.type.startsWith("image/")) {
    return "Use a photo — JPEG, PNG or HEIC.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "That photo is over 10 MB. Try again at a lower resolution.";
  }
  return null;
}
