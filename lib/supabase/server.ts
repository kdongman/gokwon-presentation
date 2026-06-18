import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import {
  appendSerializedCookies,
  createCookieMethodsFromPagesApi,
  createCookieMethodsFromRequest,
  type SupabaseCookieMethods,
} from "@/lib/supabase/cookie-methods";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured.",
    );
  }

  return { url, anonKey };
}

export function createServerSupabaseClient(
  cookieMethods: SupabaseCookieMethods,
) {
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: cookieMethods,
  });
}

/** App Router Route Handler / Edge — read cookies from the Request. */
export function createClientFromRequest(
  request: Request,
  options?: {
    onSetCookies?: (
      cookies: Parameters<SupabaseCookieMethods["setAll"]>[0],
    ) => void;
  },
) {
  return createServerSupabaseClient(
    createCookieMethodsFromRequest(request, options?.onSetCookies),
  );
}

/**
 * App Router Route Handler — attach refreshed auth cookies to a Response.
 * Use for OAuth callbacks and any route that mutates the session.
 */
export function createClientFromRequestResponse(request: Request, response: Response) {
  return createServerSupabaseClient(
    createCookieMethodsFromRequest(request, (cookiesToSet) => {
      appendSerializedCookies(response.headers, cookiesToSet);
    }),
  );
}

/** Pages Router API routes (`pages/api/*`). */
export function createClientFromPagesApi(
  req: Parameters<typeof createCookieMethodsFromPagesApi>[0],
  res: Parameters<typeof createCookieMethodsFromPagesApi>[1],
) {
  return createServerSupabaseClient(
    createCookieMethodsFromPagesApi(req, res),
  );
}

/**
 * Public/read-only server queries that do not need the user session.
 * Avoids cookie handling entirely (menus, products, etc.).
 */
export function createPublicClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createSupabaseClient(url, anonKey);
}

/**
 * @deprecated Pass `request` (App Router) or `req`/`res` (Pages Router).
 * Falls back to a cookie-less public client for backwards compatibility.
 */
export function createClient() {
  return createPublicClient();
}
