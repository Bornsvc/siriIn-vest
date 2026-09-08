"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { formatDate } from "@/shared/lib/format";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
} from "@/shared/ui";
import { IconCheck, IconClock, IconSelfie, IconShield } from "@/shared/ui/icons";
import { ApiError } from "@/shared/lib/api-client";
import type { FundSource } from "../lib/fund-sources";
import type { Province } from "../lib/provinces";
import {
  fetchLatestSubmission,
  submitKyc,
  uploadKycPhoto,
  type DocumentKindValue,
  type KycSubmissionView,
} from "../lib/kyc-api";
import { clearSession, getAccessToken } from "../lib/session";
import {
  DOCUMENT_TYPES,
  EMPTY_DETAILS,
  EMPTY_PHOTO,
  VERIFY_STEPS,
  type DetailErrors,
  type Details,
  type DocumentDraft,
  type DocumentErrors,
  type DocumentSide,
  type PhotoUpload,
} from "../lib/verify";
import {
  validateDateOfBirth,
  validateIdNumber,
  validateName,
  validatePhotoReady,
  validatePlace,
  validateUpload,
} from "../lib/validation";
import { AuthHeading } from "./auth-heading";
import { CaptureFrame } from "./capture-frame";
import { VerifyDetailsStep } from "./verify-details-step";
import { VerifyDocumentStep } from "./verify-document-step";

