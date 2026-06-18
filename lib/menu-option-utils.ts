export function normalizeOptionId(value: string | null | undefined): string {
  return value?.trim().replace(/\s+/g, "_") ?? "";
}

export function optionIdsMatch(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const normalizedLeft = normalizeOptionId(left);
  return Boolean(normalizedLeft) && normalizedLeft === normalizeOptionId(right);
}

export function parseOptionPrice(value: unknown): number {
  if (typeof value === "string" && !value.trim()) {
    return 0;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function getMenuOptionPrice(option: unknown): number {
  if (!option || typeof option !== "object" || Array.isArray(option)) {
    return 0;
  }

  const values = option as Record<string, unknown>;
  return parseOptionPrice(
    values.price ?? values.extraPrice ?? values.extra_price,
  );
}

type OptionLike = {
  id: string;
  label: string;
  description?: string;
  price?: number;
};

type OptionGroupLike<TOption extends OptionLike = OptionLike> = {
  id: string;
  label: string;
  type: "radio" | "checkbox";
  required?: boolean;
  options: TOption[];
};

export function normalizeMenuOptionGroups<
  TOption extends OptionLike,
  TGroup extends OptionGroupLike<TOption>,
>(groups: TGroup[]): TGroup[] {
  return groups.map((group) => ({
    ...group,
    id: normalizeOptionId(group.id),
    options: group.options.map((option) => ({
      ...option,
      id: normalizeOptionId(option.id),
      price: parseOptionPrice(getMenuOptionPrice(option)),
    })),
  }));
}
