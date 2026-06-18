import { getRequestConfig } from "next-intl/server";

import { routing, type AppLocale } from "./routing";

type Messages = Record<string, unknown>;

function mergeWithEnglishFallback(
  english: Messages,
  localized: Messages,
): Messages {
  const keys = new Set([...Object.keys(english), ...Object.keys(localized)]);

  return Object.fromEntries(
    Array.from(keys).map((key) => {
      const englishValue = english[key];
      const localizedValue = localized[key];

      if (
        englishValue &&
        localizedValue &&
        typeof englishValue === "object" &&
        typeof localizedValue === "object" &&
        !Array.isArray(englishValue) &&
        !Array.isArray(localizedValue)
      ) {
        return [
          key,
          mergeWithEnglishFallback(
            englishValue as Messages,
            localizedValue as Messages,
          ),
        ];
      }

      return [key, localizedValue ?? englishValue];
    }),
  );
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale;
  }

  const englishMessages = (await import("../messages/en.json"))
    .default as Messages;
  const localizedMessages =
    locale === "en"
      ? englishMessages
      : ((await import(`../messages/${locale}.json`)).default as Messages);

  return {
    locale,
    messages:
      locale === "en"
        ? englishMessages
        : mergeWithEnglishFallback(englishMessages, localizedMessages),
  };
});
