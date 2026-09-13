import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import type { FxRate } from '@db';
import { ApiErrorCode, ApiException } from '../common/errors/api-error';
import { PrismaService } from '../prisma/prisma.service';
import { FxRateView } from './fx.types';

@Injectable()
export class FxService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * The most recently observed rate.
   *
   * Rows are never updated, so "current" is simply the newest one. Callers
   * that record a conversion keep this row's id rather than its number: the
   * rate a customer was quoted has to survive the next observation.
   */
  async current(): Promise<FxRate> {
    const rate = await this.prisma.fxRate.findFirst({
      orderBy: { observedAt: 'desc' },
    });

    if (!rate) {
      // Only reachable on a database that skipped the seeding migration.
      throw new ApiException(
        HttpStatus.SERVICE_UNAVAILABLE,
        ApiErrorCode.NO_FX_RATE,
        'The kip rate is unavailable right now. Try again in a moment.',
      );
    }

    return rate;
  }

  async currentView(): Promise<FxRateView> {
    return toFxRateView(await this.current());
  }
}

export function toFxRateView(rate: FxRate): FxRateView {
  return {
    id: rate.id,
    usdLak: rate.usdLak.toFixed(2),
    source: rate.source,
    observedAt: rate.observedAt.toISOString(),
  };
}
