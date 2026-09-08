import {
  ObjectStorage,
  StoredObject,
  UploadRequest,
  UploadTicket,
} from './../src/storage/object-storage';

/**
 * The bucket, in memory.
 *
 * The suites that use this are testing what the API does with what the bucket
 * reports — that it reads the metadata back rather than believing the request,
 * that a key belonging to someone else is refused. None of that needs Google,
 * and needing a service account to run the tests would mean nobody runs them.
 */
export class FakeObjectStorage extends ObjectStorage {
  private readonly objects = new Map<string, StoredObject>();

  createUploadTicket({
    key,
    contentType,
  }: UploadRequest): Promise<UploadTicket> {
    return Promise.resolve({
      storageKey: key,
      uploadUrl: `https://storage.test/${key}?x-goog-signature=fake`,
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      maxBytes: 10 * 1024 * 1024,
    });
  }

  stat(key: string): Promise<StoredObject | null> {
    return Promise.resolve(this.objects.get(key) ?? null);
  }

  delete(key: string): Promise<void> {
    this.objects.delete(key);
    return Promise.resolve();
  }

  /** Stands in for the browser's PUT to the signed URL. */
  put(key: string, object: Partial<StoredObject> = {}): void {
    this.objects.set(key, {
      key,
      contentType: 'image/jpeg',
      byteSize: 248_000,
      checksum: 'rL0Y20zC+Fzt72VPzMSk2A==',
      ...object,
    });
  }

  clear(): void {
    this.objects.clear();
  }
}
