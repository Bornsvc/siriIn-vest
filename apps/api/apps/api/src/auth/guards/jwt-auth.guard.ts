import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { unauthenticated } from '../auth.errors';
import { AccessTokenPayload, AuthenticatedUser } from '../auth.types';

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

/**
 * Route-level authentication. A verified token is the only way past it, and
 * what it puts on the request is the token's claims — never a trusted header.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = bearerToken(request.headers.authorization);

    if (!token) {
      throw unauthenticated('Sign in to continue.');
    }

    try {
      const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token);
      request.user = { id: payload.sub, email: payload.email };
      return true;
    } catch {
      // Expired, tampered with, or signed by something else — all the same
      // answer, and none of the detail goes to the client.
      throw unauthenticated('Your session has expired. Sign in again.');
    }
  }
}

function bearerToken(header: string | undefined): string | null {
  const [scheme, value] = header?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && value ? value : null;
}
