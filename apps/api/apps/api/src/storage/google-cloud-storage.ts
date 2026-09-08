import { Inject, Injectable, Logger } from '@nestjs/common';
import { Storage, type Bucket } from '@google-cloud/storage';
import {
  ObjectStorage,
  StoredObject,
  UploadRequest,
  UploadTicket,
} from './object-storage';
import { STORAGE_CONFIG, StorageConfig } from './storage.config';

/**
 * Google Cloud Storage, reached with a V4 signed URL so the bytes go straight
 * from the browser to the bucket. They never pass through this process, which
 * keeps ten-megabyte photographs out of the API's memory and off its logs.
 *
 * A signed PUT cannot cap the size of what is uploaded — that is checked when
 * the submission quotes the key back, against what the bucket says it holds.
 */
@Injectable()
export class GoogleCloudStorage extends ObjectStorage {
  private readonly logger = new Logger(GoogleCloudStorage.name);
  private readonly bucket: Bucket;

  constructor(@Inject(STORAGE_CONFIG) private readonly config: StorageConfig) {
    super();

    const storage = new Storage({
      projectId: config.projectId,
      keyFilename: config.keyFile,
      apiEndpoint: config.apiEndpoint,
    });

    this.bucket = storage.bucket(config.bucket);
  }

  async createUploadTicket({
    key,
    contentType,
  }: UploadRequest): Promise<UploadTicket> {
    const expiresAt = new Date(
      Date.now() + this.config.uploadUrlTtlSeconds * 1000,
    );

    const [uploadUrl] = await this.bucket.file(key).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: expiresAt,
      contentType,
    });

    return {
      storageKey: key,
      uploadUrl,
      method: 'PUT',
      // Signed into the URL: send anything else and the bucket refuses it.
      headers: { 'Content-Type': contentType },
      expiresAt: expiresAt.toISOString(),
      maxBytes: this.config.maxUploadBytes,
    };
  }

  async stat(key: string): Promise<StoredObject | null> {
    const file = this.bucket.file(key);

    const [exists] = await file.exists();
    if (!exists) return null;

    const [metadata] = await file.getMetadata();

    return {
      key,
      contentType: metadata.contentType ?? '',
      byteSize: Number(metadata.size ?? 0),
      checksum: metadata.md5Hash ?? '',
    };
  }

  async delete(key: string): Promise<void> {
    // `ignoreNotFound` so a purge that runs twice is not an error the second time.
    await this.bucket.file(key).delete({ ignoreNotFound: true });
    this.logger.log(JSON.stringify({ message: 'Deleted object', key }));
  }
}
