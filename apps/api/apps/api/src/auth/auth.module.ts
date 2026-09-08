import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthConfigModule } from './auth-config.module';
import { AUTH_CONFIG, AuthConfig } from './auth.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BcryptPasswordHasher, PasswordHasher } from './password-hasher';

@Module({
  imports: [
    UsersModule,
    AuthConfigModule,
    JwtModule.registerAsync({
      imports: [AuthConfigModule],
      inject: [AUTH_CONFIG],
      useFactory: ({ secret, ttlSeconds }: AuthConfig) => ({
        secret,
        signOptions: { expiresIn: ttlSeconds },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
  ],
  exports: [AuthService],
})
export class AuthModule {}
