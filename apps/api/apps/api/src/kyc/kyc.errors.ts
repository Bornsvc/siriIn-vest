import { HttpStatus } from '@nestjs/common';
import {
  ApiErrorCode,
  ApiErrorDetail,
  ApiException,
} from '../common/errors/api-error';

export function kycAlreadyInReview(): ApiException {
  return new ApiException(
    HttpStatus.CONFLICT,
    ApiErrorCode.KYC_ALREADY_IN_REVIEW,
    'Your identity check is already with the reviewer. We will let you know when it clears.',
  );
}

export function kycAlreadyApproved(): ApiException {
  return new ApiException(
    HttpStatus.CONFLICT,
    ApiErrorCode.KYC_ALREADY_APPROVED,
    'Your identity is already verified — there is nothing left to send.',
  );
}

/** A field the form should have caught, answered the way the form would. */
export function kycRejected(field: string, message: string): ApiException {
  const details: ApiErrorDetail[] = [{ field, message }];
  return new ApiException(
    HttpStatus.BAD_REQUEST,
    ApiErrorCode.VALIDATION_FAILED,
    message,
    details,
  );
}

export function kycNotFound(): ApiException {
  return new ApiException(
    HttpStatus.NOT_FOUND,
    ApiErrorCode.NOT_FOUND,
    'You have not sent an identity check yet.',
  );
}
