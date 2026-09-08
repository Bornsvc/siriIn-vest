import type { ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * The repeating unit of the Settings page: icon tile, Lao label over the
 * English one, an optional line of explanation, and the control on the right.
 *
 * The row wraps rather than crushes — at 375px a segmented control drops onto
 * its own line instead of squeezing the label to nothing.
 */
export function SettingRow({
  icon: Icon,
  eyebrow,
  label,
  description,
  control,
  labelId,
  descriptionId,
  className,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Lao label. */
  eyebrow: string;
  label: string;
  description?: ReactNode;
  control: ReactNode;
  /** Set when a `role="switch"` control needs to point at this label. */
  labelId?: string;
  descriptionId?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-tile bg-brand-50 text-brand-700">
        <Icon />
      </span>

      <div className="min-w-[8rem] flex-1">
        <p className="lao text-[11.5px] leading-none text-brand-600">
          {eyebrow}
        </p>
        <p
          id={labelId}
          className="mt-1 text-[13.5px] font-medium leading-tight text-ink-950"
        >
          {label}
        </p>
        {description ? (
          <p
            id={descriptionId}
            className="mt-1 text-[12px] leading-relaxed text-ink-400"
          >
            {description}
          </p>
        ) : null}
      </div>

      <div className="ml-auto shrink-0">{control}</div>
    </div>
  );
}
