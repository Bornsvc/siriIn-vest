import type { Metadata } from "next";
import Link from "next/link";
import { AuthHeading, AuthProofLine, LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <>
      <AuthHeading
        eyebrow="ເຂົ້າສູ່ລະບົບ"
        title="Log in"
        description="Pick up where you left off — your holdings, orders and kip balance are waiting."
      />

      <LoginForm />

      <p className="mt-7 border-t border-line pt-6 text-[13px] text-ink-400">
        New to SiriInvest?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          Create an account
        </Link>
      </p>

      <AuthProofLine />
    </>
  );
}
