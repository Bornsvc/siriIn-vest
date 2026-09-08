import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { unauthenticated } from '../auth.errors';
import { AuthenticatedUser } from '../auth.types';
import { AuthenticatedRequest } from './jwt-auth.guard';

/**
 * The caller, as the token described them. Only meaningful behind
 * {@link JwtAuthGuard}; without it there is nothing to read, and saying so is
 * better than handing a handler an undefined user.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw unauthenticated('Sign in to continue.');
    }
    return request.user;
  },
);
