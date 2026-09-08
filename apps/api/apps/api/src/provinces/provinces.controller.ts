import { Controller, Get, Header } from '@nestjs/common';
import { ProvinceList } from './province.types';
import { ProvincesService } from './provinces.service';

@Controller('provinces')
export class ProvincesController {
  constructor(private readonly provinces: ProvincesService) {}

  /**
   * Public: the sign-up flow needs this before anyone has an account. The list
   * changes when Laos redraws a border, so it is worth an hour in any cache
   * between here and the browser.
   */
  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  list(): Promise<ProvinceList> {
    return this.provinces.list();
  }
}
