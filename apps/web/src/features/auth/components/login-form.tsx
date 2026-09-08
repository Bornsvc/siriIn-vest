"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Note } from "@/shared/ui";
import { ApiError } from "@/shared/lib/api-client";
import { signIn } from "../lib/auth-api";
import { saveSession } from "../lib/session";
import { validateSignInIdentifier } from "../lib/validation";
import { PasswordInput } from "./password-input";

type Errors = { identifier?: string; password?: string };

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
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
    const identifierError = validateSignInIdentifier(identifier);
    if (identifierError) next.identifier = identifierError;
    if (!password) next.password = "Enter your password.";

    setErrors(next);
    if (next.identifier || next.password) {
      document
        .getElementById(next.identifier ? "login-identifier" : "login-password")
        ?.focus();
      return;
    }

    setPending(true);
    setFormError(undefined);
    try {
      const session = await signIn({ identifier, password });
      saveSession(session);
      // A customer who never finished the identity check picks up exactly
      // where they left off; everyone else goes straight to their account.
      router.push(session.user.status === "verified" ? "/home" : "/verify");
    } catch (error) {
      setPending(false);

      if (error instanceof ApiError) {
        if (error.code === "INVALID_CREDENTIALS") {
          // A wrong password and an unregistered email or phone look
          // identical on purpose — the message says so without pointing at
          // either field.
          setFormError(error.message);
          document.getElementById("login-identifier")?.focus();
          return;
        }
        if (error.code === "VALIDATION_FAILED" && error.details.length > 0) {
          const fieldErrors: Errors = {};
          for (const detail of error.details) {
            if (detail.field === "identifier" || detail.field === "password") {
              fieldErrors[detail.field] = detail.message;
            }
          }
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
          document
            .getElementById(
              fieldErrors.identifier ? "login-identifier" : "login-password",
            )
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
        label="Email or phone"
        htmlFor="login-identifier"
        hint={
          errors.identifier ? null : (
            <span id="login-identifier-hint">
              Whichever you signed up with. The country code is optional.
            </span>
          )
        }
        error={
          errors.identifier ? (
            <span id="login-identifier-error">{errors.identifier}</span>
          ) : null
        }
      >
        {/* Not `type="email"`: the browser would refuse a phone number before
            the form ever sees it. `username` is the autocomplete token that
            covers both. */}
        <Input
          id="login-identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder="name@example.com or 20 5551 8842"
          value={identifier}
          aria-invalid={errors.identifier ? true : undefined}
          aria-describedby={
            errors.identifier ? "login-identifier-error" : "login-identifier-hint"
          }
          onChange={(event) => {
            setIdentifier(event.target.value);
            if (errors.identifier) {
              setErrors((prev) => ({ ...prev, identifier: undefined }));
            }
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
