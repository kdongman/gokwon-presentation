export type MenuCategory =
  | "all"
  | "chicken"
  | "pizza"
  | "tteokbokki"
  | "noodles"
  | "chinese"
  | "jokbal"
  | "side"
  | "dessert";

import {
  GOKWON_BILINGUAL_MENU,
  ITEM_CATEGORY_META,
  type BilingualMenuRecord,
} from "@/lib/gokwon-bilingual-menu";
import {
  optionIdsMatch,
  parseOptionPrice,
} from "@/lib/menu-option-utils";

export type MenuOption = {
  id: string;
  label: string;
  description?: string;
  price?: number;
};

export type MenuOptionGroup = {
  id: string;
  label: string;
  description?: string;
  type: "radio" | "checkbox";
  required?: boolean;
  options: MenuOption[];
};

export type GokwonMenuItem = {
  id: string;
  dbId?: string;
  category: Exclude<MenuCategory, "all">;
  emoji: string;
  mealType: "Meal" | "Side Menu" | "Plus Dessert";
  name: string;
  tagline: string;
  basePrice: number;
  rating: number;
  reviewCount: string;
  deliveryTime: string;
  imageUrl?: string;
  imagePosition: string;
  optionGroups: MenuOptionGroup[];
  name_en?: string;
  name_cn?: string;
  tagline_en?: string;
  tagline_cn?: string;
  tags?: string[];
};

export type OptionQuantitySelection = {
  id: string;
  quantity: number;
};

export type GokwonSelectionValue =
  | string
  | string[]
  | OptionQuantitySelection[];

export type GokwonOrderDraft = {
  itemId: string;
  dbMenuId?: string;
  itemName: string;
  quantity: number;
  basePrice: number;
  selections: Record<string, GokwonSelectionValue>;
  addOns: Array<{ id: string; label: string; price: number }>;
  addOnTotal: number;
  unitPrice: number;
  totalPrice: number;
  formattedSummary: string;
  deliveryAddress?: string;
  createdAt: string;
};

export const GOKWON_ORDER_DRAFT_KEY = "gokwon-order-draft";
export const GOKWON_CART_DRAFT_KEY = "gokwon-cart-draft";

export type GokwonCartDraft = {
  items: GokwonOrderDraft[];
  deliveryAddress?: string;
  contactEmail?: string;
  totalPrice: number;
  formattedSummary: string;
  createdAt: string;
};

function bilingualMenuToGokwonItem(item: BilingualMenuRecord): GokwonMenuItem {
  const meta = ITEM_CATEGORY_META[item.id] ?? {
    category: "chicken" as const,
    emoji: "🍽️",
    imagePosition: "center",
  };
  const isDessert = item.id.startsWith("dessert_");

  return {
    id: item.id,
    category: meta.category,
    emoji: meta.emoji,
    mealType: isDessert ? "Plus Dessert" : "Meal",
    name: item.name_en,
    tagline: item.tagline_en,
    basePrice: Number.parseFloat(item.price),
    rating: Number.parseFloat(item.rating),
    reviewCount: item.reviews,
    deliveryTime: item.time,
    imagePosition: meta.imagePosition,
    optionGroups: [],
    name_en: item.name_en,
    name_cn: item.name_cn,
    tagline_en: item.tagline_en,
    tagline_cn: item.tagline_cn,
    tags: item.tags,
  };
}

export const GOKWON_MENU_CATEGORIES: Array<{
  id: MenuCategory;
  label: string;
  emoji: string;
}> = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "chicken", label: "Chicken", emoji: "🍗" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "tteokbokki", label: "Tteokbokki", emoji: "🌶️" },
  { id: "chinese", label: "Chinese Food", emoji: "🥡" },
  { id: "jokbal", label: "BBQ", emoji: "🥩" },
  { id: "dessert", label: "Dessert", emoji: "🍦" },
];

export const GOKWON_MENU_ITEMS: GokwonMenuItem[] =
  GOKWON_BILINGUAL_MENU.map(bilingualMenuToGokwonItem);

