"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format";
import { Badge, Button, ButtonLink, Card, CardBody, CardHeader } from "@/shared/ui";
import { IconClock, IconSelfie, IconShield } from "@/shared/ui/icons";
import {
  DOCUMENT_TYPES,
  EMPTY_DETAILS,
  FUND_SOURCES,
  VERIFY_STEPS,
  maskDocumentNumber,
  type DetailErrors,
  type Details,
  type DocumentDraft,
  type DocumentErrors,
} from "../lib/verify";
import type { Province } from "../lib/provinces";
import {
  validateDateOfBirth,
  validateIdNumber,
  validateName,
  validatePlace,
  validateUpload,
} from "../lib/validation";
import { AuthHeading } from "./auth-heading";
import { CaptureFrame } from "./capture-frame";
import { VerifyDetailsStep } from "./verify-details-step";
import { VerifyDocumentStep } from "./verify-document-step";

const EMPTY_DOCUMENT: DocumentDraft = {
  type: "national-id",
  number: "",
  front: null,
  back: null,
};

/** Field ids in the order the eye reads them — used to focus the first fault. */
const DETAIL_ORDER = [
  ["name", "verify-name"],
  ["dob", "verify-dob"],
  ["village", "verify-village"],
  ["district", "verify-district"],
  ["province", "verify-province"],
  ["funds", "verify-funds"],
] as const;

/**
 * Three segments of equal weight. The ramp reads in greyscale — solid, mid,
 * hairline — so progress does not depend on seeing the green.
 */
