import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Every failure this API admits to. The message is prose for a person; the
 * code is the contract a client branches on, so codes never change wording.
 */
export const ApiErrorCode = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  PHONE_ALREADY_REGISTERED: 'PHONE_ALREADY_REGISTERED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  KYC_ALREADY_IN_REVIEW: 'KYC_ALREADY_IN_REVIEW',
  KYC_ALREADY_APPROVED: 'KYC_ALREADY_APPROVED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/** One faulty field, named the way the form names it. */
export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details: ApiErrorDetail[];
  };
}

/** The only exception this codebase throws on purpose. */
export class ApiException extends HttpException {
  constructor(
    status: HttpStatus,
    code: ApiErrorCode,
    message: string,
    details: ApiErrorDetail[] = [],
  ) {
    super({ error: { code, message, details } } satisfies ApiErrorBody, status);
  }

  get body(): ApiErrorBody {
    return this.getResponse() as ApiErrorBody;
  }
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) {
    return false;
  }
  const error: unknown = value.error;
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { code?: unknown }).code === 'string' &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}
