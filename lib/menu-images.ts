export type MenuImageValue = string | string[] | null;

const DEFAULT_MENU_IMAGE = "/images/gokwon-kfood-hero.png";

export function parseMenuImageUrls(value: unknown): string[] {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((entry): entry is string => typeof entry === "string")
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
    } catch {
      return [trimmed];
    }
  }

  return [trimmed];
}

export function normalizeMenuImageValue(
  value: unknown,
): MenuImageValue {
  const urls = parseMenuImageUrls(value);

  if (urls.length === 0) {
    return null;
  }

  if (urls.length === 1) {
    return urls[0];
  }

  return urls;
}

export function getPrimaryMenuImage(value: unknown): string | null {
  return parseMenuImageUrls(value)[0] ?? null;
}

export function resolveMenuImageUrls(
  value: unknown,
  fallback = DEFAULT_MENU_IMAGE,
): string[] {
  const urls = parseMenuImageUrls(value);
  return urls.length > 0 ? urls : [fallback];
}
