import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/guards/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletService } from './wallet.service';
import { TransferPage, TransferView, WalletSummary } from './wallet.types';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  /** Settled cash, money still on its way in, and the rate to read it in kip. */
  @Get()
  summary(@CurrentUser() user: AuthenticatedUser): Promise<WalletSummary> {
    return this.wallet.summary(user.id);
  }

  /**
   * Paged, because a customer's transfer history only grows. `cursor` is the
   * id of the last row of the previous page.
   */
  @Get('transfers')
  transfers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('cursor') cursor?: string,
  ): Promise<TransferPage> {
    return this.wallet.transfers(user.id, { limit, cursor });
  }

  @Post('deposits')
  @HttpCode(HttpStatus.CREATED)
  deposit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DepositDto,
  ): Promise<TransferView> {
    return this.wallet.deposit(user.id, dto);
  }

  @Post('withdrawals')
  @HttpCode(HttpStatus.CREATED)
  withdraw(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: WithdrawDto,
  ): Promise<TransferView> {
    return this.wallet.withdraw(user.id, dto);
  }
}
