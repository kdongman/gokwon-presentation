import {
  DEFAULT_DRINK_OPTION_ID,
  formatMenuPrice,
  pickLocalizedField,
  pickOptionLabel,
  type MenuDataItem,
  type MenuLanguage,
} from "@/lib/gokwon-menu-data";
import type { AppLocale } from "@/i18n/routing";
import type { GokwonCartDraft, GokwonMenuItem } from "@/lib/gokwon-menu";
import {
  adjustOptionQuantitiesToTotal,
  buildOptionGroupQuantityPayload,
  estimateMultiFlavorLineTotal,
  formatFlavorSelectionSummary,
  normalizeOptionQuantityMap,
  type OptionGroupQuantityPayload,
  type OptionQuantityMap,
  sumOptionQuantities,
  usesMultiQuantityFlavorOptions,
} from "@/lib/menu-flavor-selection";
import {
  normalizeOptionId,
  optionIdsMatch,
  parseOptionPrice,
} from "@/lib/menu-option-utils";

export type { OptionQuantityMap, OptionQuantitySelection } from "@/lib/menu-flavor-selection";

export type OrderFormState = {
  deliveryAddress: string;
  contactEmail: string;
  activeCategory: string;
  cartItemIds: string[];
  selectedOptions: Record<string, string>;
  selectedOptionQuantities: Record<string, OptionQuantityMap>;
  selectedDrinkOptions: Record<string, string>;
  selectedAddons: Record<string, string[]>;
  quantities: Record<string, number>;
};

export type OrderLineItem = {
  id: string;
  dbMenuId?: string;
  name: string;
  tagline: string;
  price: number;
  quantity: number;
  selectedOption?: {
    id: string;
    label: string;
  };
  optionGroupSelections?: OptionGroupQuantityPayload;
};

export type GoKwonOrderPayload = {
  language: AppLocale;
  deliveryAddress: string;
  items: OrderLineItem[];
  totalPrice: number;
  formattedSummary: string;
  createdAt: string;
};

export function createInitialOrderForm(): OrderFormState {
  return {
    deliveryAddress: "",
    contactEmail: "",
    activeCategory: "all",
    cartItemIds: [],
    selectedOptions: {},
    selectedOptionQuantities: {},
    selectedDrinkOptions: {},
    selectedAddons: {},
    quantities: {},
  };
}

function getAddonTotal(item: MenuDataItem, addonIds: string[] | undefined): number {
  if (!addonIds?.length || !item.addonOptions?.length) {
    return 0;
  }

  return addonIds.reduce((sum, addonId) => {
    const addon = item.addonOptions?.find((entry) =>
      optionIdsMatch(entry.id, addonId),
    );
    return sum + parseOptionPrice(addon?.price);
  }, 0);
}

function getSelectedOptionPrice(
  item: MenuDataItem,
  optionId: string | undefined,
): number {
  if (!optionId) {
    return 0;
  }

  const option = item.options.find((entry) =>
    optionIdsMatch(entry.id, optionId),
  );
  return parseOptionPrice(option?.price);
}

function getSelectedDrinkPrice(
  item: MenuDataItem,
  drinkOptionId: string | undefined,
): number {
  if (!drinkOptionId || !item.drinkOptions?.length) {
    return 0;
  }

  const drink = item.drinkOptions.find((entry) =>
    optionIdsMatch(entry.id, drinkOptionId),
  );
  return parseOptionPrice(drink?.price);
}

export function estimateLineUnitPrice(
  item: MenuDataItem,
  optionId?: string,
  addonIds?: string[],
  drinkOptionId?: string,
  optionQuantities?: OptionQuantityMap,
): number {
  if (usesMultiQuantityFlavorOptions(item) && optionQuantities) {
    const count = sumOptionQuantities(optionQuantities);
    if (count <= 0) {
      return 0;
    }

    return estimateMultiFlavorLineTotal(
      item,
      optionQuantities,
      addonIds,
      drinkOptionId,
      (ids) => getAddonTotal(item, ids),
      (id) => getSelectedDrinkPrice(item, id),
    ) / count;
  }

  return (
    item.price +
    getSelectedOptionPrice(item, optionId) +
    getSelectedDrinkPrice(item, drinkOptionId) +
    getAddonTotal(item, addonIds)
  );
}

