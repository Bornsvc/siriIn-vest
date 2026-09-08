import { HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import {
  ApiErrorCode,
  ApiErrorDetail,
  ApiException,
} from '../errors/api-error';

/**
 * Validation is the boundary: nothing past this pipe has an unchecked shape.
 * Unknown properties are stripped and rejected rather than ignored, so a
 * client cannot smuggle a field the DTO never declared.
 */
export function buildValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    // The forms show one message per field; the API says the same thing.
    stopAtFirstError: true,
    exceptionFactory: (errors: ValidationError[]) =>
      validationException(flatten(errors)),
  });
}

export function validationException(details: ApiErrorDetail[]): ApiException {
  return new ApiException(
    HttpStatus.BAD_REQUEST,
    ApiErrorCode.VALIDATION_FAILED,
    details[0]?.message ?? 'Check the highlighted fields.',
    details,
  );
}

function flatten(errors: ValidationError[], prefix = ''): ApiErrorDetail[] {
  return errors.flatMap((error) => {
    const field = prefix ? `${prefix}.${error.property}` : error.property;
    const messages = Object.values(error.constraints ?? {});
    const own = messages.length ? [{ field, message: messages[0] }] : [];
    return [...own, ...flatten(error.children ?? [], field)];
  });
}
