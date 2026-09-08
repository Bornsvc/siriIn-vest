import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading, AuthProofLine, RegisterForm } from "@/features/auth";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <>
      <AuthHeading
        eyebrow="ສ້າງບັນຊີ"
        title="Create an account"
        description="Takes about two minutes. Identity verification comes next, before your first trade."
      />

      <RegisterForm />

      <p className="mt-7 border-t border-line pt-6 text-[13px] text-ink-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          Log in
        </Link>
      </p>

      <AuthProofLine />
    </>
  );
}
