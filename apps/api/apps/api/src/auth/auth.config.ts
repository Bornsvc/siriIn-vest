import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AuthConfig {
  secret: string;
  ttlSeconds: number;
}

/** Good enough to run the app on a laptop, useless to anyone off it. */
const DEVELOPMENT_SECRET = 'siriinvest-development-secret-do-not-deploy';
const DEFAULT_TTL_SECONDS = 60 * 60;

/**
 * Every issued token rests on this secret, so a missing one is fatal in
 * production and merely loud in development.
 */
export function readAuthConfig(config: ConfigService): AuthConfig {
  const logger = new Logger('AuthConfig');
  const secret = config.get<string>('JWT_SECRET')?.trim();
  const production = config.get<string>('NODE_ENV') === 'production';

  if (!secret && production) {
    throw new Error(
      'JWT_SECRET is not set. Every access token is signed with it, so the API will not start without one.',
    );
  }
  if (!secret) {
    logger.warn(
      'JWT_SECRET is not set — signing with the development secret. Tokens issued now are not safe anywhere but this machine.',
    );
  }

  return {
    secret: secret || DEVELOPMENT_SECRET,
    ttlSeconds: readTtlSeconds(config, logger),
  };
}

function readTtlSeconds(config: ConfigService, logger: Logger): number {
  const raw = config.get<string>('JWT_TTL_SECONDS');
  if (!raw) return DEFAULT_TTL_SECONDS;

  const seconds = Number.parseInt(raw, 10);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    logger.warn(
      `JWT_TTL_SECONDS is "${raw}", which is not a positive number of seconds — falling back to ${DEFAULT_TTL_SECONDS}.`,
    );
    return DEFAULT_TTL_SECONDS;
  }
  return seconds;
}

/** Injection token for the resolved {@link AuthConfig}, read once at startup. */
export const AUTH_CONFIG = Symbol('AUTH_CONFIG');
