import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FundSource, FundSourceList } from './fund-source.types';

@Injectable()
export class FundSourcesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * In the order the form offers them, which is not alphabetical — salary
   * first, because it is the common answer.
   */
  async list(): Promise<FundSourceList> {
    const fundSources: FundSource[] = await this.prisma.fundSource.findMany({
      orderBy: { position: 'asc' },
      select: { code: true, label: true },
    });

    return { fundSources };
  }
}
