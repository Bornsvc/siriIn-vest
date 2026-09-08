import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode, ApiException } from '../common/errors/api-error';

const EMAIL_TAKEN = 'That email already has an account. Log in instead.';
const PHONE_TAKEN = 'That phone number already has an account. Log in instead.';

export function emailAlreadyRegistered(): ApiException {
  return new ApiException(
    HttpStatus.CONFLICT,
    ApiErrorCode.EMAIL_ALREADY_REGISTERED,
    EMAIL_TAKEN,
    [{ field: 'email', message: EMAIL_TAKEN }],
  );
}

export function phoneAlreadyRegistered(): ApiException {
  return new ApiException(
    HttpStatus.CONFLICT,
    ApiErrorCode.PHONE_ALREADY_REGISTERED,
    PHONE_TAKEN,
    [{ field: 'phone', message: PHONE_TAKEN }],
  );
}

/**
 * One answer for a wrong password and for an email that was never registered.
 * Telling them apart would turn the sign-in form into a list of our customers.
 */
export function invalidCredentials(): ApiException {
  return new ApiException(
    HttpStatus.UNAUTHORIZED,
    ApiErrorCode.INVALID_CREDENTIALS,
    'That email and password do not match.',
  );
}

export function unauthenticated(message: string): ApiException {
  return new ApiException(
    HttpStatus.UNAUTHORIZED,
    ApiErrorCode.UNAUTHENTICATED,
    message,
  );
}
