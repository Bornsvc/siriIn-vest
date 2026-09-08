import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { Province } from './../src/provinces/province.types';

/**
 * The provinces are seeded by their migration, so this is really a check on
 * the migration: a database that has been migrated carries the whole list.
 * A row missing here is a row missing in production — and missing from the
 * only select on the identity form.
 */
describe('Provinces (e2e)', () => {
  let moduleRef: TestingModule;
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('the seeded rows', () => {
    it('carry all 17 provinces and the capital prefecture', async () => {
      const provinces = await prisma.province.findMany({
        orderBy: { name: 'asc' },
      });

      expect(provinces).toHaveLength(18);
      expect(provinces.filter((p) => p.kind === 'province')).toHaveLength(17);
      expect(provinces.filter((p) => p.kind === 'prefecture')).toEqual([
        {
          code: 'vientiane-prefecture',
          name: 'Vientiane Prefecture',
          kind: 'prefecture',
        },
      ]);
    });

    it('are keyed on a slug, so nothing joins on a romanization', async () => {
      const provinces = await prisma.province.findMany();

      for (const province of provinces) {
        expect(province.code).toMatch(/^[a-z]+(-[a-z]+)*$/);
      }
    });
  });

  describe('GET /provinces', () => {
    it('answers with the whole list, in the order a select is read', async () => {
      const response = await request(app.getHttpServer())
        .get('/provinces')
        .expect(200);

      const { provinces } = response.body as { provinces: Province[] };

      expect(provinces).toHaveLength(18);
      expect(provinces[0]).toEqual({
        code: 'attapeu',
        name: 'Attapeu',
        kind: 'province',
      });
      expect(provinces.map((p) => p.name)).toEqual(
        [...provinces.map((p) => p.name)].sort((a, b) => a.localeCompare(b)),
      );
    });

    it('needs no token — the form asks for this before anyone has one', async () => {
      await request(app.getHttpServer()).get('/provinces').expect(200);
    });

    it('is cacheable, because the list changes when a border does', async () => {
      const response = await request(app.getHttpServer())
        .get('/provinces')
        .expect(200);

      expect(response.headers['cache-control']).toBe('public, max-age=3600');
    });
  });
});
