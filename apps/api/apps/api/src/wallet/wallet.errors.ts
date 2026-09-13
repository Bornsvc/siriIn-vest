import { HttpStatus } from '@nestjs/common';
import { ApiErrorCode, ApiException } from '../common/errors/api-error';

/**
 * The rule the account screen already states: trading, deposits and
 * withdrawals open when the identity check clears.
 */
export function identityNotVerified(): ApiException {
  return new ApiException(
    HttpStatus.FORBIDDEN,
    ApiErrorCode.IDENTITY_NOT_VERIFIED,
    'Verify your identity before moving money.',
  );
}

export function insufficientFunds(availableUsd: string): ApiException {
  return new ApiException(
    HttpStatus.CONFLICT,
    ApiErrorCode.INSUFFICIENT_FUNDS,
    `You have $${availableUsd} settled. Withdrawals can only draw on settled cash.`,
    [{ field: 'amountUsd', message: 'More than your settled balance.' }],
  );
}

export function belowMinimum(field: string, message: string): ApiException {
  return new ApiException(
    HttpStatus.BAD_REQUEST,
    ApiErrorCode.VALIDATION_FAILED,
    message,
    [{ field, message }],
  );
}
