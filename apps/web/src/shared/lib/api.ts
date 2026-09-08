/**
 * The one place that knows where the API is.
 *
 * Server-side only: the browser never calls the API directly yet, so the URL
 * is not a `NEXT_PUBLIC_` variable and nothing about it ships to the client.
 */
const API_URL = process.env.API_URL ?? "http://localhost:3001";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    // Read per request rather than baked in at build time. A page that ships a
    // copy of what the API said on deploy day is a page that goes quietly
    // stale, and it would tie `next build` to a running API.
    cache: "no-store",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`GET ${path} answered ${response.status}.`);
  }

  return (await response.json()) as T;
}
