import { cn } from "@/shared/lib/cn";
import { scorePassword, type StrengthLevel } from "../lib/validation";

/** Direction is never carried by colour alone — the word is the signal. */
const BAR: Record<StrengthLevel, string> = {
  0: "bg-line",
  1: "bg-loss",
  2: "bg-brand-300",
  3: "bg-gain",
};

const TEXT: Record<StrengthLevel, string> = {
  0: "text-ink-300",
  1: "text-loss",
  2: "text-brand-700",
  3: "text-gain",
};

/**
 * Three levels, measured on length and character variety and nothing else —
 * so the meter never flatters a short password into looking safe.
 */
export function PasswordStrength({
  password,
  id,
}: {
  password: string;
  id?: string;
}) {
  const strength = scorePassword(password);

  return (
    <div id={id} className="pt-0.5">
      <div className="flex items-center gap-3">
        <span aria-hidden className="flex flex-1 gap-1">
          {[1, 2, 3].map((step) => (
            <span
              key={step}
              className={cn(
                "h-1 flex-1 rounded-pill transition-colors duration-150",
                step <= strength.level ? BAR[strength.level] : "bg-line",
              )}
            />
          ))}
        </span>
        <span
          className={cn(
            "w-[46px] shrink-0 text-right text-[12px] font-medium",
            TEXT[strength.level],
          )}
        >
          {strength.label || "—"}
        </span>
      </div>
      <p
        aria-live="polite"
        className="mt-1.5 text-[12px] leading-relaxed text-ink-400"
      >
        {strength.label ? `${strength.label}. ` : ""}
        {strength.advice ?? "Long enough and varied enough."}
      </p>
    </div>
  );
}
