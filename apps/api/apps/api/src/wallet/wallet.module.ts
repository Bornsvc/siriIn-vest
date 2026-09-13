import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FxModule } from '../fx/fx.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  // AuthModule for the JwtService the guard verifies tokens with.
  imports: [AuthModule, FxModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
