"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WALLET } from "@/mock/account";
import { isNavActive, PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "@/shared/config/nav";
import { cn } from "@/shared/lib/cn";
import { formatUsd } from "@/shared/lib/format";
import { Logo } from "@/shared/ui/logo";
import { IconDeposit } from "@/shared/ui/icons";

/**
 * Wide rail on large screens, icon rail on medium, replaced by the tab bar
 * below md — the same five destinations either way.
 */
export function SideRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="sticky top-9 hidden h-[calc(100vh-2.25rem)] shrink-0 flex-col border-r border-line bg-surface md:flex md:w-[72px] lg:w-[248px]"
    >
      <div className="flex h-16 items-center border-b border-line px-4 lg:px-5">
        <Link href="/home" className="lg:hidden" aria-label="SiriInvest home">
          <Logo variant="mark" />
        </Link>
        <Link href="/home" className="hidden lg:block" aria-label="SiriInvest home">
          <Logo />
        </Link>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto px-2.5 py-4 lg:px-3">
        <ul className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <li key={item.href}>
              <RailLink item={item} active={isNavActive(pathname, item.href)} />
            </li>
          ))}
        </ul>

        <hr className="my-4 border-line" />

        <ul className="space-y-0.5">
          {SECONDARY_NAV.map((item) => (
            <li key={item.href}>
              <RailLink item={item} active={isNavActive(pathname, item.href)} />
            </li>
          ))}
        </ul>
      </div>

      {/* Buying power sits at the foot of the rail — it is the number that
          decides whether the next tap is even possible. */}
      <div className="border-t border-line p-3">
        <Link
          href="/wallet/deposit"
          className="group block rounded-tile border border-line bg-canvas p-3 transition-colors hover:border-brand-300 hover:bg-brand-50"
        >
          <span className="hidden lg:block">
            <span className="lao block text-[11px] leading-none text-ink-400">
              ເງິນທີ່ໃຊ້ໄດ້
            </span>
            <span
              data-numeric
              className="mt-1.5 block font-display text-[17px] font-medium tracking-tight text-ink-950"
            >
              {formatUsd(WALLET.availableUsd)}
            </span>
            <span className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-brand-700">
              <IconDeposit className="size-3.5" />
              Add funds
            </span>
          </span>
          <span className="grid place-items-center text-brand-700 lg:hidden">
            <IconDeposit />
          </span>
        </Link>
      </div>
    </nav>
  );
}

function RailLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      title={item.labelEn}
      className={cn(
        "group relative flex items-center gap-3 rounded-tile px-3 py-2.5 transition-colors",
        "md:justify-center lg:justify-start",
        active
          ? "bg-brand-50 text-brand-800"
          : "text-ink-500 hover:bg-canvas hover:text-ink-900",
      )}
    >
      {/* Active marker rides the left edge — no pill outline needed. */}
      <span
        aria-hidden
        className={cn(
          "absolute left-0 h-5 w-[3px] rounded-r-full bg-brand-600 transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <Icon className={cn("size-[18px] shrink-0", active && "text-brand-600")} />
      <span className="hidden min-w-0 lg:block">
        <span className="lao block text-[13px] font-medium leading-tight">
          {item.label}
        </span>
        <span className="block text-[10.5px] leading-tight text-ink-300">
          {item.labelEn}
        </span>
      </span>
    </Link>
  );
}
