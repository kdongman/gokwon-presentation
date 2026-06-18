import type { MenuTranslation, MenuTranslations } from "@/lib/menu-data";

const GOOGLE_TRANSLATE_URL =
  "https://translation.googleapis.com/language/translate/v2";
const TARGET_LOCALES = { en: "en", zh: "zh-CN", ja: "ja" } as const;

type SourceMenuText = {
  name: string;
  tagline: string;
  description: string;
};

type GoogleTranslationResponse = {
  data?: { translations?: Array<{ translatedText?: string }> };
  error?: { message?: string };
};

export class MenuTranslationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MenuTranslationError";
  }
}

function getTranslationApiKey(): string {
  const apiKey =
    process.env.GOOGLE_TRANSLATE_API_KEY?.trim() ||
    process.env.GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    throw new MenuTranslationError(
      "자동 번역 API가 설정되지 않았습니다. 서버 환경변수에 GOOGLE_TRANSLATE_API_KEY를 추가해 주세요.",
    );
  }

  return apiKey;
}

function containsKorean(value: string): boolean {
  return /[\uac00-\ud7a3]/.test(value);
}

function cleanTranslatedText(value: string): string {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();
}

async function translateFields(
  source: SourceMenuText,
  target: (typeof TARGET_LOCALES)[keyof typeof TARGET_LOCALES],
): Promise<MenuTranslation> {
  const fields = [
    ["name", source.name],
    ["tagline", source.tagline],
    ["description", source.description],
  ] as const;
  const populatedFields = fields.filter(([, value]) => value.trim());

  if (populatedFields.length === 0) {
    return {};
  }

  const response = await fetch(
    `${GOOGLE_TRANSLATE_URL}?key=${encodeURIComponent(getTranslationApiKey())}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: populatedFields.map(([, value]) => value),
        source: "ko",
        target,
        format: "text",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    },
  );
  const result = (await response.json()) as GoogleTranslationResponse;

  if (!response.ok) {
    const hint =
      response.status === 403
        ? " Google Cloud 프로젝트에서 Cloud Translation API를 활성화하고 서버 키의 사용을 허용해 주세요."
        : "";
    throw new MenuTranslationError(
      `${result.error?.message ?? "Google Cloud 자동 번역에 실패했습니다."}${hint}`,
    );
  }

  const translatedValues = result.data?.translations ?? [];
  if (translatedValues.length !== populatedFields.length) {
    throw new MenuTranslationError(
      "Google Cloud에서 일부 언어 번역이 누락되어 메뉴를 저장하지 않았습니다.",
    );
  }

  return Object.fromEntries(
    populatedFields.map(([field], index) => [
      field,
      cleanTranslatedText(translatedValues[index]?.translatedText ?? ""),
    ]),
  ) as MenuTranslation;
}

export function shouldAutoTranslateMenu(source: SourceMenuText): boolean {
  return [source.name, source.tagline, source.description].some(containsKorean);
}

export function isMenuTranslationSourceChanged(
  source: SourceMenuText,
  translations: MenuTranslations,
): boolean {
  const previousSource = translations.ko;

  return (
    previousSource?.name !== source.name ||
    previousSource?.tagline !== source.tagline ||
    previousSource?.description !== source.description
  );
}

export async function translateKoreanMenu(
  source: SourceMenuText,
): Promise<MenuTranslations> {
  if (!shouldAutoTranslateMenu(source)) {
    return {};
  }

  const entries = await Promise.all(
    Object.entries(TARGET_LOCALES).map(async ([locale, target]) => [
      locale,
      await translateFields(source, target),
    ]),
  );

  return {
    ...(Object.fromEntries(entries) as MenuTranslations),
    ko: {
      name: source.name,
      tagline: source.tagline,
      description: source.description,
    },
  };
}
