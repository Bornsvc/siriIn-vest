import { Module } from '@nestjs/common';
import { FundSourcesController } from './fund-sources.controller';
import { FundSourcesService } from './fund-sources.service';

@Module({
  controllers: [FundSourcesController],
  providers: [FundSourcesService],
  exports: [FundSourcesService],
})
export class FundSourcesModule {}