let activeMenuItems: GokwonMenuItem[] = GOKWON_MENU_ITEMS;

export function getActiveMenuItems(): GokwonMenuItem[] {
  return activeMenuItems;
}

export function setActiveMenuItems(items: GokwonMenuItem[]): void {
  activeMenuItems = items.length > 0 ? items : GOKWON_MENU_ITEMS;
}

export function getGokwonMenuItem(id: string): GokwonMenuItem | undefined {
  return activeMenuItems.find((item) => item.id === id);
}

export function getGokwonMenuIndex(id: string): number {
  return activeMenuItems.findIndex((item) => item.id === id);
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function findOptionLabel(
  group: MenuOptionGroup,
  optionId: string,
): string | undefined {
  return group.options.find((option) =>
    optionIdsMatch(option.id, optionId),
  )?.label;
}

function isStringSelectionArray(value: GokwonSelectionValue): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isQuantitySelectionArray(
  value: GokwonSelectionValue,
): value is OptionQuantitySelection[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        "id" in entry &&
        "quantity" in entry,
    )
  );
}

export function buildOrderDraft(
  item: GokwonMenuItem,
  selections: Record<string, GokwonSelectionValue>,
  deliveryAddress = "",
  quantity = 1,
): GokwonOrderDraft | { error: string } {
  const safeQuantity = Math.min(99, Math.max(1, Math.floor(quantity)));
  for (const group of item.optionGroups) {
    if (!group.required || group.type !== "radio") {
      continue;
    }

    const value = selections[group.id];
    if (typeof value !== "string" || !value) {
      return { error: `Please select ${group.label.toLowerCase()}.` };
    }
  }

  const addOns: GokwonOrderDraft["addOns"] = [];
  let addOnTotal = 0;

  for (const group of item.optionGroups) {
    if (group.type !== "checkbox") {
      continue;
    }

    const selected = selections[group.id];
    const selectedIds =
      selected && isStringSelectionArray(selected) ? selected : [];

    for (const optionId of selectedIds) {
      const option = group.options.find((entry) =>
        optionIdsMatch(entry.id, optionId),
      );
      if (!option) {
        continue;
      }
      const price = parseOptionPrice(option.price);
      addOns.push({ id: option.id, label: option.label, price });
      addOnTotal += price;
    }
  }

  const lines = [
    `Item: ${item.name}`,
    `Quantity: ${safeQuantity}`,
    `Base price: ${formatUsd(item.basePrice)}`,
  ];

  for (const group of item.optionGroups) {
    const value = selections[group.id];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      continue;
    }

    if (group.type === "radio" && typeof value === "string") {
      const label = findOptionLabel(group, value);
      if (label) {
        lines.push(`${group.label}: ${label}`);
      }
      continue;
    }

    if (group.type === "checkbox" && isStringSelectionArray(value)) {
      const labels = value
        .map((optionId) => findOptionLabel(group, optionId))
        .filter(Boolean);
      if (labels.length > 0) {
        lines.push(`${group.label}: ${labels.join(", ")}`);
      }
      continue;
    }

    if (group.type === "radio" && isQuantitySelectionArray(value)) {
      const labels = value
        .filter((entry) => entry.quantity > 0)
        .map((entry) => {
          const label = findOptionLabel(group, entry.id);
          return label ? `${label} ×${entry.quantity}` : null;
        })
        .filter(Boolean);
      if (labels.length > 0) {
        lines.push(`${group.label}: ${labels.join(", ")}`);
      }
    }
  }

  if (addOns.length > 0) {
    lines.push(
      `Add-on total: ${formatUsd(addOnTotal)}`,
    );
  }

  const optionTotal = item.optionGroups.reduce((sum, group) => {
    const selected = selections[group.id];

    if (group.type === "radio" && isQuantitySelectionArray(selected)) {
      return (
        sum +
        selected.reduce((groupSum, entry) => {
          const option = group.options.find((candidate) =>
            optionIdsMatch(candidate.id, entry.id),
          );
          return (
            groupSum +
            parseOptionPrice(option?.price) * Math.max(0, entry.quantity)
          );
        }, 0)
      );
    }

    if (group.type !== "radio") {
      return sum;
    }

    if (typeof selected !== "string") {
      return sum;
    }

    const option = group.options.find((entry) =>
      optionIdsMatch(entry.id, selected),
    );
    return sum + parseOptionPrice(option?.price);
  }, 0);
  const unitPrice = item.basePrice + optionTotal + addOnTotal;
  const totalPrice = unitPrice * safeQuantity;
  lines.push(`Unit total: ${formatUsd(unitPrice)}`);
  lines.push(`Line total: ${formatUsd(totalPrice)}`);

  if (deliveryAddress.trim()) {
    lines.push(`Delivery address: ${deliveryAddress.trim()}`);
  }

  return {
    itemId: item.id,
    dbMenuId: item.dbId,
    itemName: item.name,
    quantity: safeQuantity,
    basePrice: item.basePrice,
    selections,
    addOns,
    addOnTotal,
    unitPrice,
    totalPrice,
    formattedSummary: lines.join("\n"),
    deliveryAddress: deliveryAddress.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
}

