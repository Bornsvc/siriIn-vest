import type { DocumentKindValue } from "./kyc-api";

/**
 * Domain data for the identity check.
 *
 * Kept apart from `validation.ts` so the validators stay pure functions and
 * these lists stay editable by someone who knows the regulation rather than
 * the code.
 */

export type VerifyStepId = "details" | "document" | "selfie";

export type VerifyStep = {
  id: VerifyStepId;
  /** Short enough to sit under a third of a 400px column. */
  label: string;
  eyebrow: string;
  title: string;
  blurb: string;
};

export const VERIFY_STEPS: VerifyStep[] = [
  {
    id: "details",
    label: "Details",
    eyebrow: "ຂໍ້ມູນສ່ວນຕົວ",
    title: "Your details",
    blurb:
      "Enter these exactly as they appear on the ID you are about to photograph. A name that does not match is the most common reason a check is sent back.",
  },
  {
    id: "document",
    label: "Document",
    eyebrow: "ເອກະສານຢືນຢັນຕົວຕົນ",
    title: "Your ID document",
    blurb:
      "Lay the document flat in even light. All four corners inside the frame, no glare across the photo.",
  },
  {
    id: "selfie",
    label: "Photo",
    eyebrow: "ພາບຖ່າຍໃບໜ້າ",
    title: "Your photo",
    blurb:
      "One clear photo of your face, matched against the photo on your document. No hat, no sunglasses.",
  },
];

/** Values the API accepts directly — kept identical so nothing needs mapping. */
export type DocumentType = "national_id" | "passport";

/** State keys stay `front`/`back` for both document types; a passport just uses one. */
export type DocumentSide = "front" | "back";

type DocumentSpec = {
  label: string;
  numberLabel: string;
  numberHint: string;
  placeholder: string;
  /** `missing` is the phrase the "add a photo of …" error is built from. */
  sides: {
    id: DocumentSide;
    label: string;
    hint: string;
    missing: string;
    /** The `kind` `/kyc/uploads` and `/kyc/submissions` expect for this face. */
    kind: DocumentKindValue;
  }[];
};

export const DOCUMENT_TYPES: Record<DocumentType, DocumentSpec> = {
  national_id: {
    label: "Lao ID card",
    numberLabel: "ID number",
    numberHint: "The long number printed under your photo.",
    placeholder: "1 2345 6789 012",
    sides: [
      {
        id: "front",
        label: "Front",
        hint: "The side carrying your photo and name.",
        missing: "the front of your ID card",
        kind: "id_front",
      },
      {
        id: "back",
        label: "Back",
        hint: "The side carrying the issuing office and date.",
        missing: "the back of your ID card",
        kind: "id_back",
      },
    ],
  },
  passport: {
    label: "Passport",
    numberLabel: "Passport number",
    numberHint: "Printed at the top right of the photo page.",
    placeholder: "P1234567",
    sides: [
      {
        id: "front",
        label: "Photo page",
        hint: "The page with your photo and the two machine-readable lines.",
        missing: "your passport photo page",
        kind: "passport_page",
      },
    ],
  },
};

export type Details = {
  name: string;
  dob: string;
  village: string;
  district: string;
  /** A province `code`, not its name — see `lib/provinces.ts`. */
  province: string;
  /** A fund-source `code` — see `lib/fund-sources.ts`. */
  funds: string;
};

export type DetailErrors = Partial<Record<keyof Details, string>>;

/**
 * One photo, from the moment it is chosen to the moment the bucket confirms
 * it. `storageKey` is only set once `status` is `"done"` — that is what the
 * final submit is allowed to send.
 */
export type PhotoUpload = {
  file: File | null;
  storageKey: string | null;
  status: "idle" | "uploading" | "done" | "error";
};

export const EMPTY_PHOTO: PhotoUpload = {
  file: null,
  storageKey: null,
  status: "idle",
};

export type DocumentDraft = {
  type: DocumentType;
  number: string;
  front: PhotoUpload;
  back: PhotoUpload;
};

export type DocumentErrors = Partial<
  Record<"number" | "general" | DocumentSide, string>
>;

export const EMPTY_DETAILS: Details = {
  name: "",
  dob: "",
  village: "",
  district: "",
  province: "",
  funds: "",
};
