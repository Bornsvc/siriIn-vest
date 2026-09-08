"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Chip, Field, Input } from "@/shared/ui";
import { IconCheck, IconIdCard } from "@/shared/ui/icons";
import {
  DOCUMENT_TYPES,
  type DocumentDraft,
  type DocumentErrors,
  type DocumentSide,
  type DocumentType,
} from "../lib/verify";
import { CaptureFrame } from "./capture-frame";

/**
 * Front and back are two faces of one card rather than two upload boxes, so
 * the step behaves the way the object in the customer's hand does: photograph
 * a side, turn it over, photograph the other. A passport only ever has the one
 * page, and says so.
 */
export function VerifyDocumentStep({
  value,
  errors,
  onChange,
}: {
  value: DocumentDraft;
  errors: DocumentErrors;
  onChange: (patch: Partial<DocumentDraft>) => void;
}) {
  const spec = DOCUMENT_TYPES[value.type];
  const [side, setSide] = useState<DocumentSide>("front");
  // Only the visible face is mounted, so a fault on the other one would be
  // invisible. The visible face is therefore derived, not stored: whichever
  // side the reviewer is missing wins over the side that was picked.
  const faulted = spec.sides.find((item) => errors[item.id]);
  const activeId = errors[side] ? side : (faulted?.id ?? side);
  const active = spec.sides.find((item) => item.id === activeId) ?? spec.sides[0];

  /** A Lao ID card front is not a passport page, so switching starts over. */
  function selectType(type: DocumentType) {
    if (type === value.type) return;
    setSide("front");
    onChange({ type, front: null, back: null });
  }

  function capture(file: File | null) {
    onChange({ [active.id]: file });
    // Turn the card over for them, and keep the stored pick in step with the
    // face they just used so clearing the fault does not snap it back.
    const turn =
      file && active.id === "front" && spec.sides.length > 1 && !value.back;
    setSide(turn ? "back" : active.id);
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 block text-[13px] font-medium text-ink-700">
          Which document are you using?
        </legend>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DOCUMENT_TYPES) as DocumentType[]).map((type) => (
            <Chip
              key={type}
              active={value.type === type}
              aria-pressed={value.type === type}
              onClick={() => selectType(type)}
            >
              {DOCUMENT_TYPES[type].label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <Field
        label={spec.numberLabel}
        htmlFor="verify-doc-number"
        hint={spec.numberHint}
        error={
          errors.number ? (
            <span id="verify-doc-number-error">{errors.number}</span>
          ) : null
        }
      >
        <Input
          id="verify-doc-number"
          name="documentNumber"
          inputMode={value.type === "passport" ? "text" : "numeric"}
          autoComplete="off"
          placeholder={spec.placeholder}
          className="font-mono"
          data-numeric
          value={value.number}
          aria-invalid={errors.number ? true : undefined}
          aria-describedby={
            errors.number ? "verify-doc-number-error" : undefined
          }
          onChange={(event) => onChange({ number: event.target.value })}
        />
      </Field>

      <CaptureFrame
        // Remounting per side keeps each face's preview honest.
        key={`${value.type}-${active.id}`}
        id={`verify-doc-${active.id}`}
        ratio="card"
        icon={IconIdCard}
        capture="environment"
        label={active.label}
        hint={active.hint}
        file={value[active.id]}
        error={errors[active.id]}
        onChange={capture}
        // The faces sit on the stage rather than above it: a card is turned
        // over, not chosen from a list.
        overlay={
          spec.sides.length > 1
            ? spec.sides.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={activeId === item.id}
                  onClick={() => setSide(item.id)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1 rounded-pill px-3 text-[12px] font-medium",
                    "backdrop-blur-sm transition-colors",
                    activeId === item.id
                      ? "bg-white text-brand-900"
                      : "bg-brand-950/60 text-white/70 hover:bg-brand-950/85 hover:text-white",
                  )}
                >
                  {item.label}
                  {value[item.id] ? (
                    <>
                      <IconCheck className="size-3" />
                      <span className="sr-only">captured</span>
                    </>
                  ) : null}
                </button>
              ))
            : null
        }
      />
    </div>
  );
}
