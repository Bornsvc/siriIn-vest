import { DocumentKindValue, DocumentTypeValue } from './validation/kyc-rules';

export type KycStatusValue = 'in_review' | 'approved' | 'rejected';

/**
 * A submission as its owner sees it. Not what the reviewer sees: no storage
 * keys, and the document number comes back masked, the way the form showed it.
 */
export interface KycSubmissionView {
  id: string;
  reference: string;
  status: KycStatusValue;
  submittedAt: string;
  reviewedAt: string | null;
  details: {
    fullName: string;
    dateOfBirth: string;
    village: string;
    district: string;
    province: { code: string; name: string };
    fundSource: { code: string; label: string };
  };
  document: {
    type: DocumentTypeValue;
    /** Masked: the last four digits are enough to recognise. */
    number: string;
  };
  photos: { kind: DocumentKindValue; uploadedAt: string }[];
}
