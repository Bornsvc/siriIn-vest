import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Global because the connection is a process-wide resource: one pool, however
 * many modules end up reading from it.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