export function saveOrderDraft(draft: GokwonOrderDraft): void {
  sessionStorage.setItem(GOKWON_ORDER_DRAFT_KEY, JSON.stringify(draft));
  sessionStorage.removeItem(GOKWON_CART_DRAFT_KEY);
}

export function saveCartDraft(draft: GokwonCartDraft): void {
  sessionStorage.setItem(GOKWON_CART_DRAFT_KEY, JSON.stringify(draft));
  sessionStorage.removeItem(GOKWON_ORDER_DRAFT_KEY);
}

export function readOrderDraft(): GokwonOrderDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(GOKWON_ORDER_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as GokwonOrderDraft;
  } catch {
    return null;
  }
}

export function readCartDraft(): GokwonCartDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(GOKWON_CART_DRAFT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as GokwonCartDraft;
  } catch {
    return null;
  }
}

export function estimateItemTotal(
  item: GokwonMenuItem,
  selections: Record<string, GokwonSelectionValue>,
  quantity = 1,
): number {
  const safeQuantity = Math.min(99, Math.max(1, Math.floor(quantity)));
  let unitTotal = item.basePrice;

  for (const group of item.optionGroups) {
    const selected = selections[group.id];

    if (group.type === "radio" && typeof selected === "string") {
      const option = group.options.find((entry) =>
        optionIdsMatch(entry.id, selected),
      );
      unitTotal += parseOptionPrice(option?.price);
      continue;
    }

    if (group.type === "radio" && isQuantitySelectionArray(selected)) {
      for (const entry of selected) {
        const option = group.options.find((candidate) =>
          optionIdsMatch(candidate.id, entry.id),
        );
        unitTotal +=
          parseOptionPrice(option?.price) * Math.max(0, entry.quantity);
      }
      continue;
    }

    if (group.type === "checkbox" && isStringSelectionArray(selected)) {
      for (const optionId of selected) {
        const option = group.options.find((entry) =>
          optionIdsMatch(entry.id, optionId),
        );
        unitTotal += parseOptionPrice(option?.price);
      }
    }
  }

  return unitTotal * safeQuantity;
}

