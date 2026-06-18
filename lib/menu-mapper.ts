import {
  GOKWON_BILINGUAL_MENU,
  type BilingualMenuRecord,
} from "@/lib/gokwon-bilingual-menu";
import type { Menu } from "@/lib/menu-data";
import { getPrimaryMenuImage } from "@/lib/menu-images";
import type { GokwonMenuItem, MenuOptionGroup } from "@/lib/gokwon-menu";
import {
  getMenuOptionPrice,
  normalizeOptionId,
} from "@/lib/menu-option-utils";

const MENU_CATEGORIES = new Set([
  "chicken",
  "pizza",
  "tteokbokki",
  "noodles",
  "chinese",
  "jokbal",
  "side",
  "dessert",
]);

const SLUG_TO_BILINGUAL_ID: Record<string, string> = {
  menu_chicken: "set_01",
  menu_tteokbokki: "set_02",
  menu_pizza: "set_04",
  menu_dessert: "dessert_01",
};

const BILINGUAL_BY_ID = new Map(
  GOKWON_BILINGUAL_MENU.map((item) => [item.id, item]),
);

function findBilingualRecord(slug: string): BilingualMenuRecord | undefined {
  const direct = BILINGUAL_BY_ID.get(slug);
  if (direct) {
    return direct;
  }

  const alias = SLUG_TO_BILINGUAL_ID[slug];
  return alias ? BILINGUAL_BY_ID.get(alias) : undefined;
}

function parseOptionGroups(value: unknown): MenuOptionGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((group): group is MenuOptionGroup => {
      return (
        typeof group === "object" &&
        group !== null &&
        typeof (group as MenuOptionGroup).id === "string" &&
        typeof (group as MenuOptionGroup).label === "string" &&
        ((group as MenuOptionGroup).type === "radio" ||
          (group as MenuOptionGroup).type === "checkbox") &&
        Array.isArray((group as MenuOptionGroup).options)
      );
    })
    .map((group) => ({
      id: normalizeOptionId(group.id),
      label: group.label,
      type: group.type,
      required: group.required,
      options: group.options.map((option) => ({
        id: normalizeOptionId(option.id),
        label: option.label,
        description: option.description,
        price: getMenuOptionPrice(option),
      })),
    }));
}

export function menuToGokwonItem(menu: Menu): GokwonMenuItem {
  const category = MENU_CATEGORIES.has(menu.category)
    ? (menu.category as GokwonMenuItem["category"])
    : "chicken";
  const bilingual = findBilingualRecord(menu.slug);
  const taglineEn = menu.tagline || menu.description;

  return {
    id: menu.slug,
    dbId: menu.id,
    category,
    emoji: menu.emoji || "🍽️",
    mealType:
      menu.meal_type === "Plus Dessert"
        ? "Plus Dessert"
        : menu.meal_type === "Side Menu"
          ? "Side Menu"
          : "Meal",
    name: menu.name,
    tagline: taglineEn,
    basePrice: menu.base_price,
    rating: bilingual ? Number.parseFloat(bilingual.rating) : 0,
    reviewCount: bilingual?.reviews ?? "",
    deliveryTime: bilingual?.time ?? "",
    imageUrl: getPrimaryMenuImage(menu.image_url) ?? undefined,
    imagePosition: menu.image_position || "center",
    optionGroups: parseOptionGroups(menu.option_groups),
    name_en: menu.name,
    name_cn: bilingual?.name_cn ?? menu.name,
    tagline_en: taglineEn,
    tagline_cn: bilingual?.tagline_cn ?? taglineEn,
    tags: bilingual?.tags,
  };
}

export function menusToGokwonItems(menus: Menu[]): GokwonMenuItem[] {
  return menus
    .filter((menu) => menu.is_active)
    .sort((left, right) => left.sort_order - right.sort_order)
    .map(menuToGokwonItem);
}
