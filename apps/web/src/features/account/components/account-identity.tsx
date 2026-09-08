"use client";

import { useProfile } from "@/features/auth";
import { Card } from "@/shared/ui";
import { IdentityCard } from "./identity-card";

/**
 * The identity card, once the profile has landed. The waiting state keeps the
 * card's height so the menu below it does not jump when the name arrives.
 */
export function AccountIdentity() {
  const { profile, loading, error } = useProfile();

  if (profile) return <IdentityCard user={profile} />;

  if (loading) {
    return (
      <Card className="p-5 sm:p-6">
        <div aria-hidden className="flex items-start gap-4">
          <span className="size-14 shrink-0 rounded-full bg-line" />
          <div className="min-w-0 flex-1 space-y-2.5 pt-1">
            <span className="block h-4 w-40 rounded bg-line" />
            <span className="block h-3 w-52 rounded bg-line/70" />
            <span className="block h-3 w-32 rounded bg-line/70" />
          </div>
        </div>
        <p className="sr-only">Loading your account</p>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <p className="text-[13px] text-loss">{error}</p>
    </Card>
  );
}
