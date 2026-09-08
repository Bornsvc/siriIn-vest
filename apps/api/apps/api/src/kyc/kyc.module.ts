import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';

@Module({
  // For the JwtService the guard verifies tokens with.
  imports: [AuthModule],
  controllers: [KycController],
  providers: [KycService],
})
export class KycModule {}
