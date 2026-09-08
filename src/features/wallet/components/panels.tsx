import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { RATE_LINE } from "../lib/currency";

/**
 * The conversion panel.
 *
 * The whole point of the wallet is that kip leaves one side and dollars arrive
 * on the other. This shows both legs and the rate between them at the moment
 * the amount is typed, so the converted figure is never a surprise at the end.
 */
export function ConversionPanel({
  from,
  to,
  footnote,
  className,
}: {
  from: { label: string; labelLo: string; value: string };
  to: { label: string; labelLo: string; value: string };
  footnote?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-tile border border-brand-100 bg-brand-50 p-4",
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
        <Leg {...from} />
        <span
          aria-hidden
          className="justify-self-center text-[15px] leading-none text-brand-300 sm:justify-self-auto"
        >
          <span className="sm:hidden">↓</span>
          <span className="hidden sm:inline">→</span>
        </span>
        <Leg {...to} align="right" emphasis />
      </div>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-t border-brand-100 pt-2.5 text-[12px] text-brand-800">
        <span className="lao text-brand-600">ອັດຕາແລກປ່ຽນທີ່ໃຊ້</span>
        <span>Rate applied</span>
        <span data-numeric className="font-mono font-medium">
          {RATE_LINE}
        </span>
      </p>
      {footnote ? (
        <p className="mt-1.5 text-[12px] leading-relaxed text-brand-800/70">
          {footnote}
        </p>
      ) : null}
    </div>
  );
}

function Leg({
  label,
  labelLo,
  value,
  align = "left",
  emphasis,
}: {
  label: string;
  labelLo: string;
  value: string;
  align?: "left" | "right";
  emphasis?: boolean;
}) {
  return (
    <div className={cn("min-w-0", align === "right" && "sm:text-right")}>
      <p className="lao text-[11px] leading-none text-brand-600">{labelLo}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-[0.06em] text-brand-800/60">
        {label}
      </p>
      <p
        data-numeric
        className={cn(
          "mt-1 truncate font-display font-medium tracking-tight text-brand-950",
          emphasis ? "text-[22px]" : "text-[19px]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** One label/value line in a summary panel. */
export function SummaryRow({
  label,
  labelLo,
  value,
  numeric = true,
  muted,
}: {
  label: string;
  labelLo?: string;
  value: ReactNode;
  numeric?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="min-w-0 text-[13px] text-ink-400">
        {label}
        {labelLo ? (
          <span className="lao ml-1.5 text-[11px] text-ink-300">{labelLo}</span>
        ) : null}
      </span>
      <span
        {...(numeric ? { "data-numeric": "" } : {})}
        className={cn(
          "shrink-0 text-right text-[13px] font-medium",
          muted ? "text-ink-400" : "text-ink-950",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** The one figure the customer is really agreeing to. */
export function SummaryTotal({
  label,
  labelLo,
  value,
  sub,
}: {
  label: string;
  labelLo: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="mt-1 flex items-end justify-between gap-4 border-t border-line pt-3">
      <span className="min-w-0">
        <span className="lao block text-[11px] leading-none text-brand-600">
          {labelLo}
        </span>
        <span className="mt-1 block text-[13px] font-medium text-ink-700">
          {label}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span
          data-numeric
          className="block font-display text-[22px] font-medium leading-none tracking-tight text-ink-950"
        >
          {value}
        </span>
        {sub ? (
          <span data-numeric className="mt-1 block text-[12px] text-ink-400">
            {sub}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/** Inline reason a primary action is unavailable — stated, never implied. */
export function BlockedReason({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      role="status"
      className="mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed text-ink-400"
    >
      <span aria-hidden className="mt-px select-none text-ink-300">
        ⓘ
      </span>
      <span>{children}</span>
    </p>
  );
}
