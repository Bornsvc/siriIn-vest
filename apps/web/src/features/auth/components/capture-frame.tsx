"use client";

import {
  useEffect,
  useMemo,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react";
import { cn } from "@/shared/lib/cn";
import { IconX } from "@/shared/ui/icons";

/**
 * The capture target for anything the reviewer has to look at.
 *
 * `card` is ID-1 — the 85.6 × 54 mm of every national ID card and passport
 * photo page — so the frame is the same shape as the thing in the customer's
 * hand, and "all four corners inside the frame" becomes something you can see
 * rather than a sentence you have to trust. `face` is the head-and-shoulders
 * crop a liveness check actually reads.
 */
const RATIOS = {
  card: "aspect-[1.586]",
  face: "aspect-[0.82]",
} as const;

/** Unconstrained, a portrait frame swallows the column. A print is enough. */
const WIDTHS = {
  card: "",
  face: "mx-auto max-w-[286px]",
} as const;

/** Two borders each, so the four together read as a frame, not a box. */
const CORNERS = [
  "left-3.5 top-3.5 border-l-2 border-t-2 rounded-tl-[7px]",
  "right-3.5 top-3.5 border-r-2 border-t-2 rounded-tr-[7px]",
  "left-3.5 bottom-3.5 border-l-2 border-b-2 rounded-bl-[7px]",
  "right-3.5 bottom-3.5 border-r-2 border-b-2 rounded-br-[7px]",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CaptureFrame({
  id,
  ratio,
  icon: Icon,
  label,
  hint,
  file,
  error,
  capture,
  overlay,
  onChange,
}: {
  id: string;
  ratio: keyof typeof RATIOS;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  hint: string;
  file: File | null;
  error?: string;
  /** Which camera a phone should open straight into. */
  capture?: "user" | "environment";
  /** Controls laid over the stage — siblings of the label, so they do not
      reopen the file picker when clicked. */
  overlay?: ReactNode;
  onChange: (file: File | null) => void;
}) {
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  // Object URLs are a leak if they outlive the file they point at.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const captured = file !== null;
  const describedBy = error ? `${id}-error` : `${id}-hint`;

  return (
    <div className={WIDTHS[ratio]}>
      <div className="relative">
        <label
          htmlFor={id}
          className={cn(
            "relative block w-full cursor-pointer overflow-hidden rounded-tile bg-brand-950",
            "ring-offset-2 ring-offset-surface transition-shadow",
            "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600",
            RATIOS[ratio],
          )}
        >
          <input
            id={id}
            type="file"
            accept="image/*"
            capture={capture}
            className="sr-only"
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          />

          {preview ? (
            <span
              aria-hidden
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${preview})` }}
            />
          ) : null}

          {/* The guide the customer lines their face up with. Documents get the
              corners alone; a face needs to know where the middle is. */}
          {ratio === "face" && !preview ? (
            <span
              aria-hidden
              className="absolute left-1/2 top-[46%] h-[58%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-white/20"
            />
          ) : null}

          {CORNERS.map((corner) => (
            <span
              key={corner}
              aria-hidden
              className={cn(
                "absolute size-5 transition-colors duration-300",
                captured ? "border-brand-300" : "border-white/30",
                corner,
              )}
            />
          ))}

          {!preview ? (
            <span className="absolute inset-0 grid place-content-center place-items-center gap-1.5 px-8 text-center">
              <Icon className="size-6 text-brand-300" />
              <span className="text-[13px] font-medium text-white">{label}</span>
              <span className="text-[11.5px] leading-relaxed text-white/50">
                Tap to take a photo or choose a file
              </span>
            </span>
          ) : null}
        </label>

        {overlay ? (
          <div className="absolute left-1/2 top-2.5 z-10 flex -translate-x-1/2 gap-1.5">
            {overlay}
          </div>
        ) : null}

        {/* A sibling, not a child: inside the label it would reopen the picker. */}
        {captured ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-brand-950/70 text-white/80 backdrop-blur-sm transition-colors hover:bg-brand-950 hover:text-white"
          >
            <IconX className="size-3.5" />
            <span className="sr-only">Remove the {label.toLowerCase()} photo</span>
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[12px] text-loss">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="mt-2 text-[12px] leading-relaxed text-ink-400">
          {captured && file ? (
            <span data-numeric className="font-mono text-ink-500">
              {file.name}
              <span aria-hidden className="mx-1.5 text-line-strong">
                ·
              </span>
              {formatBytes(file.size)}
            </span>
          ) : (
            hint
          )}
        </p>
      )}
    </div>
  );
}
