import { cn } from "@/shared/lib/cn";

/**
 * The mark is a single continuous S drawn as two opposing arcs — the same
 * bridging gesture the product makes between kip and dollars.
 */
export function Logo({
  variant = "full",
  tone = "brand",
  className,
}: {
  variant?: "mark" | "full";
  tone?: "brand" | "light";
  className?: string;
}) {
  const stroke = tone === "light" ? "#ffffff" : "var(--color-brand-500)";
  const wordmark = tone === "light" ? "text-white" : "text-brand-950";
  const tagline = tone === "light" ? "text-brand-200" : "text-ink-400";

  const mark = (
    <svg viewBox="0 0 32 32" className="size-full" aria-hidden>
      <path
        d="M20.8 10.2C20.8 7.2 11.6 7.2 11.6 11.4C11.6 15.6 20.8 16.4 20.8 20.6C20.8 24.8 11.6 24.8 11.6 21.6"
        fill="none"
        stroke={stroke}
        strokeWidth="3.6"
        strokeLinecap="round"
      />
    </svg>
  );

  if (variant === "mark") {
    return <span className={cn("block size-8", className)}>{mark}</span>;
  }

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="size-9 shrink-0">{mark}</span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-[17px] font-semibold tracking-[-0.02em]",
            wordmark,
          )}
        >
          SiriInvest
        </span>
        <span className={cn("mt-1 block text-[10px] tracking-wide", tagline)}>
          Invest Global. Grow Together.
        </span>
      </span>
    </span>
  );
}
