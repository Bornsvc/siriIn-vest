import { randomInt } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@db';
import { unauthenticated } from '../auth/auth.errors';
import { FxService, toFxRateView } from '../fx/fx.service';
import { PrismaService } from '../prisma/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import {
  MIN_DEPOSIT_KIP,
  MIN_DEPOSIT_USD,
  MIN_WITHDRAW_USD,
} from './validation/money-rules';
import {
  belowMinimum,
  identityNotVerified,
  insufficientFunds,
} from './wallet.errors';
import { TransferPage, TransferView, WalletSummary } from './wallet.types';

const UNIQUE_VIOLATION = 'P2002';
const REFERENCE_ATTEMPTS = 5;
const DEFAULT_PAGE = 20;
const MAX_PAGE = 100;

const WITH_RATE = { fxRate: true } as const;

type TransferRow = Prisma.TransferGetPayload<{ include: typeof WITH_RATE }>;

const ZERO = new Prisma.Decimal(0);

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fx: FxService,
  ) {}

  /** What the buying-power card reads. */
  async summary(userId: string): Promise<WalletSummary> {
    const settled = await this.settledBalance(userId);

    const pending = await this.prisma.transfer.aggregate({
      _sum: { amountUsd: true },
      // Withdrawals are debited the moment they are requested, so only money
      // on its way *in* is still outstanding.
      where: { userId, kind: 'deposit', status: 'pending' },
    });

    return {
      cash: {
        settledUsd: settled.toFixed(2),
        pendingUsd: (pending._sum.amountUsd ?? ZERO).toFixed(2),
      },
      fx: toFxRateView(await this.fx.current()),
    };
  }

  async deposit(userId: string, dto: DepositDto): Promise<TransferView> {
    await this.assertVerified(userId);
    const rate = await this.fx.current();

    const typed = new Prisma.Decimal(dto.amount);
    const amountKip =
      dto.currency === 'lak'
        ? typed.toDecimalPlaces(2)
        : typed.times(rate.usdLak).toDecimalPlaces(2);
    // Rounded down: never credit more dollars than the kip actually covers.
    const amountUsd =
      dto.currency === 'lak'
        ? typed
            .dividedBy(rate.usdLak)
            .toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN)
        : typed.toDecimalPlaces(2);

    if (dto.currency === 'lak' && amountKip.lessThan(MIN_DEPOSIT_KIP)) {
      throw belowMinimum(
        'amount',
        `The minimum deposit is ₭${MIN_DEPOSIT_KIP.toLocaleString('en-US')}.`,
      );
    }
    if (dto.currency === 'usd' && amountUsd.lessThan(MIN_DEPOSIT_USD)) {
      throw belowMinimum(
        'amount',
        `The minimum deposit is $${MIN_DEPOSIT_USD}.`,
      );
    }

    const transfer = await this.withReference('SI-DEP', (reference) =>
      this.prisma.transfer.create({
        data: {
          userId,
          kind: 'deposit',
          reference,
          amountKip,
          amountUsd,
          enteredIn: dto.currency,
          fxRateId: rate.id,
        },
        include: WITH_RATE,
      }),
    );

    // The reference, never the amount: this line goes to a log.
    this.logger.log(
      JSON.stringify({
        message: 'Deposit requested',
        reference: transfer.reference,
      }),
    );

    return toTransferView(transfer);
  }

  async withdraw(userId: string, dto: WithdrawDto): Promise<TransferView> {
    await this.assertVerified(userId);
    const rate = await this.fx.current();

    const amountUsd = new Prisma.Decimal(dto.amountUsd).toDecimalPlaces(2);
    if (amountUsd.lessThan(MIN_WITHDRAW_USD)) {
      throw belowMinimum(
        'amountUsd',
        `The minimum withdrawal is $${MIN_WITHDRAW_USD}.`,
      );
    }
    const amountKip = amountUsd.times(rate.usdLak).toDecimalPlaces(2);

    const transfer = await this.withReference('SI-WDR', (reference) =>
      this.prisma.$transaction(async (tx) => {
        // Two withdrawals racing must not both pass the balance check. A
        // ledger has no balance row to lock, so the customer's id is the lock.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`;

        const balance = await tx.cashEntry.aggregate({
          _sum: { amountUsd: true },
          where: { userId },
        });
        const available = balance._sum.amountUsd ?? ZERO;

        if (amountUsd.greaterThan(available)) {
          throw insufficientFunds(available.toFixed(2));
        }

        const created = await tx.transfer.create({
          data: {
            userId,
            kind: 'withdrawal',
            reference,
            amountKip,
            amountUsd,
            enteredIn: 'usd',
            fxRateId: rate.id,
          },
          include: WITH_RATE,
        });

        // Debited on request, not on settlement: the money is spoken for the
        // moment it is asked for, or it could be spent twice while in flight.
        await tx.cashEntry.create({
          data: {
            userId,
            amountUsd: amountUsd.negated(),
            kind: 'withdrawal',
            transferId: created.id,
            description: `Withdrawal ${created.reference}`,
          },
        });

        return created;
      }),
    );

    this.logger.log(
      JSON.stringify({
        message: 'Withdrawal requested',
        reference: transfer.reference,
      }),
    );

    return toTransferView(transfer);
  }

  async transfers(
    userId: string,
    options: { limit?: number; cursor?: string } = {},
  ): Promise<TransferPage> {
    const take = Math.min(Math.max(options.limit ?? DEFAULT_PAGE, 1), MAX_PAGE);

    const rows = await this.prisma.transfer.findMany({
      where: { userId },
      orderBy: [{ requestedAt: 'desc' }, { id: 'desc' }],
      // One more than asked for, to know whether a next page exists without
      // counting the whole table.
      take: take + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
      include: WITH_RATE,
    });

    const page = rows.slice(0, take);

    return {
      transfers: page.map(toTransferView),
      nextCursor: rows.length > take ? (page.at(-1)?.id ?? null) : null,
    };
  }

  /**
   * Back office. There is no route for these yet, because there is no
   * reviewer role to put in front of one — the same gap that leaves KYC
   * approval to hand-written SQL.
   */
  async settle(transferId: string): Promise<TransferView> {
    return this.resolve(transferId, async (tx, transfer) => {
      if (transfer.kind === 'deposit') {
        await tx.cashEntry.create({
          data: {
            userId: transfer.userId,
            amountUsd: transfer.amountUsd,
            kind: 'deposit',
            transferId: transfer.id,
            description: `Deposit ${transfer.reference}`,
          },
        });
      }
      // A withdrawal was already debited when it was requested.

      return tx.transfer.update({
        where: { id: transfer.id },
        data: { status: 'settled', settledAt: new Date() },
        include: WITH_RATE,
      });
    });
  }

  async fail(transferId: string, reason: string): Promise<TransferView> {
    return this.resolve(transferId, async (tx, transfer) => {
      if (transfer.kind === 'withdrawal') {
        // Give back what the request reserved.
        await tx.cashEntry.create({
          data: {
            userId: transfer.userId,
            amountUsd: transfer.amountUsd,
            kind: 'withdrawal_reversal',
            transferId: transfer.id,
            description: `Withdrawal ${transfer.reference} returned`,
          },
        });
      }

      return tx.transfer.update({
        where: { id: transfer.id },
        data: { status: 'failed', failureReason: reason },
        include: WITH_RATE,
      });
    });
  }

  private async resolve(
    transferId: string,
    change: (
      tx: Prisma.TransactionClient,
      transfer: TransferRow,
    ) => Promise<TransferRow>,
  ): Promise<TransferView> {
    const updated = await this.prisma.$transaction(async (tx) => {
      const transfer = await tx.transfer.findUnique({
        where: { id: transferId },
        include: WITH_RATE,
      });

      if (!transfer) throw new Error(`No transfer ${transferId}.`);
      // Only a pending transfer can move, so running this twice is harmless.
      if (transfer.status !== 'pending') return transfer;

      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${transfer.userId}, 0))`;
      return change(tx, transfer);
    });

    return toTransferView(updated);
  }

  private async settledBalance(userId: string): Promise<Prisma.Decimal> {
    const balance = await this.prisma.cashEntry.aggregate({
      _sum: { amountUsd: true },
      where: { userId },
    });
    return balance._sum.amountUsd ?? ZERO;
  }

  private async assertVerified(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { status: true },
    });

    if (!user) {
      throw unauthenticated('Your session is no longer valid. Sign in again.');
    }
    if (user.status !== 'verified') throw identityNotVerified();
  }

  /** Seven digits collide rarely, and rarely is not never. */
  private async withReference<T>(
    prefix: string,
    create: (reference: string) => Promise<T>,
  ): Promise<T> {
    for (let attempt = 1; attempt <= REFERENCE_ATTEMPTS; attempt += 1) {
      try {
        return await create(`${prefix}-${randomInt(1_000_000, 10_000_000)}`);
      } catch (error) {
        if (!isReferenceCollision(error)) throw error;
      }
    }

    throw new Error(
      `Could not find an unused ${prefix} reference in ${REFERENCE_ATTEMPTS} attempts.`,
    );
  }
}

function isReferenceCollision(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_VIOLATION &&
    JSON.stringify(error.meta ?? '').includes('reference')
  );
}

function toTransferView(row: TransferRow): TransferView {
  return {
    id: row.id,
    reference: row.reference,
    kind: row.kind,
    status: row.status,
    amountKip: row.amountKip.toFixed(2),
    amountUsd: row.amountUsd.toFixed(2),
    enteredIn: row.enteredIn,
    usdLak: row.fxRate.usdLak.toFixed(2),
    requestedAt: row.requestedAt.toISOString(),
    settledAt: row.settledAt?.toISOString() ?? null,
    failureReason: row.failureReason,
  };
}
