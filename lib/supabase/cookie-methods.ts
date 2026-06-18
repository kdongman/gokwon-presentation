import {
  parseCookieHeader,
  serializeCookieHeader,
  type CookieOptions,
} from "@supabase/ssr";

export type SupabaseCookie = {
  name: string;
  value: string;
};

export type SupabaseCookieMethods = {
  getAll: () => SupabaseCookie[];
  setAll: (
    cookies: Array<{
      name: string;
      value: string;
      options: CookieOptions;
    }>,
  ) => void;
};

function normalizeParsedCookies(
  cookies: Array<{ name: string; value?: string }>,
): SupabaseCookie[] {
  return cookies.flatMap((cookie) =>
    typeof cookie.value === "string"
      ? [{ name: cookie.name, value: cookie.value }]
      : [],
  );
}

export function createCookieMethodsFromHeader(
  cookieHeader: string | null | undefined,
  onSet?: (
    cookies: Array<{
      name: string;
      value: string;
      options: CookieOptions;
    }>,
  ) => void,
): SupabaseCookieMethods {
  return {
    getAll() {
      return normalizeParsedCookies(parseCookieHeader(cookieHeader ?? ""));
    },
    setAll(cookiesToSet) {
      onSet?.(cookiesToSet);
    },
  };
}

export function createCookieMethodsFromRequest(
  request: Request,
  onSet?: (
    cookies: Array<{
      name: string;
      value: string;
      options: CookieOptions;
    }>,
  ) => void,
): SupabaseCookieMethods {
  return createCookieMethodsFromHeader(request.headers.get("cookie"), onSet);
}

export function appendSerializedCookies(
  headers: Headers,
  cookiesToSet: Array<{
    name: string;
    value: string;
    options: CookieOptions;
  }>,
) {
  cookiesToSet.forEach(({ name, value, options }) => {
    headers.append(
      "Set-Cookie",
      serializeCookieHeader(name, value, options),
    );
  });
}

type PagesApiRequest = {
  cookies: Partial<Record<string, string>>;
  headers: {
    cookie?: string;
  };
};

type PagesApiResponse = {
  setHeader: (name: string, value: string | string[]) => void;
  getHeader?: (name: string) => string | string[] | undefined;
};

export function createCookieMethodsFromPagesApi(
  req: PagesApiRequest,
  res: PagesApiResponse,
): SupabaseCookieMethods {
  return {
    getAll() {
      const headerCookies = normalizeParsedCookies(
        parseCookieHeader(req.headers.cookie ?? ""),
      );
      if (headerCookies.length > 0) {
        return headerCookies;
      }

      return Object.entries(req.cookies).flatMap(([name, value]) =>
        typeof value === "string" ? [{ name, value }] : [],
      );
    },
    setAll(cookiesToSet) {
      const serialized = cookiesToSet.map(({ name, value, options }) =>
        serializeCookieHeader(name, value, options),
      );
      const existing = res.getHeader?.("Set-Cookie");
      const nextValues = [
        ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
        ...serialized,
      ];
      res.setHeader("Set-Cookie", nextValues);
    },
  };
}
