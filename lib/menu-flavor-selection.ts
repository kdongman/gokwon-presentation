import type { MenuDataItem } from "@/lib/gokwon-menu-data";
import { pickOptionLabel } from "@/lib/gokwon-menu-data";
import type { MenuLanguage } from "@/lib/gokwon-menu-data";
import {
  normalizeOptionId,
  optionIdsMatch,
  parseOptionPrice,
} from "@/lib/menu-option-utils";

export const FLAVOR_OPTION_GROUP_ID = "flavor";

export type OptionQuantityMap = Record<string, number>;

export type OptionQuantitySelection = {
  id: string;
  quantity: number;
};

export type OptionGroupQuantityPayload = Record<
  string,
  OptionQuantitySelection[]
>;

export function usesMultiQuantityFlavorOptions(item: MenuDataItem): boolean {
  return item.options.length > 0;
}

export function sumOptionQuantities(map: OptionQuantityMap): number {
  return Object.values(map).reduce(
    (sum, qty) => sum + (Number.isFinite(qty) && qty > 0 ? qty : 0),
    0,
  );
}

export function createEmptyOptionQuantityMap(
  optionIds: string[],
): OptionQuantityMap {
  return Object.fromEntries(
    optionIds.map((id) => [normalizeOptionId(id), 0]),
  );
}

export function normalizeOptionQuantityMap(
  map: OptionQuantityMap | undefined,
  optionIds: string[],
): OptionQuantityMap {
  const normalizedIds = optionIds.map(normalizeOptionId).filter(Boolean);
  const base = createEmptyOptionQuantityMap(normalizedIds);

  if (!map) {
    return base;
  }

  for (const [rawId, rawQty] of Object.entries(map)) {
    const id = normalizeOptionId(rawId);
    if (!normalizedIds.some((entry) => optionIdsMatch(entry, id))) {
      continue;
    }

    const qty = Math.min(99, Math.max(0, Math.floor(Number(rawQty) || 0)));
    base[id] = qty;
  }

  return base;
}

export function optionQuantitiesFromLegacySingle(
  optionId: string,
  quantity: number,
): OptionQuantityMap {
  const id = normalizeOptionId(optionId);
  if (!id) {
    return {};
  }

  const safeQuantity = Math.min(99, Math.max(0, Math.floor(quantity)));
  return safeQuantity > 0 ? { [id]: safeQuantity } : {};
}

export function adjustOptionQuantitiesToTotal(
  current: OptionQuantityMap,
  optionIds: string[],
  targetTotal: number,
  maxTotal = 99,
): OptionQuantityMap {
  const normalizedIds = optionIds.map(normalizeOptionId).filter(Boolean);
  const next = normalizeOptionQuantityMap(current, normalizedIds);
  const safeTarget = Math.min(maxTotal, Math.max(0, Math.floor(targetTotal)));
  const currentTotal = sumOptionQuantities(next);

  if (safeTarget === currentTotal) {
    return next;
  }

  if (safeTarget > currentTotal) {
    const firstId = normalizedIds[0];
    if (!firstId) {
      return next;
    }

    next[firstId] = (next[firstId] ?? 0) + (safeTarget - currentTotal);
    return next;
  }

  let toRemove = currentTotal - safeTarget;

  for (const id of [...normalizedIds].reverse()) {
    if (toRemove <= 0) {
      break;
    }

    const currentQty = next[id] ?? 0;
    const remove = Math.min(currentQty, toRemove);
    next[id] = currentQty - remove;
    toRemove -= remove;
  }

  return next;
}

export function buildOptionGroupQuantityPayload(
  groupId: string,
  quantities: OptionQuantityMap,
): OptionGroupQuantityPayload {
  const entries = Object.entries(quantities)
    .filter(([, qty]) => qty > 0)
    .map(([id, quantity]) => ({
      id: normalizeOptionId(id),
      quantity,
    }));

  return entries.length > 0 ? { [groupId]: entries } : {};
}

export function getFlavorExtraTotal(
  item: MenuDataItem,
  optionQuantities: OptionQuantityMap,
): number {
  return item.options.reduce((sum, option) => {
    const qty = optionQuantities[normalizeOptionId(option.id)] ?? 0;
    if (qty <= 0) {
      return sum;
    }

    return sum + parseOptionPrice(option.price) * qty;
  }, 0);
}

export function estimateMultiFlavorLineTotal(
  item: MenuDataItem,
  optionQuantities: OptionQuantityMap,
  addonIds?: string[],
  drinkOptionId?: string,
  getAddonTotal?: (addonIds?: string[]) => number,
  getDrinkPrice?: (drinkOptionId?: string) => number,
): number {
  const chickenCount = sumOptionQuantities(optionQuantities);
  if (chickenCount <= 0) {
    return 0;
  }

  const baseTotal = item.price * chickenCount;
  const flavorExtra = getFlavorExtraTotal(item, optionQuantities);
  const addonTotal = getAddonTotal?.(addonIds) ?? 0;
  const drinkTotal = getDrinkPrice?.(drinkOptionId) ?? 0;

  return baseTotal + flavorExtra + addonTotal + drinkTotal;
}

export function formatFlavorSelectionSummary(
  item: MenuDataItem,
  optionQuantities: OptionQuantityMap,
  language: MenuLanguage,
): string {
  return item.options
    .map((option) => {
      const qty = optionQuantities[normalizeOptionId(option.id)] ?? 0;
      if (qty <= 0) {
        return null;
      }

      return `${pickOptionLabel(option, language)} ×${qty}`;
    })
    .filter(Boolean)
    .join(" · ");
}
