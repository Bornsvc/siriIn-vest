import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from './../src/prisma/prisma.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { PrismaUsersRepository } from './../src/users/prisma-users.repository';
import { NewUser } from './../src/users/user.entity';
import { DuplicateUserError } from './../src/users/users.repository';

/**
 * The storage contract, against a real Postgres.
 *
 * `AuthService` asks whether an email is taken before it writes, so these
 * duplicates never reach the database on the happy path — which is exactly why
 * they are worth testing here. Two sign-ups racing each other land on the
 * unique index instead, and this suite is what proves the index's rejection is
 * still read as "that email is taken" rather than as a 500.
 */
const ACCOUNT: NewUser = {
  fullName: 'Sayasith Souvannachack',
  email: 'repository@example.com',
  phone: '+8562055510001',
  passwordHash: 'not-a-real-hash',
  acceptedTermsAt: new Date(),
};

describe('PrismaUsersRepository (e2e)', () => {
  let moduleRef: TestingModule;
  let prisma: PrismaService;
  let users: PrismaUsersRepository;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
      providers: [PrismaUsersRepository],
    }).compile();

    await moduleRef.init();
    prisma = moduleRef.get(PrismaService);
    users = moduleRef.get(PrismaUsersRepository);
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it('writes a row and reads it back by every unique field', async () => {
    const created = await users.create(ACCOUNT);

    expect(created.id).toEqual(expect.any(String));
    expect(created.status).toBe('unverified');
    expect(created.createdAt).toBeInstanceOf(Date);

    await expect(users.findById(created.id)).resolves.toEqual(created);
    await expect(users.findByEmail(ACCOUNT.email)).resolves.toEqual(created);
    await expect(users.findByPhone(ACCOUNT.phone)).resolves.toEqual(created);
  });

  it('returns null rather than throwing when nothing matches', async () => {
    await expect(users.findByEmail('nobody@example.com')).resolves.toBeNull();
    await expect(users.findByPhone('+8562000000000')).resolves.toBeNull();
  });

  it('reads the email index rejecting a write as a duplicate email', async () => {
    await users.create(ACCOUNT);

    const error = await failure(
      users.create({ ...ACCOUNT, phone: '+8562055510002' }),
    );

    expect(error).toBeInstanceOf(DuplicateUserError);
    expect((error as DuplicateUserError).field).toBe('email');
  });

  it('reads the phone index rejecting a write as a duplicate phone', async () => {
    await users.create(ACCOUNT);

    const error = await failure(
      users.create({ ...ACCOUNT, email: 'other@example.com' }),
    );

    expect(error).toBeInstanceOf(DuplicateUserError);
    expect((error as DuplicateUserError).field).toBe('phone');
  });
});

/** Resolves with the error the call raised, or fails the test if it succeeded. */
async function failure(action: Promise<unknown>): Promise<unknown> {
  try {
    await action;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the write to be rejected, but it succeeded.');
}
