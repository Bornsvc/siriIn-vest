import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiErrorBody,
  ApiErrorCode,
  isApiErrorBody,
} from '../errors/api-error';

/** Status codes Nest raises on its own, mapped onto our vocabulary. */
const CODE_BY_STATUS: Partial<Record<HttpStatus, ApiErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ApiErrorCode.VALIDATION_FAILED,
  [HttpStatus.UNAUTHORIZED]: ApiErrorCode.UNAUTHENTICATED,
  [HttpStatus.NOT_FOUND]: ApiErrorCode.NOT_FOUND,
};

/**
 * The single exit for every failure: one response shape, and nothing internal
 * on the wire. Stack traces go to the log, never to the client.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const status = statusOf(exception);
    const body = bodyOf(exception, status);

    // Structured, and deliberately free of PII: no request body, no headers.
    const context = {
      method: request.method,
      path: request.url,
      status,
      code: body.error.code,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        JSON.stringify({ message: 'Request failed', ...context }),
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(
        JSON.stringify({ message: 'Request rejected', ...context }),
      );
    }

    response.status(status).json(body);
  }
}

function statusOf(exception: unknown): HttpStatus {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
}

function bodyOf(exception: unknown, status: HttpStatus): ApiErrorBody {
  if (exception instanceof HttpException) {
    const response: unknown = exception.getResponse();
    if (isApiErrorBody(response)) return response;

    return {
      error: {
        code: CODE_BY_STATUS[status] ?? ApiErrorCode.INTERNAL_ERROR,
        message: messageOf(response) ?? exception.message,
        details: [],
      },
    };
  }

  return {
    error: {
      code: ApiErrorCode.INTERNAL_ERROR,
      message: 'Something went wrong on our side. Try again in a moment.',
      details: [],
    },
  };
}

function messageOf(response: unknown): string | null {
  if (typeof response === 'string') return response;
  if (typeof response === 'object' && response !== null) {
    const message: unknown = (response as { message?: unknown }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && typeof message[0] === 'string')
      return message[0];
  }
  return null;
}
