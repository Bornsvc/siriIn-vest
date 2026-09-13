import { Controller, Get, Header } from '@nestjs/common';
import { FxService } from './fx.service';
import { FxRateView } from './fx.types';

@Controller('fx')
export class FxController {
  constructor(private readonly fx: FxService) {}

  /**
   * Public: the Bridge Bar shows the rate above every screen, and every kip
   * figure in the app is derived from it. Cached briefly — a rate that is a
   * minute stale is fine; twenty different rates on one screen is not.
   */
  @Get('rate')
  @Header('Cache-Control', 'public, max-age=60')
  rate(): Promise<FxRateView> {
    return this.fx.currentView();
  }
}