export function estimateLineTotal(
  item: MenuDataItem,
  quantity: number,
  optionId?: string,
  addonIds?: string[],
  drinkOptionId?: string,
  optionQuantities?: OptionQuantityMap,
): number {
  if (usesMultiQuantityFlavorOptions(item) && optionQuantities) {
    return estimateMultiFlavorLineTotal(
      item,
      optionQuantities,
      addonIds,
      drinkOptionId,
      (ids) => getAddonTotal(item, ids),
      (id) => getSelectedDrinkPrice(item, id),
    );
  }

  const safeQuantity = Math.min(99, Math.max(1, quantity));
  return (
    estimateLineUnitPrice(item, optionId, addonIds, drinkOptionId) * safeQuantity
  );
}

export function calculateOrderTotal(
  menuData: MenuDataItem[],
  orderForm: OrderFormState,
): number {
  return orderForm.cartItemIds.reduce((sum, itemId) => {
    const item = menuData.find((entry) => entry.id === itemId);
    if (!item) {
      return sum;
    }

    const optionQuantities = orderForm.selectedOptionQuantities[itemId];
    const isMulti = usesMultiQuantityFlavorOptions(item);

    return (
      sum +
      estimateLineTotal(
        item,
        orderForm.quantities[itemId] ?? 1,
        isMulti ? undefined : orderForm.selectedOptions[itemId],
        orderForm.selectedAddons[itemId],
        orderForm.selectedDrinkOptions[itemId],
        isMulti ? optionQuantities : undefined,
      )
    );
  }, 0);
}

export function buildOrderPayload(
  menuData: MenuDataItem[],
  orderForm: OrderFormState,
  language: MenuLanguage,
): GoKwonOrderPayload | { error: string } {
  if (orderForm.cartItemIds.length === 0) {
    return { error: "empty_cart" };
  }

  const items: OrderLineItem[] = [];

  for (const itemId of orderForm.cartItemIds) {
    const item = menuData.find((entry) => entry.id === itemId);
    if (!item) {
      continue;
    }

    const isMulti = usesMultiQuantityFlavorOptions(item);
    const optionQuantities = normalizeOptionQuantityMap(
      orderForm.selectedOptionQuantities[itemId],
      item.options.map((option) => option.id),
    );
    const optionId = normalizeOptionId(orderForm.selectedOptions[itemId]);
    const selectedOption = item.options.find((option) =>
      optionIdsMatch(option.id, optionId),
    );
    const drinkOptionId = normalizeOptionId(
      orderForm.selectedDrinkOptions[itemId] ?? DEFAULT_DRINK_OPTION_ID,
    );
    const selectedDrinkOption = item.drinkOptions?.find((option) =>
      optionIdsMatch(option.id, drinkOptionId),
    );
    const selectedAddonIds = orderForm.selectedAddons[itemId] ?? [];
    const selectedAddonLabels = selectedAddonIds
      .map((addonId) =>
        item.addonOptions?.find((addon) =>
          optionIdsMatch(addon.id, addonId),
        ),
      )
      .filter(Boolean)
      .map((addon) => pickOptionLabel(addon!, language));

    const flavorTotal = sumOptionQuantities(optionQuantities);

    if (isMulti) {
      if (flavorTotal <= 0) {
        return { error: "missing_option" };
      }
    } else if (item.options.length > 0 && !selectedOption) {
      return { error: "missing_option" };
    }

    const quantity = isMulti
      ? flavorTotal
      : (orderForm.quantities[itemId] ?? 1);

    const lineTotal = estimateLineTotal(
      item,
      quantity,
      isMulti ? undefined : optionId,
      selectedAddonIds,
      drinkOptionId,
      isMulti ? optionQuantities : undefined,
    );

    const lineUnitPrice = quantity > 0 ? lineTotal / quantity : lineTotal;

    const flavorSummary = isMulti
      ? formatFlavorSelectionSummary(item, optionQuantities, language)
      : selectedOption
        ? pickOptionLabel(selectedOption, language)
        : null;

    const optionLabels = [
      flavorSummary,
      selectedDrinkOption &&
      drinkOptionId !== DEFAULT_DRINK_OPTION_ID &&
      parseOptionPrice(selectedDrinkOption.price) > 0
        ? pickOptionLabel(selectedDrinkOption, language)
        : null,
      ...selectedAddonLabels,
    ].filter(Boolean);

    const groupId = item.optionsGroupId ?? "options";
    const optionGroupSelections = isMulti
      ? buildOptionGroupQuantityPayload(groupId, optionQuantities)
      : undefined;

    items.push({
      id: item.id,
      dbMenuId: item.dbId,
      name: pickLocalizedField(item, "name", language),
      tagline: pickLocalizedField(item, "tagline", language),
      price: lineUnitPrice,
      quantity,
      optionGroupSelections,
      selectedOption:
        optionLabels.length > 0
          ? {
              id: isMulti
                ? groupId
                : (selectedOption?.id ?? drinkOptionId ?? "addons"),
              label: optionLabels.join(" · "),
            }
          : undefined,
    });
  }

  const totalPrice = items.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );

  const itemBlocks = items.map((line, index) => {
    const optionLine = line.selectedOption
      ? `Option: ${line.selectedOption.label}`
      : null;

    return [
      `--- Item ${index + 1} ---`,
      `Item: ${line.name}`,
      `Quantity: ${line.quantity}`,
      `Base price: ${formatMenuPrice(line.price)}`,
      optionLine,
      `Line total: ${formatMenuPrice(line.price * line.quantity)}`,
    ]
      .filter(Boolean)
      .join("\n");
  });

  const summaryLines = [
    `GoKwon order (${items.reduce((sum, line) => sum + line.quantity, 0)} items)`,
    ...itemBlocks,
    orderForm.deliveryAddress.trim()
      ? `Delivery address: ${orderForm.deliveryAddress.trim()}`
      : null,
    `Grand total: ${formatMenuPrice(totalPrice)}`,
  ].filter(Boolean);

  return {
    language,
    deliveryAddress: orderForm.deliveryAddress.trim(),
    items,
    totalPrice,
    formattedSummary: summaryLines.join("\n\n"),
    createdAt: new Date().toISOString(),
  };
}

