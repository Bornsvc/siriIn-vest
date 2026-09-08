"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input } from "@/shared/ui";
import { ApiError } from "@/shared/lib/api-client";
import { signUp } from "../lib/auth-api";
import { saveSession } from "../lib/session";
import {
  validateEmail,
  validateLaoPhone,
  validateName,
  validatePassword,
} from "../lib/validation";
import { PasswordInput } from "./password-input";
import { PasswordStrength } from "./password-strength";

type Errors = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  terms?: string;
};

/** Field ids in the order the eye reads them — used to focus the first fault. */
const ORDER = [
  ["name", "register-name"],
  ["email", "register-email"],
  ["phone", "register-phone"],
  ["password", "register-password"],
  ["terms", "register-terms"],
] as const;

/** The API's DTO field names, mapped onto this form's own. */
const FIELD_MAP: Partial<Record<string, keyof Errors>> = {
  name: "name",
  email: "email",
  phone: "phone",
  password: "password",
  acceptedTerms: "terms",
};

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);

  const clear = (key: keyof Errors) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const next: Errors = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      phone: validateLaoPhone(phone) ?? undefined,
      password: validatePassword(password) ?? undefined,
      terms: accepted ? undefined : "Accept the terms to create your account.",
    };

    setErrors(next);
    const firstFault = ORDER.find(([key]) => next[key]);
    if (firstFault) {
      document.getElementById(firstFault[1])?.focus();
      return;
    }

    setPending(true);
    setFormError(undefined);
    try {
      const session = await signUp({
        name,
        email,
        phone,
        password,
        acceptedTerms: accepted,
      });
      saveSession(session);
      // KYC is the next thing that happens: the account is `unverified`
      // until a check clears.
      router.push("/verify");
    } catch (error) {
      setPending(false);

      if (error instanceof ApiError) {
        if (error.code === "EMAIL_ALREADY_REGISTERED") {
          setErrors((prev) => ({ ...prev, email: error.message }));
          document.getElementById("register-email")?.focus();
          return;
        }
        if (error.code === "PHONE_ALREADY_REGISTERED") {
          setErrors((prev) => ({ ...prev, phone: error.message }));
          document.getElementById("register-phone")?.focus();
          return;
        }
        if (error.code === "VALIDATION_FAILED" && error.details.length > 0) {
          const fieldErrors: Errors = {};
          for (const detail of error.details) {
            const key = FIELD_MAP[detail.field];
            if (key) fieldErrors[key] = detail.message;
          }
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
          const fault = ORDER.find(([key]) => fieldErrors[key]);
          if (fault) {
            document.getElementById(fault[1])?.focus();
            return;
          }
        }
        setFormError(error.message);
        return;
      }

      setFormError(
        error instanceof Error ? error.message : "Something went wrong. Try again.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field
        label="Full name"
        htmlFor="register-name"
        hint={<span id="register-name-hint">As it appears on your ID.</span>}
        error={
          errors.name ? <span id="register-name-error">{errors.name}</span> : null
        }
      >
        <Input
          id="register-name"
          name="name"
          autoComplete="name"
          placeholder="Sayasith Souvannachack"
          value={name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={
            errors.name ? "register-name-error" : "register-name-hint"
          }
          onChange={(event) => {
            setName(event.target.value);
            clear("name");
          }}
        />
      </Field>

      <Field
        label="Email"
        htmlFor="register-email"
        error={
          errors.email ? (
            <span id="register-email-error">{errors.email}</span>
          ) : null
        }
      >
        <Input
          id="register-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            clear("email");
          }}
        />
      </Field>

      <Field
        label="Phone number"
        htmlFor="register-phone"
        hint={
          <span id="register-phone-hint">
            Lao mobile number, without the leading 0.
          </span>
        }
        error={
          errors.phone ? (
            <span id="register-phone-error">{errors.phone}</span>
          ) : null
        }
      >
        {/* +856 is furniture, not an editable value — it sits inside the
            field so the number reads the way it is dialled. */}
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-px left-px grid w-[58px] place-items-center border-r border-line font-mono text-[13px] text-ink-500"
          >
            +856
          </span>
          <Input
            id="register-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="20 5551 8842"
            className="pl-[70px] font-mono"
            value={phone}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={
              errors.phone ? "register-phone-error" : "register-phone-hint"
            }
            onChange={(event) => {
              setPhone(event.target.value);
              clear("phone");
            }}
          />
        </div>
      </Field>

      <Field
        label="Password"
        htmlFor="register-password"
        error={
          errors.password ? (
            <span id="register-password-error">{errors.password}</span>
          ) : null
        }
      >
        <PasswordInput
          id="register-password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={
            errors.password
              ? "register-password-error register-password-strength"
              : "register-password-strength"
          }
          onChange={(event) => {
            setPassword(event.target.value);
            clear("password");
          }}
        />
        <PasswordStrength
          password={password}
          id="register-password-strength"
        />
      </Field>

      <div>
        <label
          htmlFor="register-terms"
          className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-relaxed text-ink-700"
        >
          <input
            id="register-terms"
            name="terms"
            type="checkbox"
            checked={accepted}
            aria-invalid={errors.terms ? true : undefined}
            aria-describedby={errors.terms ? "register-terms-error" : undefined}
            onChange={(event) => {
              setAccepted(event.target.checked);
              clear("terms");
            }}
            className="mt-0.5 size-4 shrink-0 rounded-[4px] border-line-strong accent-brand-700"
          />
          <span>
            I agree to the{" "}
            <Link
              href="/legal/terms"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              terms of service
            </Link>{" "}
            and the{" "}
            <Link
              href="/legal/privacy"
              className="font-medium text-brand-700 underline underline-offset-2"
            >
              privacy policy
            </Link>
            .
          </span>
        </label>
        {errors.terms ? (
          <p id="register-terms-error" className="mt-1.5 text-[12px] text-loss">
            {errors.terms}
          </p>
        ) : null}
      </div>

      {formError ? (
        <p role="alert" className="text-[13px] text-loss">
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
