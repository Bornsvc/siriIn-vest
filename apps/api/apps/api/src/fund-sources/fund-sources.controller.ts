import { Controller, Get, Header } from '@nestjs/common';
import { FundSourceList } from './fund-source.types';
import { FundSourcesService } from './fund-sources.service';

@Controller('fund-sources')
export class FundSourcesController {
  constructor(private readonly fundSources: FundSourcesService) {}

  /** Public and cacheable, for the same reasons `/provinces` is. */
  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  list(): Promise<FundSourceList> {
    return this.fundSources.list();
  }
}