export function orderPayloadToCartDraft(
  payload: GoKwonOrderPayload,
  contactEmail?: string,
): GokwonCartDraft {
  const normalizedEmail = contactEmail?.trim().toLowerCase();

  return {
    items: payload.items.map((line) => ({
      itemId: line.id,
      dbMenuId: line.dbMenuId,
      itemName: line.name,
      quantity: line.quantity,
      basePrice: line.price,
      selections: (line.optionGroupSelections ??
        (line.selectedOption
          ? { option: line.selectedOption.id }
          : {})) as GokwonCartDraft["items"][number]["selections"],
      addOns: [],
      addOnTotal: 0,
      unitPrice: line.price,
      totalPrice: line.price * line.quantity,
      formattedSummary: [
        `Item: ${line.name}`,
        `Quantity: ${line.quantity}`,
        line.selectedOption ? `Option: ${line.selectedOption.label}` : null,
        `Line total: ${formatMenuPrice(line.price * line.quantity)}`,
      ]
        .filter(Boolean)
        .join("\n"),
      deliveryAddress: payload.deliveryAddress || undefined,
      createdAt: payload.createdAt,
    })),
    deliveryAddress: payload.deliveryAddress || undefined,
    contactEmail: normalizedEmail || undefined,
    totalPrice: payload.totalPrice,
    formattedSummary: payload.formattedSummary,
    createdAt: payload.createdAt,
  };
}

export function menuDataToGokwonItems(menuData: MenuDataItem[]): GokwonMenuItem[] {
  return menuData.map((item) => ({
    id: item.id,
    dbId: item.dbId,
    category: item.category,
    emoji: item.emoji ?? "🍽️",
    mealType:
      item.category === "dessert"
        ? "Plus Dessert"
        : item.category === "side"
          ? "Side Menu"
          : "Meal",
    name: item.name_en,
    tagline: item.tagline_en,
    basePrice: item.price,
    rating: Number.parseFloat(item.rating) || 0,
    reviewCount: item.reviews,
    deliveryTime: item.time,
    imageUrl: item.imageUrl,
    imagePosition: item.imagePosition ?? "center",
    optionGroups: [],
    name_en: item.name_en,
    name_cn: item.name_cn,
    tagline_en: item.tagline_en,
    tagline_cn: item.tagline_cn,
  }));
}

export {
  adjustOptionQuantitiesToTotal,
  normalizeOptionQuantityMap,
  sumOptionQuantities,
  usesMultiQuantityFlavorOptions,
};
