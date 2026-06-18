import { defineRouting } from "next-intl/routing";

export const locales = ["en", "zh", "ja"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "en",
  localePrefix: "never",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
};
