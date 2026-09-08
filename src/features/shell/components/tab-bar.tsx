"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, PRIMARY_NAV } from "@/shared/config/nav";
import { cn } from "@/shared/lib/cn";
import { IconUser } from "@/shared/ui/icons";

/** Below md the web app falls back to the mobile product's tab bar. */
export function TabBar() {
  const pathname = usePathname();
  const items = [
    ...PRIMARY_NAV,
    {
      href: "/account",
      label: "ບັນຊີ",
      labelEn: "Account",
      icon: IconUser,
    },
  ];

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 transition-colors",
                  active ? "text-brand-700" : "text-ink-400",
                )}
              >
                <Icon className="size-[19px]" />
                <span className="lao text-[10px] leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
