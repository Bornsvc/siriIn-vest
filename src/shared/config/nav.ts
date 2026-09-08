import type { ComponentType, SVGProps } from "react";
import {
  IconBell,
  IconHome,
  IconMarket,
  IconPortfolio,
  IconSettings,
  IconUser,
  IconWallet,
} from "@/shared/ui/icons";

export type NavItem = {
  href: string;
  /** Lao label — the product's first language. */
  label: string;
  /** English label, shown as a secondary line in the wide rail. */
  labelEn: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/** The five destinations that also form the mobile tab bar. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/home", label: "ໜ້າຫຼັກ", labelEn: "Home", icon: IconHome },
  { href: "/market", label: "ຕະຫຼາດ", labelEn: "Market", icon: IconMarket },
  {
    href: "/portfolio",
    label: "ພອດໂຟລິໂອ",
    labelEn: "Portfolio",
    icon: IconPortfolio,
  },
  { href: "/wallet", label: "ກະເປົາເງິນ", labelEn: "Wallet", icon: IconWallet },
];

export const SECONDARY_NAV: NavItem[] = [
  {
    href: "/notifications",
    label: "ການແຈ້ງເຕືອນ",
    labelEn: "Notifications",
    icon: IconBell,
  },
  { href: "/account", label: "ບັນຊີຂອງຂ້ອຍ", labelEn: "Account", icon: IconUser },
  { href: "/settings", label: "ຕັ້ງຄ່າ", labelEn: "Settings", icon: IconSettings },
];

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV];

/** A route belongs to a nav item if it is that item or nested beneath it. */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
