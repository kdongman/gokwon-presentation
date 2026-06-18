import type { MenuOptionGroup } from "@/lib/gokwon-menu";
import {
  normalizeOptionId,
  optionIdsMatch,
  parseOptionPrice,
} from "@/lib/menu-option-utils";

export type OptionGroupDbRow = {
  id: string;
  label: string;
  description?: string;
  type: "radio" | "checkbox";
  required: boolean;
  options: Array<{
    id: string;
    label: string;
    description?: string;
    price: number;
  }>;
};

export type OptionPriceMismatch = {
  groupId: string;
  optionId: string;
  expectedPrice: number;
  actualPrice: number | null;
  layer: string;
};

export type SupabaseErrorMeta = {
  table: string;
  column: string;
  code?: string;
  details?: string;
  hint?: string;
  layer?: string;
};

export class SupabaseMenuUpdateError extends Error {
  readonly meta: SupabaseErrorMeta;

  constructor(message: string, meta: SupabaseErrorMeta) {
    super(message);
    this.name = "SupabaseMenuUpdateError";
    this.meta = meta;
  }
}

export function optionPriceLayer(groupId: string, optionId: string): string {
  return `option_groups[${groupId}].options[${optionId}].price`;
}

/**
 * Build the canonical JSONB payload for a full column replace on `menus.option_groups`.
 * Does not read or merge with existing DB rows — stale IDs such as `rose spicy`
 * are removed when the admin form submits the cleaned set (`rose_spicy`, etc.).
 */
export function serializeOptionGroupsForDatabase(
  groups: MenuOptionGroup[],
): OptionGroupDbRow[] {
  return groups.map((group, groupIndex) => {
    const groupId = normalizeOptionId(group.id);

    if (!groupId || !group.label?.trim()) {
      throw new SupabaseMenuUpdateError(
        `Option group ${groupIndex + 1} is missing id or label.`,
        {
          table: "menus",
          column: "option_groups",
          layer: `option_groups[${groupIndex}]`,
        },
      );
    }

    return {
      id: groupId,
      label: group.label.trim(),
      ...(group.description?.trim()
        ? { description: group.description.trim() }
        : {}),
      type: group.type === "checkbox" ? "checkbox" : "radio",
      required: Boolean(group.required),
      options: group.options.map((option, optionIndex) => {
        const optionId = normalizeOptionId(option.id);

        if (!optionId || !option.label?.trim()) {
          throw new SupabaseMenuUpdateError(
            `Option ${optionIndex + 1} in group "${groupId}" is missing id or label.`,
            {
              table: "menus",
              column: "option_groups",
              layer: optionPriceLayer(groupId, optionId || `option_${optionIndex}`),
            },
          );
        }

        return {
          id: optionId,
          label: option.label.trim(),
          ...(option.description?.trim()
            ? { description: option.description.trim() }
            : {}),
          price: parseOptionPrice(option.price),
        };
      }),
    };
  });
}

export function patchOptionPriceInDatabaseGroups(
  groups: OptionGroupDbRow[],
  groupId: string,
  optionId: string,
  price: number,
): OptionGroupDbRow[] {
  const normalizedGroupId = normalizeOptionId(groupId);
  const normalizedOptionId = normalizeOptionId(optionId);
  let matched = false;

  const next = groups.map((group) => {
    if (!optionIdsMatch(group.id, normalizedGroupId)) {
      return group;
    }

    return {
      ...group,
      options: group.options.map((option) => {
        if (!optionIdsMatch(option.id, normalizedOptionId)) {
          return option;
        }

        matched = true;
        return {
          ...option,
          price: parseOptionPrice(price),
        };
      }),
    };
  });

  if (!matched) {
    throw new SupabaseMenuUpdateError(
      `Could not find option "${normalizedOptionId}" in group "${normalizedGroupId}".`,
      {
        table: "menus",
        column: "option_groups",
        layer: optionPriceLayer(normalizedGroupId, normalizedOptionId),
      },
    );
  }

  return next;
}

export function flattenOptionPrices(groups: OptionGroupDbRow[]) {
  return groups.flatMap((group) =>
    group.options.map((option) => ({
      groupId: group.id,
      optionId: option.id,
      price: option.price,
      layer: optionPriceLayer(group.id, option.id),
    })),
  );
}

export function diffOptionGroupPrices(
  requested: OptionGroupDbRow[],
  saved: OptionGroupDbRow[],
): OptionPriceMismatch[] {
  const requestedFlat = flattenOptionPrices(requested);
  const savedByKey = new Map(
    flattenOptionPrices(saved).map((entry) => [
      `${entry.groupId}::${entry.optionId}`,
      entry,
    ]),
  );

  const mismatches: OptionPriceMismatch[] = [];

  for (const entry of requestedFlat) {
    const savedEntry = savedByKey.get(`${entry.groupId}::${entry.optionId}`);

    if (!savedEntry) {
      mismatches.push({
        groupId: entry.groupId,
        optionId: entry.optionId,
        expectedPrice: entry.price,
        actualPrice: null,
        layer: entry.layer,
      });
      continue;
    }

    if (savedEntry.price !== entry.price) {
      mismatches.push({
        groupId: entry.groupId,
        optionId: entry.optionId,
        expectedPrice: entry.price,
        actualPrice: savedEntry.price,
        layer: entry.layer,
      });
    }
  }

  return mismatches;
}

export function formatSupabasePostgrestError(
  error: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  },
  meta: Omit<SupabaseErrorMeta, "code" | "details" | "hint">,
): SupabaseMenuUpdateError {
  const message =
    error.message ?? "Supabase rejected the menus.option_groups update.";

  return new SupabaseMenuUpdateError(message, {
    ...meta,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export function formatOptionGroupsMismatchAlert(
  mismatches: OptionPriceMismatch[],
): string {
  const first = mismatches[0];

  if (!first) {
    return "Saved option data did not match the request.";
  }

  const priceText =
    first.actualPrice === null
      ? "missing"
      : `$${first.actualPrice.toFixed(2)}`;

  return [
    "option_groups price verification failed.",
    `Layer: ${first.layer}`,
    `Expected: $${first.expectedPrice.toFixed(2)}`,
    `Saved: ${priceText}`,
    mismatches.length > 1
      ? `(+${mismatches.length - 1} more mismatched option price${mismatches.length > 2 ? "s" : ""})`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
