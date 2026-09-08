import { ConfigService } from '@nestjs/config';

export interface StorageConfig {
  bucket: string;
  projectId?: string;
  /** Path to a service-account key. Omitted, the library uses ADC. */
  keyFile?: string;
  /** Overridden only to point at an emulator. */
  apiEndpoint?: string;
  uploadUrlTtlSeconds: number;
  maxUploadBytes: number;
}

export const STORAGE_CONFIG = Symbol('STORAGE_CONFIG');

const DEFAULT_TTL_SECONDS = 15 * 60;
/** The same ceiling the upload field enforces in the browser. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function readStorageConfig(config: ConfigService): StorageConfig {
  const bucket = config.get<string>('GCS_BUCKET')?.trim();

  if (!bucket) {
    throw new Error(
      'GCS_BUCKET is not set. Identity documents have nowhere to go without it — see apps/api/.env.example.',
    );
  }

  return {
    bucket,
    projectId: config.get<string>('GCS_PROJECT_ID')?.trim() || undefined,
    keyFile: config.get<string>('GCS_KEY_FILE')?.trim() || undefined,
    apiEndpoint: config.get<string>('GCS_API_ENDPOINT')?.trim() || undefined,
    uploadUrlTtlSeconds: positive(
      config.get<string>('GCS_UPLOAD_URL_TTL_SECONDS'),
      DEFAULT_TTL_SECONDS,
    ),
    maxUploadBytes: MAX_UPLOAD_BYTES,
  };
}

function positive(raw: string | undefined, fallback: number): number {
  const value = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
