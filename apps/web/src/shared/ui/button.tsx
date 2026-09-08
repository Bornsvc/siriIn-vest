import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "sell"
  /** White on a dark ground — the brand-950 hero and footer. */
  | "invert"
  /** Hairline outline on a dark ground. */
  | "onDark"
  /** Quietest option on a dark ground. */
  | "onDarkGhost";
type Size = "sm" | "md" | "lg";

/**
 * Variants are declared here rather than patched in via className. Two
 * utilities of equal specificity (`text-white` and `text-brand-900`) resolve by
 * stylesheet order, not class order, so an override silently loses — which is
 * how you get a white button with white text.
 */
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 shadow-[0_1px_2px_rgba(7,42,32,0.16)]",
  secondary:
    "bg-white text-ink-800 border border-line-strong hover:border-brand-300 hover:bg-brand-50",
  ghost: "text-ink-500 hover:bg-brand-50 hover:text-brand-800",
  danger: "bg-loss text-white hover:brightness-95",
  sell: "bg-white text-loss border border-loss/30 hover:bg-loss-soft",
  invert: "bg-white text-brand-900 hover:bg-brand-50 active:bg-brand-100",
  onDark:
    "border border-white/25 bg-white/5 text-white hover:bg-white/15 hover:border-white/40",
  onDarkGhost:
    "border border-transparent text-white/75 hover:bg-white/10 hover:text-white",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-[8px]",
  md: "h-10 px-4 text-sm gap-2 rounded-[10px]",
  lg: "h-12 px-6 text-[15px] gap-2 rounded-[12px]",
};

const BASE =
  "inline-flex items-center justify-center font-medium transition-colors duration-150 " +
  "disabled:pointer-events-none disabled:opacity-40 whitespace-nowrap";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = "primary",
  size = "md",
  block,
  className,
  children,
  ...props
}: CommonProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  block,
  className,
  children,
  ...props
}: CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link
      className={cn(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
