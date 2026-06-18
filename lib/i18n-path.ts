import { routing } from "@/i18n/routing";

/** Strip optional locale prefix (/en/...) for route guards. */
export function normalizeLocalePathname(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) {
      return "/";
    }

    if (pathname.startsWith(`/${locale}/`)) {
      const stripped = pathname.slice(locale.length + 1);
      return stripped.startsWith("/") ? stripped : `/${stripped}`;
    }
  }

  return pathname;
}
