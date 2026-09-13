import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FundSourcesModule } from './fund-sources/fund-sources.module';
import { FxModule } from './fx/fx.module';
import { KycModule } from './kyc/kyc.module';
import { ProfileModule } from './profile/profile.module';
import { ProvincesModule } from './provinces/provinces.module';
import { WalletModule } from './wallet/wallet.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    StorageModule,
    UsersModule,
    AuthModule,
    ProvincesModule,
    ProfileModule,
    FundSourcesModule,
    KycModule,
    FxModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
