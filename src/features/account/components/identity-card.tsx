import type { KycStatus, User } from "@/shared/types";
import { formatDate } from "@/shared/lib/format";
import { Badge, ButtonLink, Card } from "@/shared/ui";
import { IconShield } from "@/shared/ui/icons";

/** Verification is a fact about the account, so it is stated, not implied. */
const KYC: Record<
  KycStatus,
  { tone: "gain" | "warn" | "loss"; label: string; note: string }
> = {
  verified: {
    tone: "gain",
    label: "Identity verified",
    note: "Trading, deposits and withdrawals are open.",
  },
  pending: {
    tone: "warn",
    label: "Verification in review",
    note: "Documents are with the reviewer. This usually clears within a day.",
  },
  unverified: {
    tone: "loss",
    label: "Identity not verified",
    note: "Verify your identity to place your first trade.",
  },
};

export function IdentityCard({ user }: { user: User }) {
  const kyc = KYC[user.kycStatus];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <span
          aria-hidden
          className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-800 font-display text-[18px] font-semibold tracking-tight text-white"
        >
          {user.initials}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-[18px] font-medium tracking-tight text-ink-950">
            {user.name}
          </h2>
          <p className="mt-0.5 truncate text-[13px] text-ink-400">
            {user.email}
          </p>
          <p data-numeric className="mt-0.5 truncate font-mono text-[12px] text-ink-400">
            {user.phone}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <Badge tone={kyc.tone}>
              <IconShield className="size-3.5" />
              {kyc.label}
            </Badge>
            <span className="text-[12px] text-ink-400">
              Member since{" "}
              <span data-numeric>{formatDate(user.joinedAt)}</span>
            </span>
          </div>

          <p className="mt-2 text-[12px] leading-relaxed text-ink-400">
            {kyc.note}
          </p>
        </div>

        {user.kycStatus !== "verified" ? (
          <ButtonLink href="/verify" variant="secondary" size="sm">
            Finish verification
          </ButtonLink>
        ) : null}
      </div>
    </Card>
  );
}
