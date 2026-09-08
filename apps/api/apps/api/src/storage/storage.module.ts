import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleCloudStorage } from './google-cloud-storage';
import { ObjectStorage } from './object-storage';
import {
  STORAGE_CONFIG,
  StorageConfig,
  readStorageConfig,
} from './storage.config';

/**
 * The one place that names a bucket implementation, the way `UsersModule` is
 * the one place that names a database one.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: STORAGE_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService): StorageConfig =>
        readStorageConfig(config),
    },
    { provide: ObjectStorage, useClass: GoogleCloudStorage },
  ],
  exports: [ObjectStorage, STORAGE_CONFIG],
})
export class StorageModule {}
