import type { AppLocale } from "@/i18n/routing";
import type { MenuTranslation, MenuTranslations } from "@/lib/menu-data";

type LocalizedMenuFields = {
  name: string;
  description: string;
  tagline: string;
  translations: MenuTranslations;
};

export function getLocalizedMenuText(
  menu: Pick<LocalizedMenuFields, "name" | "description" | "tagline" | "translations">,
  locale: string,
  field: keyof MenuTranslation,
): string {
  const normalizedLocale = locale.split("-")[0] as AppLocale;
  const translated = menu.translations[normalizedLocale]?.[field]?.trim();

  if (translated) {
    return translated;
  }

  return menu[field]?.trim() ?? "";
}
