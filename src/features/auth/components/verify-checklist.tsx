"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { cn } from "@/shared/lib/cn";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Note,
} from "@/shared/ui";
import { IconCheck, IconShield, IconUser } from "@/shared/ui/icons";
import { IconIdCard, IconSelfie } from "@/shared/ui/icons";

type StepId = "personal" | "document" | "selfie";
type Status = "pending" | "active" | "done";

type Step = {
  id: StepId;
  eyebrow: string;
  label: string;
  detail: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const STEPS: Step[] = [
  {
    id: "personal",
    eyebrow: "ຂໍ້ມູນສ່ວນຕົວ",
    label: "Personal information",
    detail: "Name, date of birth and address, as they appear on your ID.",
    icon: IconUser,
  },
  {
    id: "document",
    eyebrow: "ເອກະສານຢືນຢັນຕົວຕົນ",
    label: "ID document",
    detail: "Lao national ID card or passport — both sides, all four corners.",
    icon: IconIdCard,
  },
  {
    id: "selfie",
    eyebrow: "ພາບຖ່າຍໃບໜ້າ",
    label: "Selfie verification",
    detail: "A short liveness check matched against the document photo.",
    icon: IconSelfie,
  },
];

const STATUS_COPY: Record<Status, string> = {
  pending: "Not started",
  active: "In progress",
  done: "Done",
};

export function VerifyChecklist() {
  const [done, setDone] = useState<StepId[]>([]);
  const [started, setStarted] = useState(false);

  const nextStep = STEPS.find((step) => !done.includes(step.id));
  const allDone = nextStep === undefined;

  function complete(id: StepId) {
    setStarted(true);
    setDone((current) => (current.includes(id) ? current : [...current, id]));
  }

  function statusOf(step: Step): Status {
    if (done.includes(step.id)) return "done";
    if (started && nextStep?.id === step.id) return "active";
    return "pending";
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          eyebrow="ຂັ້ນຕອນ"
          title="Three steps"
          action={
            done.length ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDone([]);
                  setStarted(false);
                }}
              >
                Start over
              </Button>
            ) : null
          }
        />

        <ul className="divide-y divide-line">
          {STEPS.map((step, index) => {
            const status = statusOf(step);
            const Icon = step.icon;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => complete(step.id)}
                  className="flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors hover:bg-brand-50/60 focus-visible:-outline-offset-2"
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full border transition-colors",
                      status === "done" &&
                        "border-brand-700 bg-brand-700 text-white",
                      status === "active" &&
                        "border-brand-600 bg-brand-50 text-brand-700",
                      status === "pending" &&
                        "border-line-strong bg-surface text-ink-300",
                    )}
                  >
                    {status === "done" ? (
                      <IconCheck className="size-4" />
                    ) : (
                      <Icon className="size-[18px]" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="lao block text-[11.5px] leading-none text-brand-600">
                      {step.eyebrow}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className={cn(
                          "text-[13.5px] font-medium leading-tight",
                          status === "done" ? "text-ink-500" : "text-ink-950",
                        )}
                      >
                        <span
                          data-numeric
                          aria-hidden
                          className="mr-1.5 text-ink-300"
                        >
                          {index + 1}.
                        </span>
                        {step.label}
                      </span>
                      <Badge
                        tone={
                          status === "done"
                            ? "gain"
                            : status === "active"
                              ? "brand"
                              : "neutral"
                        }
                      >
                        {STATUS_COPY[status]}
                      </Badge>
                    </span>
                    <span className="mt-1 block text-[12px] leading-relaxed text-ink-400">
                      {step.detail}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p
          aria-live="polite"
          className="border-t border-line px-5 py-3 text-[12px] text-ink-400"
        >
          <span data-numeric>
            {done.length} of {STEPS.length}
          </span>{" "}
          complete
          {allDone ? " — your account is ready." : "."}
        </p>
      </Card>

      {/* The bullet Note draws is redundant next to the shield, so it is
          hidden here rather than doubled up. */}
      <Note className="rounded-tile border border-brand-100 bg-brand-50/70 px-4 py-3 text-ink-500 [&>span:first-child]:hidden">
        <span className="flex items-start gap-2">
          <IconShield className="mt-px size-4 shrink-0 text-brand-600" />
          <span>
            Your ID and selfie are encrypted in transit and at rest, held only
            for the checks Lao regulators and our U.S. broker require, and never
            shown to other customers.
          </span>
        </span>
      </Note>

      {allDone ? (
        <ButtonLink href="/home" size="lg" block>
          Continue to your account
        </ButtonLink>
      ) : (
        <Button
          size="lg"
          block
          onClick={() => {
            if (!started) {
              setStarted(true);
              return;
            }
            if (nextStep) complete(nextStep.id);
          }}
        >
          {started ? "Continue verification" : "Start verification"}
        </Button>
      )}
    </div>
  );
}
