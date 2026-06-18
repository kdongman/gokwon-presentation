type ProductTitleFields = {
  title: string | null;
  title_ko?: string | null;
  title_en?: string | null;
  title_es?: string | null;
  title_ja?: string | null;
  title_ru?: string | null;
};

function cleanTitle(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getLocalizedProductTitle(
  product: ProductTitleFields,
  locale: string,
) {
  const normalizedLocale = locale.split("-")[0];
  const localized =
    normalizedLocale === "ko"
      ? product.title_ko
      : normalizedLocale === "en"
        ? product.title_en
        : normalizedLocale === "es"
          ? product.title_es
          : normalizedLocale === "ja"
            ? product.title_ja
            : normalizedLocale === "ru"
              ? product.title_ru
              : null;

  return (
    cleanTitle(localized) ??
    cleanTitle(product.title) ??
    cleanTitle(product.title_ko) ??
    cleanTitle(product.title_en) ??
    cleanTitle(product.title_es) ??
    cleanTitle(product.title_ja) ??
    cleanTitle(product.title_ru) ??
    "Product"
  );
}
