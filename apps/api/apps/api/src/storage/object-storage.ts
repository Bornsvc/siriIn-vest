/** What the store knows about an object once it is there. */
export interface StoredObject {
  key: string;
  contentType: string;
  byteSize: number;
  /** As the store reports it — base64 MD5 for Google Cloud Storage. */
  checksum: string;
}

/** Everything the browser needs to put one file somewhere we chose. */
export interface UploadTicket {
  /** Minted here. The client uploads to it and quotes it back; it never picks one. */
  storageKey: string;
  uploadUrl: string;
  method: 'PUT';
  /** Must be sent verbatim, or the signature will not match. */
  headers: Record<string, string>;
  expiresAt: string;
  maxBytes: number;
}

export interface UploadRequest {
  key: string;
  contentType: string;
}

/**
 * The bucket, behind an interface.
 *
 * Nothing above this line knows the files are in Google Cloud Storage, which
 * is what lets the identity flow be tested without a service account and what
 * would make a move to another bucket a provider swap.
 */
export abstract class ObjectStorage {
  abstract createUploadTicket(input: UploadRequest): Promise<UploadTicket>;
  /** Null when the object is not there. */
  abstract stat(key: string): Promise<StoredObject | null>;
  abstract delete(key: string): Promise<void>;
}
