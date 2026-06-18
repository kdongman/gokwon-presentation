import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/admin";
import { isSafeAdminNextPath } from "@/lib/admin-routes";
import {
  AUTH_ADMIN_FLOW_COOKIE,
  AUTH_REDIRECT_NEXT_COOKIE,
  clearAuthRedirectCookie,
  resolveAuthCallbackNextPath,
} from "@/lib/auth-redirect-cookie";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");
  const cookieNext = request.cookies.get(AUTH_REDIRECT_NEXT_COOKIE)?.value;
  const isAdminOAuthFlow =
    request.cookies.get(AUTH_ADMIN_FLOW_COOKIE)?.value === "1";
  const next = resolveAuthCallbackNextPath(
    searchParams.get("next"),
    cookieNext,
    isAdminOAuthFlow,
  );
  const supabaseEnv = getPublicSupabaseEnv();

  if (oauthError) {
    console.error("[auth/callback] OAuth provider error:", {
      oauthError,
      oauthErrorDescription,
    });
  }

  if (
    code &&
    supabaseEnv &&
    isAdminOAuthFlow &&
    isSafeAdminNextPath(next)
  ) {
    const response = NextResponse.redirect(new URL(next, origin));
    const supabase = createServerClient(
      supabaseEnv.url,
      supabaseEnv.anonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            console.log(
              "[auth/callback] Setting Supabase cookies:",
              cookiesToSet.map(({ name }) => name),
            );
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("[auth/callback] supabase.auth.getUser failed:", userError);
      }

      if (user && isAdminEmail(user.email)) {
        clearAuthRedirectCookie(response);
        return response;
      }

      const unauthorizedResponse = NextResponse.redirect(
        new URL(
          `/admin-login?error=unauthorized&next=${encodeURIComponent(next)}`,
          origin,
        ),
      );
      clearAuthRedirectCookie(unauthorizedResponse);
      return unauthorizedResponse;
    }

    console.error(
      "[auth/callback] exchangeCodeForSession failed:",
      exchangeError,
    );
  } else {
    console.error("[auth/callback] Invalid admin OAuth callback:", {
      hasCode: Boolean(code),
      hasSupabaseEnv: Boolean(supabaseEnv),
      isAdminOAuthFlow,
      next,
    });
  }

  const failureResponse = NextResponse.redirect(
    new URL("/admin-login?error=auth", origin),
  );
  clearAuthRedirectCookie(failureResponse);
  return failureResponse;
}
