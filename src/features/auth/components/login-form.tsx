"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, Input, Note } from "@/shared/ui";
import { validateEmail } from "../lib/validation";
import { PasswordInput } from "./password-input";

type Errors = { email?: string; password?: string };

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [showReset, setShowReset] = useState(false);
  const [pending, setPending] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    // There is no backend in the MVP. The pending state is the honest part:
    // it is what the customer will see when there is one.
    setPending(true);
    timer.current = setTimeout(() => router.push("/home"), 600);
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
            Password reset arrives with the account service. Until then any
            email and password will get you in.
          </Note>
        </div>
      ) : null}

      <Button type="submit" size="lg" block disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
