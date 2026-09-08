import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Province, ProvinceList } from './province.types';

/**
 * Reference data, read-only. There is no repository seam here the way there is
 * for users: this has one implementation, no second one in sight, and nothing
 * that needs to stand in for it in a test.
 */
@Injectable()
export class ProvincesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * All 18, in one response. A closed list of administrative divisions is not
   * a collection that grows, so it is not paginated — ordered by name because
   * that is the order someone scans a select.
   */
  async list(): Promise<ProvinceList> {
    const provinces: Province[] = await this.prisma.province.findMany({
      orderBy: { name: 'asc' },
      select: { code: true, name: true, kind: true },
    });

    return { provinces };
  }
}
