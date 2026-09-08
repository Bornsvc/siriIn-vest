import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaUsersRepository } from './prisma-users.repository';
import { UsersRepository } from './users.repository';

/**
 * The one place that names a storage implementation. `InMemoryUsersRepository`
 * is still there and still passes the same tests — it is what the unit specs
 * run against, and what this line pointed at before there was a database.
 */
@Module({
  imports: [PrismaModule],
  providers: [{ provide: UsersRepository, useClass: PrismaUsersRepository }],
  exports: [UsersRepository],
})
export class UsersModule {}
