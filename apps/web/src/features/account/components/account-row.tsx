import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui";
import { IconChevronRight } from "@/shared/ui/icons";

type Tone = "default" | "loss";

/**
 * A settings-list row. It is either a link to somewhere real or a button that
 * says so — an MVP stub is a focusable control marked "Soon", never a link
 * into a 404.
 */
export function AccountRow({
  icon: Icon,
  eyebrow,
  label,
  value,
  href,
  onClick,
  tone = "default",
  soon,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Lao label. */
  eyebrow: string;
  label: string;
  value?: ReactNode;
  /** Omit for a stub or a button — the row renders as a button instead. */
  href?: string;
  /** Makes the row a control that acts here, rather than navigates. */
  onClick?: () => void;
  tone?: Tone;
  soon?: boolean;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-tile",
          tone === "loss"
            ? "bg-loss-soft text-loss"
            : "bg-brand-50 text-brand-700",
        )}
      >
        <Icon />
      </span>

      <span className="min-w-0 flex-1 text-left">
        <span
          className={cn(
            "lao block truncate text-[11.5px] leading-none",
            tone === "loss" ? "text-loss/70" : "text-brand-600",
          )}
        >
          {eyebrow}
        </span>
        <span
          className={cn(
            "mt-1 block truncate text-[13.5px] font-medium leading-tight",
            tone === "loss" ? "text-loss" : "text-ink-950",
          )}
        >
          {label}
        </span>
      </span>

      {value ? (
        <span className="shrink-0 text-[12.5px] text-ink-400">{value}</span>
      ) : null}

      {soon ? (
        <Badge>Soon</Badge>
      ) : (
        <IconChevronRight
          className={cn(
            "size-4 shrink-0",
            tone === "loss" ? "text-loss/60" : "text-ink-300",
          )}
        />
      )}
    </>
  );

  const shell = cn(
    "flex w-full items-center gap-3.5 px-5 py-3.5 transition-colors",
    // The global focus ring sits 2px outside its box; pulled inside so a row
    // at the top or bottom of a card does not overdraw the card border.
    "focus-visible:-outline-offset-2",
    tone === "loss" ? "hover:bg-loss-soft/70" : "hover:bg-brand-50/60",
  );

  if (href) {
    return (
      <Link href={href} className={shell}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={shell}>
      {inner}
    </button>
  );
}
