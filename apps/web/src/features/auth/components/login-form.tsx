"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Note } from "@/shared/ui";
import { ApiError } from "@/shared/lib/api-client";
import { signIn } from "../lib/auth-api";
import { saveSession } from "../lib/session";
import { validateEmail } from "../lib/validation";
import { PasswordInput } from "./password-input";

type Errors = { email?: string; password?: string };

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string>();
  const [showReset, setShowReset] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const next: Errors = {};
    const emailError = validateEmail(email);
    if (emailError) next.email = emailError;
    if (!password) next.password = "Enter your password.";

    setErrors(next);
    if (next.email || next.password) {
      document.getElementById(next.email ? "login-email" : "login-password")
        ?.focus();
      return;
    }

    setPending(true);
    setFormError(undefined);
    try {
      const session = await signIn({ email, password });
      saveSession(session);
      // A customer who never finished the identity check picks up exactly
      // where they left off; everyone else goes straight to their account.
      router.push(session.user.status === "verified" ? "/home" : "/verify");
    } catch (error) {
      setPending(false);

      if (error instanceof ApiError) {
        if (error.code === "INVALID_CREDENTIALS") {
          // A wrong password and an unknown email look identical on purpose —
          // the message says so without pointing at either field.
          setFormError(error.message);
          document.getElementById("login-email")?.focus();
          return;
        }
        if (error.code === "VALIDATION_FAILED" && error.details.length > 0) {
          const fieldErrors: Errors = {};
          for (const detail of error.details) {
            if (detail.field === "email" || detail.field === "password") {
              fieldErrors[detail.field] = detail.message;
            }
          }
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
          document
            .getElementById(fieldErrors.email ? "login-email" : "login-password")
            ?.focus();
          return;
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
        label="Email"
        htmlFor="login-email"
        error={
          errors.email ? <span id="login-email-error">{errors.email}</span> : null
        }
      >
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="name@example.com"
          value={email}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
        />
      </Field>

      <Field
        label="Password"
        htmlFor="login-password"
        error={
          errors.password ? (
            <span id="login-password-error">{errors.password}</span>
          ) : null
        }
      >
        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          onChange={(event) => {
            setPassword(event.target.value);
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <label
          htmlFor="login-remember"
          className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-700"
        >
          <input
            id="login-remember"
            name="remember"
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="size-4 shrink-0 rounded-[4px] border-line-strong accent-brand-700"
          />
          Remember me
        </label>

        <button
          type="button"
          onClick={() => setShowReset((current) => !current)}
          aria-expanded={showReset}
          aria-controls="login-reset-note"
          className="text-[13px] font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {showReset ? (
        <div id="login-reset-note">
          <Note>
            Password reset isn&rsquo;t available yet. Contact support if
            you&rsquo;re locked out.
          </Note>
        </div>
      ) : null}

      {formError ? (
        <p role="alert" className="text-[13px] text-loss">
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