const EMPTY_DOCUMENT: DocumentDraft = {
  type: "national_id",
  number: "",
  front: EMPTY_PHOTO,
  back: EMPTY_PHOTO,
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

const FIELD_TO_DETAIL: Partial<Record<string, keyof Details>> = {
  fullName: "name",
  dateOfBirth: "dob",
  village: "village",
  district: "district",
  provinceCode: "province",
  fundSourceCode: "funds",
};

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

/** The reviewer's decision, read back from the API rather than reconstructed
    from whatever the form last held — the two could disagree. */
function SubmissionReceipt({ submission }: { submission: KycSubmissionView }) {
  const approved = submission.status === "approved";
  const rows = [
    { label: "Reference", value: submission.reference, mono: true },
    { label: "Name", value: submission.details.fullName },
    {
      label: "Date of birth",
      value: formatDate(`${submission.details.dateOfBirth}T00:00:00`),
      mono: true,
    },
    {
      label: "Document",
      value: `${DOCUMENT_TYPES[submission.document.type].label} · ${submission.document.number}`,
      mono: true,
    },
    {
      label: "Address",
      value: `${submission.details.village}, ${submission.details.district}, ${submission.details.province.name}`,
    },
    { label: "Source of funds", value: submission.details.fundSource.label },
    { label: "Photos", value: `${submission.photos.length}`, mono: true },
  ];

  return (
    <div className="rise">
      <AuthHeading
        eyebrow={approved ? "ຢືນຢັນແລ້ວ" : "ກຳລັງກວດສອບ"}
        title={approved ? "Your identity is verified" : "Documents are with the reviewer"}
        description={
          approved
            ? "Trading, deposits and withdrawals are open."
            : "This usually clears within a day. We'll send you a notification the moment it does — deposits and trading open then."
        }
      />

      <div className="space-y-5">
        <Card>
          <CardHeader
            eyebrow="ສະຫຼຸບ"
            title="What you sent"
            action={
              <Badge tone={approved ? "gain" : "warn"}>
                {approved ? (
                  <IconCheck className="size-3.5" />
                ) : (
                  <IconClock className="size-3.5" />
                )}
                {approved ? "Verified" : "In review"}
              </Badge>
            }
          />
          <dl className="divide-y divide-line">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 px-5 py-3"
              >
                <dt className="shrink-0 text-[12px] text-ink-400">{row.label}</dt>
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

        {!approved ? (
          <p className="text-center text-[12px] text-ink-400">
            You can browse the market while the check runs.
          </p>
        ) : null}
      </div>
    </div>
  );
}

type Phase = "checking" | "form" | "existing";

export function VerifyFlow({
  provinces,
  fundSources,
}: {
  provinces: Province[];
  fundSources: FundSource[];
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  // A ref, not state: nothing needs to re-render when the token arrives, and
  // setting it inside the mount effect would otherwise be a same-render
  // setState the lint rules (rightly) flag.
  const tokenRef = useRef<string | null>(null);
  const [existing, setExisting] = useState<KycSubmissionView | null>(null);
  const [previouslyRejected, setPreviouslyRejected] = useState(false);

  const [index, setIndex] = useState(0);
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [detailErrors, setDetailErrors] = useState<DetailErrors>({});
  const [doc, setDoc] = useState<DocumentDraft>(EMPTY_DOCUMENT);
  const [docErrors, setDocErrors] = useState<DocumentErrors>({});
  const [selfie, setSelfie] = useState<PhotoUpload>(EMPTY_PHOTO);
  const [selfieError, setSelfieError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [submitted, setSubmitted] = useState<KycSubmissionView | null>(null);

  function signOutAndRedirect() {
    clearSession();
    router.replace("/login");
  }

  // The one auth-gated check this page needs before it can show anything: is
  // there already a check in flight, and is the customer even signed in.
  useEffect(() => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    tokenRef.current = accessToken;

    let cancelled = false;
    fetchLatestSubmission(accessToken)
      .then((submission) => {
        if (cancelled) return;
        if (!submission) {
          setPhase("form");
        } else if (submission.status === "rejected") {
          // Rejected does not block a new check — the API only refuses a
          // second submission while one is in review or already approved.
          setPreviouslyRejected(true);
          setPhase("form");
        } else {
          setExisting(submission);
          setPhase("existing");
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.code === "UNAUTHENTICATED") {
          signOutAndRedirect();
          return;
        }
        // Not fatal: an unreachable API still leaves the form usable, and a
        // real problem will say so clearly the moment they try to submit.
        console.error("Could not check for an existing identity check.", error);
        setPhase("form");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      next[side.id] = validatePhotoReady(doc[side.id], side.missing) ?? undefined;
    }
    setDocErrors(next);

    if (next.number) {
      document.getElementById("verify-doc-number")?.focus();
      return false;
    }
    return spec.sides.every((side) => !next[side.id]);
  }

  function checkSelfie(): boolean {
    const fault = validatePhotoReady(selfie, "your face") ?? undefined;
    setSelfieError(fault);
    if (fault) {
      document.getElementById("verify-selfie")?.focus();
      return false;
    }
    return true;
  }

  /** One photo, start to finish. Runs the moment a file is chosen — not
      saved up for the final submit — so a slow form fill never outlives the
      15-minute upload ticket. */
  function selectDocumentPhoto(side: DocumentSide, kind: DocumentKindValue, file: File) {
    const sideSpec = spec.sides.find((item) => item.id === side);
    const invalid = validateUpload(file, sideSpec?.missing ?? "this photo");
    if (invalid) {
      setDoc((current) => ({
        ...current,
        [side]: { file, storageKey: null, status: "error" },
      }));
      setDocErrors((current) => ({ ...current, [side]: invalid }));
      return;
    }

    setDoc((current) => ({
      ...current,
      [side]: { file, storageKey: null, status: "uploading" },
    }));
    setDocErrors((current) => ({ ...current, [side]: undefined }));

    const token = tokenRef.current;
    if (!token) return;
    uploadKycPhoto(token, kind, file)
      .then((storageKey) => {
        setDoc((current) =>
          current[side].file === file
            ? { ...current, [side]: { file, storageKey, status: "done" } }
            : current,
        );
      })
      .catch((error: unknown) => {
        setDoc((current) =>
          current[side].file === file
            ? { ...current, [side]: { file, storageKey: null, status: "error" } }
            : current,
        );
        setDocErrors((current) => ({
          ...current,
          [side]: error instanceof Error ? error.message : "The upload did not go through. Try again.",
        }));
        if (error instanceof ApiError && error.code === "UNAUTHENTICATED") {
          signOutAndRedirect();
        }
      });
  }

  function removeDocumentPhoto(side: DocumentSide) {
    setDoc((current) => ({ ...current, [side]: EMPTY_PHOTO }));
    setDocErrors((current) => ({ ...current, [side]: undefined }));
  }

  function selectSelfie(file: File) {
    const invalid = validateUpload(file, "your face");
    if (invalid) {
      setSelfie({ file, storageKey: null, status: "error" });
      setSelfieError(invalid);
      return;
    }

    setSelfie({ file, storageKey: null, status: "uploading" });
    setSelfieError(undefined);

    const token = tokenRef.current;
    if (!token) return;
    uploadKycPhoto(token, "selfie", file)
      .then((storageKey) => {
        setSelfie((current) =>
          current.file === file ? { file, storageKey, status: "done" } : current,
        );
      })
      .catch((error: unknown) => {
        setSelfie((current) =>
          current.file === file
            ? { file, storageKey: null, status: "error" }
            : current,
        );
        setSelfieError(
          error instanceof Error ? error.message : "The upload did not go through. Try again.",
        );
        if (error instanceof ApiError && error.code === "UNAUTHENTICATED") {
          signOutAndRedirect();
        }
      });
  }

  /** Maps the API's field-level faults back onto the step and input that
      caused them, the same way the register form does for sign-up. */
  function applySubmitErrors(
    error: ApiError,
    photosSent: { kind: DocumentKindValue; storageKey: string }[],
  ) {
    const nextDetailErrors: DetailErrors = {};
    const nextDocErrors: DocumentErrors = {};
    let nextSelfieError: string | undefined;
    let matched = false;

    for (const detail of error.details) {
      const detailKey = FIELD_TO_DETAIL[detail.field];
      if (detailKey) {
        nextDetailErrors[detailKey] = detail.message;
        matched = true;
        continue;
      }
      if (detail.field === "documentNumber" || detail.field === "documentType") {
        nextDocErrors.number = detail.message;
        matched = true;
        continue;
      }
      const photoMatch = /^photos\.(\d+)\./.exec(detail.field);
      if (photoMatch) {
        const photo = photosSent[Number(photoMatch[1])];
        if (photo) {
          if (photo.kind === "selfie") {
            nextSelfieError = detail.message;
            setSelfie((current) =>
              current.storageKey === photo.storageKey
                ? { ...current, storageKey: null, status: "error" }
                : current,
            );
          } else {
            const side: DocumentSide = photo.kind === "id_back" ? "back" : "front";
            nextDocErrors[side] = detail.message;
            setDoc((current) =>
              current[side].storageKey === photo.storageKey
                ? { ...current, [side]: { ...current[side], storageKey: null, status: "error" } }
                : current,
            );
          }
          matched = true;
        }
        continue;
      }
      if (detail.field === "photos") {
        nextDocErrors.general = detail.message;
        matched = true;
      }
    }

    setDetailErrors((current) => ({ ...current, ...nextDetailErrors }));
    setDocErrors((current) => ({ ...current, ...nextDocErrors }));
    if (nextSelfieError) setSelfieError(nextSelfieError);

    if (Object.keys(nextDetailErrors).length > 0) setIndex(0);
    else if (Object.keys(nextDocErrors).length > 0) setIndex(1);
    else if (nextSelfieError) setIndex(2);

    if (!matched) setSubmitError(error.message);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const passed =
      index === 0 ? checkDetails() : index === 1 ? checkDocument() : checkSelfie();
    if (!passed) return;

    if (!isLast) {
      setIndex(index + 1);
      return;
    }

    const token = tokenRef.current;
    if (!token) {
      signOutAndRedirect();
      return;
    }

    const photos = [
      ...spec.sides.map((side) => ({
        kind: side.kind,
        storageKey: doc[side.id].storageKey!,
      })),
      { kind: "selfie" as const, storageKey: selfie.storageKey! },
    ];

    setSending(true);
    setSubmitError(undefined);
    try {
      const submission = await submitKyc(token, {
        fullName: details.name,
        dateOfBirth: details.dob,
        village: details.village,
        district: details.district,
        provinceCode: details.province,
        fundSourceCode: details.funds,
        documentType: doc.type,
        documentNumber: doc.number,
        photos,
      });
      setSubmitted(submission);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "UNAUTHENTICATED") {
          signOutAndRedirect();
          return;
        }
        if (error.code === "KYC_ALREADY_IN_REVIEW" || error.code === "KYC_ALREADY_APPROVED") {
          const latest = await fetchLatestSubmission(token).catch(() => null);
          if (latest) {
            setExisting(latest);
            setPhase("existing");
          } else {
            setSubmitError(error.message);
          }
          return;
        }
        applySubmitErrors(error, photos);
      } else {
        setSubmitError(
          error instanceof Error ? error.message : "Something went wrong. Try again.",
        );
      }
    } finally {
      setSending(false);
    }
  }

  if (phase === "checking") {
    return (
      <>
        <AuthHeading
          eyebrow="ຢືນຢັນຕົວຕົນ"
          title="Verify your identity"
          description="Checking whether you already have a check on file…"
        />
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-64 w-full rounded-card" />
        </div>
      </>
    );
  }

  if (phase === "existing" && existing) {
    return <SubmissionReceipt submission={existing} />;
  }

  if (submitted) {
    return <SubmissionReceipt submission={submitted} />;
  }

  return (
    <>
      <AuthHeading
        eyebrow="ຢືນຢັນຕົວຕົນ"
        title="Verify your identity"
        description="Lao anti-money-laundering rules and our U.S. brokerage partner both require a verified identity before an account can hold money or place a trade. It is checked once."
      />

      {previouslyRejected ? (
        <p className="mb-5 rounded-tile border border-warn-soft bg-warn-soft px-4 py-3 text-[13px] leading-relaxed text-ink-700">
          Your last identity check was not approved. Send a new one below.
        </p>
      ) : null}

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
                fundSources={fundSources}
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
                onTypeChange={(type) => {
                  setDoc({ type, number: "", front: EMPTY_PHOTO, back: EMPTY_PHOTO });
                  setDocErrors({});
                }}
                onNumberChange={(number) => {
                  setDoc((current) => ({ ...current, number }));
                  setDocErrors((current) => ({ ...current, number: undefined }));
                }}
                onSelectPhoto={selectDocumentPhoto}
                onRemovePhoto={removeDocumentPhoto}
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
                file={selfie.file}
                error={selfieError}
                uploading={selfie.status === "uploading"}
                onChange={(file) => {
                  if (file) selectSelfie(file);
                  else {
                    setSelfie(EMPTY_PHOTO);
                    setSelfieError(undefined);
                  }
                }}
              />
            ) : null}
          </CardBody>
        </Card>

        <SecurityNote />

        {submitError ? (
          <p role="alert" className="text-[13px] text-loss">
            {submitError}
          </p>
        ) : null}

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