export function buildCartDraft(
  cartItemIds: string[],
  selectionsByItem: Record<string, Record<string, GokwonSelectionValue>>,
  quantitiesByItem: Record<string, number>,
  deliveryAddress = "",
): GokwonCartDraft | { error: string } {
  if (cartItemIds.length === 0) {
    return { error: "Please add at least one item to your order." };
  }

  const items: GokwonOrderDraft[] = [];

  for (const itemId of cartItemIds) {
    const item = getGokwonMenuItem(itemId);
    if (!item) {
      return { error: "One of the selected items is no longer available." };
    }

    const draft = buildOrderDraft(
      item,
      selectionsByItem[itemId] ?? {},
      deliveryAddress,
      quantitiesByItem[itemId] ?? 1,
    );

    if ("error" in draft) {
      return { error: `${item.name}: ${draft.error}` };
    }

    items.push(draft);
  }

  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemBlocks = items.map(
    (item, index) => `--- Item ${index + 1} ---\n${item.formattedSummary}`,
  );

  return {
    items,
    deliveryAddress: deliveryAddress.trim() || undefined,
    totalPrice,
    formattedSummary: [
      `GoKwon combined order (${totalUnits} items)`,
      ...itemBlocks,
      `Grand total: ${formatUsd(totalPrice)}`,
    ].join("\n\n"),
    createdAt: new Date().toISOString(),
  };
}

export function getOrderItemOptionLabel(
  formattedSummary: string,
): string | undefined {
  const line = extractOptionLine(formattedSummary);
  return line?.replace(/^Option:\s*/, "") || undefined;
}

function extractOptionLine(formattedSummary: string): string | null {
  for (const line of formattedSummary.split("\n")) {
    if (line.startsWith("Option:")) {
      return line;
    }
  }
  return null;
}

function formatOrderItemSummary(item: GokwonOrderDraft): string {
  const totalPrice = item.unitPrice * item.quantity;
  const optionLine = extractOptionLine(item.formattedSummary);

  return [
    `Item: ${item.itemName}`,
    `Quantity: ${item.quantity}`,
    `Base price: ${formatUsd(item.unitPrice)}`,
    optionLine,
    `Line total: ${formatUsd(totalPrice)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function rebuildCartDraftFromItems(
  items: GokwonOrderDraft[],
  previous: Pick<GokwonCartDraft, "deliveryAddress" | "contactEmail">,
): GokwonCartDraft {
  const normalizedItems = items.map((item) => {
    const totalPrice = item.unitPrice * item.quantity;
    return {
      ...item,
      totalPrice,
      formattedSummary: formatOrderItemSummary(item),
    };
  });
  const totalPrice = normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalUnits = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemBlocks = normalizedItems.map(
    (item, index) => `--- Item ${index + 1} ---\n${item.formattedSummary}`,
  );

  return {
    items: normalizedItems,
    deliveryAddress: previous.deliveryAddress,
    contactEmail: previous.contactEmail,
    totalPrice,
    formattedSummary: [
      `GoKwon order (${totalUnits} items)`,
      ...itemBlocks,
      `Grand total: ${formatUsd(totalPrice)}`,
    ].join("\n\n"),
    createdAt: new Date().toISOString(),
  };
}

export function updateCartDraftItemQuantity(
  cart: GokwonCartDraft,
  itemIndex: number,
  quantity: number,
): GokwonCartDraft {
  const safeQuantity = Math.min(99, Math.max(1, Math.floor(quantity)));
  const items = cart.items.map((item, index) =>
    index === itemIndex ? { ...item, quantity: safeQuantity } : item,
  );
  return rebuildCartDraftFromItems(items, cart);
}

export function removeCartDraftItem(
  cart: GokwonCartDraft,
  itemIndex: number,
): GokwonCartDraft | null {
  if (itemIndex < 0 || itemIndex >= cart.items.length) {
    return cart;
  }

  const items = cart.items.filter((_, index) => index !== itemIndex);
  if (items.length === 0) {
    return null;
  }

  return rebuildCartDraftFromItems(items, cart);
}

export function updateOrderDraftQuantity(
  draft: GokwonOrderDraft,
  quantity: number,
): GokwonOrderDraft {
  const safeQuantity = Math.min(99, Math.max(1, Math.floor(quantity)));
  const updated = {
    ...draft,
    quantity: safeQuantity,
    totalPrice: draft.unitPrice * safeQuantity,
  };

  return {
    ...updated,
    formattedSummary: formatOrderItemSummary(updated),
  };
}

export function clearCartDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(GOKWON_CART_DRAFT_KEY);
}

export function clearOrderDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(GOKWON_ORDER_DRAFT_KEY);
}
