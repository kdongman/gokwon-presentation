export type CustomAttachedSide = {
  id: string;
  name: string;
  price: number;
  emoji?: string;
};

export function parseCustomAttachedSides(value: unknown): CustomAttachedSide[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const sides: CustomAttachedSide[] = [];

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }

    const row = entry as CustomAttachedSide;
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const name = typeof row.name === "string" ? row.name.trim() : "";
    const price =
      typeof row.price === "number" && Number.isFinite(row.price)
        ? Math.max(0, row.price)
        : null;

    if (!id || !name || price === null) {
      continue;
    }

    sides.push({
      id,
      name,
      price,
      emoji: typeof row.emoji === "string" ? row.emoji.trim() : undefined,
    });
  }

  return sides;
}

export function createCustomSideId(): string {
  return `side_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function slugifySideName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50) || `side_${Date.now()}`;
}
