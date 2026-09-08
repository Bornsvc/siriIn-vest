/**
 * The browser's own line to the API — sign-up, sign-in and the KYC calls all
 * happen from client components, so unlike `apiGet` this one ships a public
 * URL and an optional bearer token.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface ApiErrorDetail {
  field: string;
  message: string;
}

/**
 * One shape for every failure the API admits to. `code` is what a caller
 * branches on; `message` is written to be shown to the customer verbatim.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor(
    status: number,
    code: string,
    message: string,
    details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** The message for one field, if the API named it. */
  fieldError(field: string): string | undefined {
    return this.details.find((detail) => detail.field === field)?.message;
  }
}

type Method = "GET" | "POST" | "PUT";

/**
 * `fetch` itself throwing means the network never delivered a response — the
 * API being unreachable, not the API answering "no". Callers see one type
 * either way, with a message a customer can actually read.
 */
function networkFailure(): ApiError {
  return new ApiError(
    0,
    "NETWORK_ERROR",
    "Couldn't reach SiriInvest. Check your connection and try again.",
  );
}

export async function apiRequest<T>(
  path: string,
  options: { method?: Method; body?: unknown; token?: string } = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw networkFailure();
  }

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof (payload as { error?: unknown }).error === "object"
        ? (payload as {
            error: { code?: unknown; message?: unknown; details?: unknown };
          }).error
        : null;

    throw new ApiError(
      response.status,
      typeof error?.code === "string" ? error.code : "INTERNAL_ERROR",
      typeof error?.message === "string"
        ? error.message
        : "Something went wrong on our side. Try again in a moment.",
      Array.isArray(error?.details) ? (error.details as ApiErrorDetail[]) : [],
    );
  }

  return payload as T;
}
