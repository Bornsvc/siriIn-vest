import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ApiExceptionFilter } from './../src/common/filters/api-exception.filter';
import { buildValidationPipe } from './../src/common/validation/validation.pipe';
import { PrismaService } from './../src/prisma/prisma.service';
import { WalletService } from './../src/wallet/wallet.service';
import {
  TransferPage,
  TransferView,
  WalletSummary,
} from './../src/wallet/wallet.types';

interface ErrorBody {
  error: {
    code: string;
    message: string;
    details: { field: string; message: string }[];
  };
}

function bodyOf<T>(response: request.Response): T {
  return response.body as T;
}

describe('Wallet (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let wallet: WalletService;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleFixture.get(PrismaService);
    wallet = moduleFixture.get(WalletService);
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(buildValidationPipe());
    app.useGlobalFilters(new ApiExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();

    const signUp = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({
        name: 'Sayasith Souvannachack',
        email: 'wallet@example.com',
        phone: '20 5551 7070',
        password: 'vientiane1',
        acceptedTerms: true,
      })
      .expect(201);

    const body = signUp.body as { accessToken: string; user: { id: string } };
    token = body.accessToken;
    userId = body.user.id;
  });

  /** What a reviewer approving the identity check would do. */
  async function verify() {
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'verified' },
    });
  }

  const auth = () => ({ Authorization: `Bearer ${token}` });

  function summary() {
    return request(app.getHttpServer()).get('/wallet').set(auth());
  }

  function deposit(body: object) {
    return request(app.getHttpServer())
      .post('/wallet/deposits')
      .set(auth())
      .send(body);
  }

  function withdraw(body: object) {
    return request(app.getHttpServer())
      .post('/wallet/withdrawals')
      .set(auth())
      .send(body);
  }

  describe('GET /fx/rate', () => {
    it('is public, because the rate sits above every screen', async () => {
      const response = await request(app.getHttpServer())
        .get('/fx/rate')
        .expect(200);

      expect(response.body).toMatchObject({
        usdLak: '21650.00',
        source: 'seed:indicative',
      });
      expect(response.headers['cache-control']).toBe('public, max-age=60');
    });
  });

  describe('before the identity check clears', () => {
    it('refuses a deposit', async () => {
      const response = await deposit({
        currency: 'lak',
        amount: 1_000_000,
      }).expect(403);

      expect(bodyOf<ErrorBody>(response).error.code).toBe(
        'IDENTITY_NOT_VERIFIED',
      );
    });

    it('refuses a withdrawal', async () => {
      await withdraw({ amountUsd: 50 }).expect(403);
    });

    it('still answers the balance, which is nothing', async () => {
      const response = await summary().expect(200);

      expect(bodyOf<WalletSummary>(response).cash).toEqual({
        settledUsd: '0.00',
        pendingUsd: '0.00',
      });
    });
  });

  describe('deposits', () => {
    beforeEach(verify);

    it('converts kip to dollars at the current rate', async () => {
      const response = await deposit({
        currency: 'lak',
        amount: 1_000_000,
      }).expect(201);

      const transfer = bodyOf<TransferView>(response);

      expect(transfer).toMatchObject({
        kind: 'deposit',
        status: 'pending',
        amountKip: '1000000.00',
        // 1,000,000 / 21,650 = 46.1893…, rounded down to the cent.
        amountUsd: '46.18',
        enteredIn: 'lak',
        usdLak: '21650.00',
      });
      expect(transfer.reference).toMatch(/^SI-DEP-\d{7}$/);
    });

    it('converts dollars to kip when that is the side typed', async () => {
      const response = await deposit({ currency: 'usd', amount: 100 }).expect(
        201,
      );

      expect(bodyOf<TransferView>(response)).toMatchObject({
        amountUsd: '100.00',
        amountKip: '2165000.00',
        enteredIn: 'usd',
      });
    });

    it('shows up as pending, not as settled cash', async () => {
      await deposit({ currency: 'usd', amount: 320 }).expect(201);

      expect(bodyOf<WalletSummary>(await summary().expect(200)).cash).toEqual({
        settledUsd: '0.00',
        pendingUsd: '320.00',
      });
    });

    it('holds the floor the form states', async () => {
      const response = await deposit({
        currency: 'lak',
        amount: 100_000,
      }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.details).toEqual([
        { field: 'amount', message: 'The minimum deposit is ₭200,000.' },
      ]);
    });

    it('refuses an amount that is not one', async () => {
      await deposit({ currency: 'usd', amount: -5 }).expect(400);
      await deposit({ currency: 'usd', amount: 0 }).expect(400);
    });

    it('credits the ledger only when it settles', async () => {
      const created = bodyOf<TransferView>(
        await deposit({ currency: 'usd', amount: 500 }).expect(201),
      );

      await wallet.settle(created.id);

      expect(bodyOf<WalletSummary>(await summary().expect(200)).cash).toEqual({
        settledUsd: '500.00',
        pendingUsd: '0.00',
      });
    });
  });

  describe('withdrawals', () => {
    beforeEach(async () => {
      await verify();
      const funded = bodyOf<TransferView>(
        await deposit({ currency: 'usd', amount: 1000 }).expect(201),
      );
      await wallet.settle(funded.id);
    });

    it('debits the moment it is asked for', async () => {
      await withdraw({ amountUsd: 250 }).expect(201);

      expect(bodyOf<WalletSummary>(await summary().expect(200)).cash).toEqual({
        settledUsd: '750.00',
        pendingUsd: '0.00',
      });
    });

    it('will not draw on money that is not settled', async () => {
      const response = await withdraw({ amountUsd: 1500 }).expect(409);

      expect(bodyOf<ErrorBody>(response).error.code).toBe('INSUFFICIENT_FUNDS');
    });

    it('gives the money back when it fails', async () => {
      const requested = bodyOf<TransferView>(
        await withdraw({ amountUsd: 400 }).expect(201),
      );

      await wallet.fail(requested.id, 'Bank rejected the account number.');

      expect(bodyOf<WalletSummary>(await summary().expect(200)).cash).toEqual({
        settledUsd: '1000.00',
        pendingUsd: '0.00',
      });
    });

    it('holds the floor', async () => {
      const response = await withdraw({ amountUsd: 5 }).expect(400);

      expect(bodyOf<ErrorBody>(response).error.details).toEqual([
        { field: 'amountUsd', message: 'The minimum withdrawal is $10.' },
      ]);
    });

    it('cannot be spent twice by asking twice at once', async () => {
      // Both ask for most of the balance. The ledger has no row to lock, so
      // the advisory lock on the customer is what has to hold here.
      const [first, second] = await Promise.all([
        withdraw({ amountUsd: 700 }),
        withdraw({ amountUsd: 700 }),
      ]);

      const codes = [first.status, second.status].sort();
      expect(codes).toEqual([201, 409]);

      expect(
        bodyOf<WalletSummary>(await summary().expect(200)).cash.settledUsd,
      ).toBe('300.00');
    });
  });

  describe('the rate a transfer was fixed at', () => {
    beforeEach(verify);

    it('does not move when the rate does', async () => {
      const created = bodyOf<TransferView>(
        await deposit({ currency: 'lak', amount: 1_000_000 }).expect(201),
      );

      // The desk posts a new rate an hour later.
      await prisma.fxRate.create({
        data: {
          usdLak: '30000.00',
          source: 'test:moved',
          observedAt: new Date(Date.now() + 3_600_000),
        },
      });

      const response = await request(app.getHttpServer())
        .get('/wallet/transfers')
        .set(auth())
        .expect(200);

      const [transfer] = bodyOf<TransferPage>(response).transfers;
      expect(transfer.id).toBe(created.id);
      expect(transfer.usdLak).toBe('21650.00');
      expect(transfer.amountUsd).toBe('46.18');
    });
  });

  describe('GET /wallet/transfers', () => {
    beforeEach(verify);

    it('pages newest first', async () => {
      for (const amount of [100, 200, 300]) {
        await deposit({ currency: 'usd', amount }).expect(201);
      }

      const first = bodyOf<TransferPage>(
        await request(app.getHttpServer())
          .get('/wallet/transfers?limit=2')
          .set(auth())
          .expect(200),
      );

      expect(first.transfers).toHaveLength(2);
      expect(first.nextCursor).toEqual(expect.any(String));

      const second = bodyOf<TransferPage>(
        await request(app.getHttpServer())
          .get(`/wallet/transfers?limit=2&cursor=${first.nextCursor}`)
          .set(auth())
          .expect(200),
      );

      expect(second.transfers).toHaveLength(1);
      expect(second.nextCursor).toBeNull();

      const ids = [...first.transfers, ...second.transfers].map((t) => t.id);
      expect(new Set(ids).size).toBe(3);
    });
  });

  it('needs a token', async () => {
    await request(app.getHttpServer()).get('/wallet').expect(401);
    await request(app.getHttpServer()).post('/wallet/deposits').expect(401);
  });
});
