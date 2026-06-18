import type { AppLocale } from "@/i18n/routing";
import type { GokwonPageLanguage } from "@/lib/gokwon-page-translations";

export const GOKWON_PAGE_LANG_KEY = "gokwon-page-lang";
export const GOKWON_LANGUAGE_EVENT = "gokwon-language-change";
const LOCALE_COOKIE = "NEXT_LOCALE";

const VALID_LANGS = new Set<GokwonPageLanguage>(["en", "cn", "ja"]);

export function normalizeGokwonLanguage(value: string | null): GokwonPageLanguage {
  if (value === "cn" || value === "zh") {
    return "cn";
  }

  if (value && VALID_LANGS.has(value as GokwonPageLanguage)) {
    return value as GokwonPageLanguage;
  }

  return "en";
}

export function readGokwonLanguage(): GokwonPageLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(GOKWON_PAGE_LANG_KEY);
  if (stored) {
    return normalizeGokwonLanguage(stored);
  }

  const legacy = window.localStorage.getItem("gokwon-menu-lang");
  return normalizeGokwonLanguage(legacy);
}

export function gokwonLanguageToAppLocale(
  language: GokwonPageLanguage,
): AppLocale {
  if (language === "cn") {
    return "zh";
  }

  if (language === "en" || language === "ja") {
    return language;
  }

  return "en";
}

export function saveGokwonLanguage(language: GokwonPageLanguage): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GOKWON_PAGE_LANG_KEY, language);
  window.localStorage.setItem("gokwon-menu-lang", language);
  document.cookie = `${LOCALE_COOKIE}=${gokwonLanguageToAppLocale(language)};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(GOKWON_LANGUAGE_EVENT, { detail: language }));
}
