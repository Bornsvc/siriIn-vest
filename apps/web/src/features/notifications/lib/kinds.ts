import type { ComponentType, SVGProps } from "react";
import type { NotificationKind } from "@/shared/types";
import {
  IconBank,
  IconCheck,
  IconMarket,
  IconStar,
} from "@/shared/ui/icons";

export type KindMeta = {
  /** Plural, for the filter tab. */
  label: string;
  /** Singular, for the caption on a row. */
  singular: string;
  labelLo: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Tint + ring for the icon disc. Icon and tint together carry the kind. */
  tint: string;
};

export const KIND_ORDER: NotificationKind[] = [
  "order",
  "account",
  "price",
  "promotion",
];

export const KIND_META: Record<NotificationKind, KindMeta> = {
  order: {
    label: "Orders",
    singular: "Order",
    labelLo: "ຄຳສັ່ງຊື້-ຂາຍ",
    icon: IconCheck,
    tint: "bg-brand-50 text-brand-700 ring-brand-100",
  },
  account: {
    label: "Account",
    singular: "Account",
    labelLo: "ບັນຊີ",
    icon: IconBank,
    tint: "bg-canvas text-ink-500 ring-line",
  },
  price: {
    label: "Price",
    singular: "Price",
    labelLo: "ລາຄາ",
    icon: IconMarket,
    tint: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  promotion: {
    label: "Promotions",
    singular: "Promotion",
    labelLo: "ໂປຣໂມຊັນ",
    icon: IconStar,
    tint: "bg-brand-100 text-brand-800 ring-brand-200",
  },
};

export const EMPTY_COPY: Record<
  "all" | NotificationKind,
  { title: string; body: string }
> = {
  all: {
    title: "You are all caught up",
    body: "Order fills, deposits and price alerts arrive here. Nothing needs you right now.",
  },
  order: {
    title: "No order updates",
    body: "Fills, cancellations and rejections land here. Place an order and you will see it move.",
  },
  account: {
    title: "No account updates",
    body: "Deposits, withdrawals and verification news show up here.",
  },
  price: {
    title: "No price alerts",
    body: "Set an alert on a stock and we tell you the moment it crosses your level.",
  },
  promotion: {
    title: "No promotions right now",
    body: "Product news and offers appear here when we have something worth your time.",
  },
};
