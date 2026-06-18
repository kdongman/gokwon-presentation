import {
  ADMIN_LOGIN_PATH,
  isSafeAdminNextPath,
} from "@/lib/admin-routes";

export const AUTH_REDIRECT_NEXT_COOKIE = "auth_redirect_next";
export const AUTH_ADMIN_FLOW_COOKIE = "auth_admin_flow";

/** Short-lived cookies so OAuth callbacks keep admin intent across redirects. */
export const AUTH_REDIRECT_NEXT_MAX_AGE = 60 * 10;

function buildAuthCookie(name: string, value: string) {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  return `${name}=${encodeURIComponent(value)}; path=/; max-age=${AUTH_REDIRECT_NEXT_MAX_AGE}; SameSite=Lax${secure}`;
}

export function setAdminOAuthCookies(nextPath: string) {
  document.cookie = buildAuthCookie(AUTH_REDIRECT_NEXT_COOKIE, nextPath);
  document.cookie = buildAuthCookie(AUTH_ADMIN_FLOW_COOKIE, "1");
}

export function clearAuthRedirectCookie(response: {
  cookies: {
    set: (
      name: string,
      value: string,
      options: { path: string; maxAge: number },
    ) => void;
  };
}) {
  for (const name of [AUTH_REDIRECT_NEXT_COOKIE, AUTH_ADMIN_FLOW_COOKIE]) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
}

/** /auth/callback is admin-only today — never fall back to the public home page. */
export function resolveAuthCallbackNextPath(
  queryNext: string | null,
  cookieNext: string | undefined,
  isAdminOAuthFlow: boolean,
): string {
  const fallback = isAdminOAuthFlow ? "/admin" : ADMIN_LOGIN_PATH;
  const candidate = cookieNext ?? queryNext ?? fallback;

  if (isSafeAdminNextPath(candidate)) {
    return candidate;
  }

  return fallback;
}
