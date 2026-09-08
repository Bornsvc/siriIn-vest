import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AUTH_CONFIG, AuthConfig, readAuthConfig } from './auth.config';

/**
 * The environment is read once, here. A module is a singleton, so importing
 * this twice does not re-read the config or repeat its warnings.
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AUTH_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService): AuthConfig => readAuthConfig(config),
    },
  ],
  exports: [AUTH_CONFIG],
})
export class AuthConfigModule {}
