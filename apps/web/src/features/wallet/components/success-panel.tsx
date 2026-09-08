"use client";

import { Button, ButtonLink, Card, CardBody, Note } from "@/shared/ui";
import { IconCheck, IconClock } from "@/shared/ui/icons";
import { SummaryRow } from "./panels";

/**
 * The confirmation for both money flows. It stays on the page rather than
 * routing away: the customer still has work to do — a bank app to open, a
 * reference to quote — and sending them to a dashboard loses that.
 */
export function SuccessPanel({
  eyebrow,
  title,
  lead,
  reference,
  rows,
  steps,
  timing,
  note,
  secondaryAction,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  reference: string;
  rows: {
    label: string;
    labelLo: string;
    value: string;
    numeric?: boolean;
  }[];
  steps: string[];
  timing: { label: string; value: string };
  note: string;
  secondaryAction: { label: string; onClick: () => void };
}) {
  return (
    <div className="mx-auto max-w-[640px] space-y-4">
      <Card>
        <CardBody className="space-y-6 sm:p-7">
          <div className="flex items-start gap-4">
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100"
            >
              <IconCheck className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="lao text-[12px] leading-none text-brand-600">
                {eyebrow}
              </p>
              <h2 className="mt-1.5 font-display text-[22px] font-medium leading-tight tracking-tight text-ink-950">
                {title}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-400">
                {lead}
              </p>
            </div>
          </div>

          <div className="rounded-tile border border-line bg-canvas px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-[12px] text-ink-400">
                Reference
                <span className="lao ml-1.5 text-[11px] text-ink-300">
                  ເລກອ້າງອີງ
                </span>
              </span>
              <span
                data-numeric
                className="font-mono text-[13px] font-medium text-ink-950"
              >
                {reference}
              </span>
            </div>
          </div>

          <div className="divide-y divide-line">
            {rows.map((row) => (
              <SummaryRow key={row.label} {...row} />
            ))}
          </div>

          <div>
            <p className="lao text-[11px] leading-none text-brand-600">
              ຂັ້ນຕອນຕໍ່ໄປ
            </p>
            <h3 className="mt-1 font-display text-[15px] font-medium tracking-tight text-ink-950">
              What happens next
            </h3>
            <ol className="mt-3 space-y-3">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span
                    aria-hidden
                    data-numeric
                    className="grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 font-display text-[12px] font-semibold text-brand-800"
                  >
                    {index + 1}
                  </span>
                  <span className="text-[13px] leading-relaxed text-ink-700">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center gap-2.5 rounded-tile border border-brand-100 bg-brand-50 px-4 py-3">
            <IconClock className="size-4 shrink-0 text-brand-700" />
            <p className="text-[13px] text-brand-950">
              {timing.label}{" "}
              <span data-numeric className="font-medium">
                {timing.value}
              </span>
            </p>
          </div>

          <Note>{note}</Note>

          <div className="flex flex-col gap-2 sm:flex-row">
            <ButtonLink href="/wallet" size="lg" className="flex-1">
              Back to wallet
            </ButtonLink>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
