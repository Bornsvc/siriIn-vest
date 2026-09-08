"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NOTIFICATIONS, USER } from "@/mock/account";
import { Logo } from "@/shared/ui/logo";
import { IconBell, IconSearch } from "@/shared/ui/icons";

export function TopBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header className="sticky top-9 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <Link href="/home" className="md:hidden" aria-label="SiriInvest home">
        <Logo variant="mark" className="size-7" />
      </Link>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          router.push(
            query.trim() ? `/market?q=${encodeURIComponent(query.trim())}` : "/market",
          );
        }}
        className="relative min-w-0 flex-1 md:max-w-md"
      >
        <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search stocks and ETFs, e.g. AAPL"
          aria-label="Search stocks and ETFs"
          className="h-10 w-full rounded-pill border border-line bg-canvas pl-9 pr-3 text-[13px] text-ink-950 placeholder:text-ink-300 transition-colors hover:border-line-strong focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/15"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5">
        <Link
          href="/notifications"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
          className="relative grid size-10 place-items-center rounded-full text-ink-500 transition-colors hover:bg-canvas hover:text-ink-900"
        >
          <IconBell />
          {unread > 0 ? (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-loss ring-2 ring-surface" />
          ) : null}
        </Link>

        <Link
          href="/account"
          className="flex items-center gap-2.5 rounded-pill py-1 pl-1 pr-1 transition-colors hover:bg-canvas sm:pr-3"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-full bg-brand-800 font-display text-[12px] font-semibold text-white"
          >
            {USER.initials}
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[13px] font-medium text-ink-950">
              {USER.name.split(" ")[0]}
            </span>
            <span className="lao block text-[10.5px] text-ink-400">
              ບັນຊີຢືນຢັນແລ້ວ
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
