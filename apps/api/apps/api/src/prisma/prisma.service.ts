import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@db';

/**
 * The Prisma client, with its life tied to the Nest container: connected when
 * the app starts, disconnected when it stops, so a shutdown does not leave
 * sockets open on the database.
 *
 * Prisma 7 has no engine binary — the connection is a real `pg` pool behind a
 * driver adapter, which is also why the connection string is read here rather
 * than by Prisma itself.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService) {
    super({ adapter: new PrismaPg({ connectionString: urlFrom(config) }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connected to the database.');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

function urlFrom(config: ConfigService): string {
  const url = config.get<string>('DATABASE_URL')?.trim();
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy apps/api/.env.example to apps/api/.env and point it at your Postgres.',
    );
  }
  return url;
}
