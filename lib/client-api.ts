/**
 * Same-origin API helper. Menus and other routes live under `/api/*`
 * on the same host/port as the Next.js app (no separate backend port).
 */
export async function fetchJson<T>(
  path: string,
  init?: RequestInit & { signal?: AbortSignal },
): Promise<
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string }
> {
  try {
    const response = await fetch(path, {
      ...init,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: `Request failed (${response.status}) for ${path}`,
      };
    }

    const data = (await response.json()) as T;
    return { ok: true, status: response.status, data };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { ok: false, status: 0, error: "Request aborted." };
    }

    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : "Network request failed.",
    };
  }
}