function StepRibbon({ index }: { index: number }) {
  return (
    <div className="mb-6">
      <p data-numeric className="lao mb-2 text-[12px] leading-none text-brand-600">
        ຂັ້ນຕອນ {index + 1} ຈາກ {VERIFY_STEPS.length}
      </p>
      <ol aria-label="Verification progress" className="flex gap-1.5">
        {VERIFY_STEPS.map((step, position) => {
          const state =
            position < index ? "done" : position === index ? "active" : "todo";
          return (
            <li
              key={step.id}
              className="min-w-0 flex-1"
              aria-current={state === "active" ? "step" : undefined}
            >
              <span
                aria-hidden
                className={cn(
                  "block h-[3px] rounded-pill transition-colors duration-300",
                  state === "done" && "bg-brand-700",
                  state === "active" && "bg-brand-500",
                  state === "todo" && "bg-line-strong",
                )}
              />
              <span
                className={cn(
                  "mt-1.5 block truncate text-[11.5px]",
                  state === "active"
                    ? "font-medium text-ink-950"
                    : state === "done"
                      ? "text-ink-400"
                      : "text-ink-300",
                )}
              >
                <span className="sr-only">
                  {state === "done"
                    ? "Completed: "
                    : state === "active"
                      ? "Current step: "
                      : "Not started: "}
                </span>
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SecurityNote() {
  return (
    <p className="flex items-start gap-2 rounded-tile border border-brand-100 bg-brand-50/70 px-4 py-3 text-[12px] leading-relaxed text-ink-500">
      <IconShield className="mt-px size-4 shrink-0 text-brand-600" />
      <span>
        Your document and photo are encrypted in transit and at rest, held only
        for the checks Lao regulators and our U.S. broker require, and never
        shown to other customers.
      </span>
    </p>
  );
}

export function VerifyFlow({ provinces }: { provinces: Province[] }) {
  const [index, setIndex] = useState(0);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [detailErrors, setDetailErrors] = useState<DetailErrors>({});
  const [doc, setDoc] = useState<DocumentDraft>(EMPTY_DOCUMENT);
  const [docErrors, setDocErrors] = useState<DocumentErrors>({});
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfieError, setSelfieError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const step = VERIFY_STEPS[index];
  const spec = DOCUMENT_TYPES[doc.type];
  const isLast = index === VERIFY_STEPS.length - 1;

  function checkDetails(): boolean {
    const next: DetailErrors = {
      name: validateName(details.name) ?? undefined,
      dob: validateDateOfBirth(details.dob) ?? undefined,
      village: validatePlace(details.village, "village") ?? undefined,
      district: validatePlace(details.district, "district") ?? undefined,
      province: details.province ? undefined : "Select your province.",
      funds: details.funds
        ? undefined
        : "Select where the money you invest comes from.",
    };
    setDetailErrors(next);

    const fault = DETAIL_ORDER.find(([key]) => next[key]);
    if (fault) {
      document.getElementById(fault[1])?.focus();
      return false;
    }
    return true;
  }

  function checkDocument(): boolean {
    const next: DocumentErrors = {
      number: validateIdNumber(doc.number, doc.type) ?? undefined,
    };
    for (const side of spec.sides) {
      next[side.id] = validateUpload(doc[side.id], side.missing) ?? undefined;
    }
    setDocErrors(next);

    if (next.number) {
      document.getElementById("verify-doc-number")?.focus();
      return false;
    }
    // A missing face turns the card to itself, so it needs no focus of its own.
    return !next.front && !next.back;
  }

  function checkSelfie(): boolean {
    const fault = validateUpload(selfie, "your face") ?? undefined;
    setSelfieError(fault);
    if (fault) {
      document.getElementById("verify-selfie")?.focus();
      return false;
    }
    return true;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const passed =
      index === 0 ? checkDetails() : index === 1 ? checkDocument() : checkSelfie();
    if (!passed) return;

    if (!isLast) {
      setIndex(index + 1);
      return;
    }

    // No KYC endpoint yet: this stands in for the handoff to the reviewer.
    setSending(true);
    timer.current = setTimeout(() => {
      setReference(
        `SI-KYC-${Math.floor(1_000_000 + Math.random() * 9_000_000)}`,
      );
      setSending(false);
    }, 1200);
  }

  if (reference) {
    const fundSource = FUND_SOURCES.find(
      (source) => source.value === details.funds,
    );
    const province = provinces.find((item) => item.code === details.province);
    const summary = [
      { label: "Reference", value: reference, mono: true },
      { label: "Name", value: details.name },
      { label: "Date of birth", value: formatDate(`${details.dob}T00:00:00`), mono: true },
      { label: "Document", value: `${spec.label} · ${maskDocumentNumber(doc.number)}`, mono: true },
      {
        label: "Address",
        value: `${details.village}, ${details.district}, ${province?.name ?? "—"}`,
      },
      { label: "Source of funds", value: fundSource?.label ?? "—" },
      { label: "Photos", value: `${spec.sides.length + 1}`, mono: true },
    ];

    return (
      <div className="rise">
        <AuthHeading
          eyebrow="ກຳລັງກວດສອບ"
          title="Documents are with the reviewer"
          description="This usually clears within a day. We'll send you a notification the moment it does — deposits and trading open then."
        />

        <div className="space-y-5">
          <Card>
            <CardHeader
              eyebrow="ສະຫຼຸບ"
              title="What you sent"
              // The same words the account page uses for this state.
              action={
                <Badge tone="warn">
                  <IconClock className="size-3.5" />
                  In review
                </Badge>
              }
            />
            <dl className="divide-y divide-line">
              {summary.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 px-5 py-3"
                >
                  <dt className="shrink-0 text-[12px] text-ink-400">
                    {row.label}
                  </dt>
                  <dd
                    className={cn(
                      "min-w-0 text-right text-[13px] text-ink-950",
                      row.mono && "font-mono text-[12.5px]",
                    )}
                    data-numeric={row.mono ? "" : undefined}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>

          <SecurityNote />

          <ButtonLink href="/home" size="lg" block>
            Go to your account
          </ButtonLink>

          <p className="text-center text-[12px] text-ink-400">
            You can browse the market while the check runs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthHeading
        eyebrow="ຢືນຢັນຕົວຕົນ"
        title="Verify your identity"
        description="Lao anti-money-laundering rules and our U.S. brokerage partner both require a verified identity before an account can hold money or place a trade. It is checked once."
      />

      <StepRibbon index={index} />

      <form onSubmit={submit} noValidate className="space-y-5">
        {/* Announced on its own, because the ribbon is read as a list. */}
        <p aria-live="polite" className="sr-only">
          Step {index + 1} of {VERIFY_STEPS.length}: {step.title}
        </p>

        <Card key={step.id} className="rise">
          <CardHeader eyebrow={step.eyebrow} title={step.title} />
          <CardBody className="space-y-5">
            <p className="text-[12.5px] leading-relaxed text-ink-400">
              {step.blurb}
            </p>

            {index === 0 ? (
              <VerifyDetailsStep
                value={details}
                errors={detailErrors}
                provinces={provinces}
                onChange={(patch) => {
                  setDetails((current) => ({ ...current, ...patch }));
                  setDetailErrors((current) => {
                    const next = { ...current };
                    for (const key of Object.keys(patch) as (keyof Details)[]) {
                      delete next[key];
                    }
                    return next;
                  });
                }}
              />
            ) : null}

            {index === 1 ? (
              <VerifyDocumentStep
                value={doc}
                errors={docErrors}
                onChange={(patch) => {
                  setDoc((current) => ({ ...current, ...patch }));
                  setDocErrors((current) => {
                    const next = { ...current };
                    for (const key of Object.keys(patch)) {
                      delete next[key as keyof DocumentErrors];
                    }
                    return next;
                  });
                }}
              />
            ) : null}

            {index === 2 ? (
              <CaptureFrame
                id="verify-selfie"
                ratio="face"
                icon={IconSelfie}
                capture="user"
                label="Your face"
                hint="Look straight at the camera, in even light."
                file={selfie}
                error={selfieError}
                onChange={(file) => {
                  setSelfie(file);
                  setSelfieError(undefined);
                }}
              />
            ) : null}
          </CardBody>
        </Card>

        <SecurityNote />

        <div className="flex gap-3">
          {index > 0 ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={sending}
              onClick={() => setIndex(index - 1)}
            >
              Previous step
            </Button>
          ) : null}

          <Button type="submit" size="lg" block disabled={sending}>
            {isLast ? (sending ? "Sending…" : "Submit for review") : "Continue"}
          </Button>
        </div>
      </form>
    </>
  );
}
