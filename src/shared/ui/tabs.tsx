"use client";

import { cn } from "@/shared/lib/cn";

export type TabItem<T extends string> = {
  value: T;
  label: string;
  /** Optional Lao label rendered beneath on the wider variants. */
  count?: number;
};

/** Pill segmented control — the mobile app's Holdings / Performance / History. */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  size = "md",
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (next: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-pill bg-brand-50 p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-pill font-medium transition-colors duration-150",
              size === "sm" ? "h-7 px-3 text-[12px]" : "h-8 px-4 text-[13px]",
              active
                ? "bg-brand-700 text-white"
                : "text-ink-500 hover:text-brand-800",
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span
                data-numeric
                className={cn(
                  "ml-1.5",
                  active ? "text-brand-200" : "text-ink-300",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Underlined variant for page-level sections where pills would be too loud. */
export function UnderlineTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("flex items-center gap-6 border-b border-line", className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "-mb-px border-b-2 pb-2.5 text-[13px] font-medium transition-colors",
              active
                ? "border-brand-700 text-ink-950"
                : "border-transparent text-ink-400 hover:text-ink-700",
            )}
          >
            {item.label}
            {item.count !== undefined ? (
              <span data-numeric className="ml-1.5 text-ink-300">
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
