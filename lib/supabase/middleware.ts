import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_LOGIN_PATH,
  isProtectedAdminPath,
} from "@/lib/admin-routes";
import { isAdminEmail } from "@/lib/admin";
import { normalizeLocalePathname } from "@/lib/i18n-path";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

function redirectToAdminLogin(
  request: NextRequest,
  options?: { error?: string; next?: string },
) {
  const url = request.nextUrl.clone();
  url.pathname = ADMIN_LOGIN_PATH;
  url.search = "";

  if (options?.error) {
    url.searchParams.set("error", options.error);
  }

  if (options?.next) {
    url.searchParams.set("next", options.next);
  }

  return NextResponse.redirect(url);
}

export async function updateSession(
  request: NextRequest,
  initialResponse?: NextResponse,
) {
  const response = initialResponse ?? NextResponse.next({ request });
  const pathname = normalizeLocalePathname(request.nextUrl.pathname);
  const isAdminPage = isProtectedAdminPath(pathname);
  const isAdminApi = pathname.startsWith("/api/admin");
  const supabaseEnv = getPublicSupabaseEnv();

  if (!supabaseEnv) {
    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: "Supabase is not configured." },
        { status: 503 },
      );
    }

    if (isAdminPage) {
      return redirectToAdminLogin(request, { error: "auth" });
    }

    return response;
  }

  const supabase = createServerClient(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  const isMissingSession =
    !user &&
    (error?.name === "AuthSessionMissingError" ||
      error?.message.toLowerCase().includes("auth session missing"));

  if (error && !isMissingSession) {
    console.error("[middleware] supabase.auth.getUser failed:", error);

    if (isAdminApi) {
      return NextResponse.json(
        { success: false, error: "Authentication service is unavailable." },
        { status: 503 },
      );
    }

    if (isAdminPage) {
      return redirectToAdminLogin(request, {
        error: "auth",
        next: `${pathname}${request.nextUrl.search}`,
      });
    }

    return response;
  }

  if (isAdminPage) {
    const next = `${pathname}${request.nextUrl.search}`;

    if (!user) {
      return redirectToAdminLogin(request, { next });
    }

    if (!isAdminEmail(user.email)) {
      return redirectToAdminLogin(request, {
        error: "unauthorized",
        next,
      });
    }
  }

  if (isAdminApi && (!user || !isAdminEmail(user.email))) {
    return NextResponse.json(
      { success: false, error: "Administrator access is required." },
      { status: 403 },
    );
  }

  return response;
}
