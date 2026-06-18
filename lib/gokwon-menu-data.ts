import type { Menu } from "@/lib/menu-data";

import type { AppLocale } from "@/i18n/routing";
import type { MenuTranslations } from "@/lib/menu-data";
import {
  CHICKEN_FLAVOR_OPTION_GROUP,
  DRINK_OPTION_GROUP,
  DRINK_OPTION_GROUP_DESCRIPTION,
  isDrinkOptionGroup,
  shouldAttachDrinkOptions,
} from "@/lib/menu-option-presets";
import { removeMenuBeverageNote } from "@/lib/menu-beverage-note";
import { parseMenuImageUrls } from "@/lib/menu-images";
import {
  getMenuOptionPrice,
  normalizeOptionId,
  parseOptionPrice,
} from "@/lib/menu-option-utils";
import japaneseMenuMessages from "@/messages/menu/ja.json";

export type MenuLanguage = AppLocale;

export type MenuCategory =
  | "all"
  | "chicken"
  | "tteokbokki"
  | "pizza"
  | "noodles"
  | "chinese"
  | "jokbal"
  | "side"
  | "dessert";

export type MenuDataOption = {
  id: string;
  label_en: string;
  label_cn: string;
  side_name?: string;
  side_name_en?: string;
  side_name_zh?: string;
  side_name_ja?: string;
  price?: number;
};

export type MenuOptionSelectionMode = "single" | "multi_quantity";

const OPTION_TEXT_TRANSLATIONS: Record<
  string,
  Record<string, string>
> = {
  ko: {
    "Select Option": "옵션 선택",
    Standard: "기본",
    "Flavor (Select 1)": "맛 선택",
    "Type & Spicy Level (Select 1)": "종류 및 맵기 선택",
    "Customize Your Combo (Select 1)": "세트 구성 선택",
    "Flavor (Select 1) — Bingsu": "빙수 맛 선택",
    "Side Add-ons": "사이드 추가",
    "Extra Add-ons": "추가 옵션",
    "Drink Add-ons": "음료 추가",
    Fried: "후라이드",
    "Sweet & Spicy Seasoned": "양념",
    "Half & Half": "반반",
    "Golden Cheese Powder / Bburinkle": "뿌링클",
    "Add Crunchy Cheese Balls": "치즈볼 추가",
    "Original Style - Mild": "오리지널 순한맛",
    "Original Style - Medium": "오리지널 중간맛",
    "Original Style - Spicy": "오리지널 매운맛",
    "Rose Cream Style - Mild": "로제 순한맛",
    "Rose Cream Style - Spicy": "로제 매운맛",
    "Real Bulgogi": "불고기",
    "Sweet Potato Mousse": "고구마",
    Combination: "콤비네이션",
    "Classic Pepperoni": "페퍼로니",
    "Add French Fries": "감자튀김 추가",
    "Add Oven-Baked Spaghetti": "오븐 스파게티 추가",
    "Standard: Jajangmyeon (1) + Mini Tangsuyuk (1)":
      "기본: 짜장면 1 + 탕수육 미니 1",
    "Swap Noodles to Spicy Seafood Soup / Jampong":
      "짬뽕으로 면 변경",
    "Add 1 More Jajangmyeon": "짜장면 1개 추가",
    "Add Crispy Fried Mandu / Dumplings": "바삭 군만두 추가",
    "Classic Injeolmi (Sweet Red Bean & Roasted Grain Powder)":
      "클래식 인절미 (팥 & 콩가루)",
    "Sweet Mango & Cheese Cube": "망고 & 치즈 큐브",
    "Add Iced Americano / Premium Korean Coffee":
      "아이스 아메리카노 / 프리미엄 커피 추가",
    "Need a Drink?": "음료가 필요하신가요?",
    "Basic drinks are NOT guaranteed with your meal (restaurant policy varies daily). If you add a large drink, you may receive Pepsi, Coca-Cola, Sprite, or another cola/lemon-lime soda depending on stock — not a specific brand.":
      "기본 음료는 식사에 포함되지 않을 수 있습니다(매장 일일 정책에 따라 달라짐). 대형 음료를 추가하시면 재고에 따라 펩시, 코카콜라, 스프라이트 등 다른 콜라·사이다가 제공될 수 있으며 특정 브랜드는 보장되지 않습니다.",
    "No Extra Drink": "추가 음료 없음",
    "Add Large Cola (1.25L)": "대형 콜라 (1.25L) 추가",
    "Add Large Lemon-Lime Soda (1.25L)": "대형 레몬라임 사이다 (1.25L) 추가",
    "Add Large Coca-Cola (1.25L)": "대형 콜라 (1.25L) 추가",
    "Add Large Sprite (1.25L)": "대형 레몬라임 사이다 (1.25L) 추가",
  },
  zh: {
    "Select Option": "选择选项",
    Standard: "标准",
    "Flavor (Select 1)": "选择口味",
    "Style (Select 1)": "选择风格",
    "Spiciness Level (Select 1)": "选择辣度",
    "Topping (Select 1)": "选择配料",
    "Menu (Select 1)": "选择菜单",
    "Authentic Crispy Fried": "经典酥脆原味炸鸡",
    "Sweet & Spicy Glazed (Yangnyeom)": "甜辣酱味炸鸡",
    "The Viral 'Sweet Cheese' Seasoning": "热门甜芝士调味",
    "Half & Half (Fried + Glazed)": "双拼（原味 + 酱味）",
    "Silky & Rich Creamy Rose": "顺滑浓郁玫瑰酱",
    "Original Spicy-Sweet Chili": "经典甜辣辣椒酱",
    Mild: "微辣",
    Medium: "中辣",
    Hot: "辣",
    "Signature Sweet Potato Gold & Bacon": "招牌红薯金边培根",
    "Classic Double Pepperoni & Rich Cheese": "经典双倍意式香肠与浓郁芝士",
    "Premium Yogurt Ice Cream with Real Honeycomb & Strawberries":
      "高级酸奶冰淇淋配蜂巢蜜和草莓",
    "Flaky Toasted Croffle & Sweet Injeolmi Rice-Cake Toast Combo":
      "酥脆可颂华夫与甜糯米吐司组合",
  },
  es: {
    "Select Option": "Seleccionar opción",
    Standard: "Estándar",
    "Flavor (Select 1)": "Elige sabor",
    "Style (Select 1)": "Elige estilo",
    "Spiciness Level (Select 1)": "Elige nivel de picante",
    "Topping (Select 1)": "Elige topping",
    "Menu (Select 1)": "Elige menú",
    Mild: "Suave",
    Medium: "Medio",
    Hot: "Picante",
    "Premium Yogurt Ice Cream with Real Honeycomb & Strawberries":
      "Helado de yogur premium con panal real y fresas",
    "Flaky Toasted Croffle & Sweet Injeolmi Rice-Cake Toast Combo":
      "Combo de croffle tostado y tostada dulce de injeolmi",
  },
  ja: {
    "Select Option": "オプション選択",
    Standard: "標準",
    "Flavor (Select 1)": "味を選択",
    "Style (Select 1)": "スタイルを選択",
    "Spiciness Level (Select 1)": "辛さを選択",
    "Topping (Select 1)": "トッピングを選択",
    "Menu (Select 1)": "メニューを選択",
    Mild: "マイルド",
    Medium: "普通",
    Hot: "辛口",
    "Premium Yogurt Ice Cream with Real Honeycomb & Strawberries":
      "プレミアムヨーグルトアイス＋本物の蜂の巣といちご",
    "Flaky Toasted Croffle & Sweet Injeolmi Rice-Cake Toast Combo":
      "サクサククロッフル＆甘いインジョルミトーストセット",
  },
  ru: {
    "Select Option": "Выберите опцию",
    Standard: "Стандарт",
    "Flavor (Select 1)": "Выберите вкус",
    "Style (Select 1)": "Выберите стиль",
    "Spiciness Level (Select 1)": "Выберите остроту",
    "Topping (Select 1)": "Выберите топпинг",
    "Menu (Select 1)": "Выберите меню",
    Mild: "Слабо",
    Medium: "Средне",
    Hot: "Остро",
    "Premium Yogurt Ice Cream with Real Honeycomb & Strawberries":
      "Премиальное йогуртовое мороженое с сотами и клубникой",
    "Flaky Toasted Croffle & Sweet Injeolmi Rice-Cake Toast Combo":
      "Поджаренный кроффл и сладкий тост с инджольми",
  },
};

const JAPANESE_MENU_ITEMS = japaneseMenuMessages.items as Record<
  string,
  { name: string; tagline: string }
>;

OPTION_TEXT_TRANSLATIONS.ja = {
  "Select Option": japaneseMenuMessages.ui.selectOption,
  "Flavor (Select 1)": japaneseMenuMessages.ui.flavor,
  "Type & Spicy Level (Select 1)": japaneseMenuMessages.ui.typeAndSpice,
  "Customize Your Combo (Select 1)": japaneseMenuMessages.ui.customizeCombo,
  "Side Add-ons": japaneseMenuMessages.ui.sideAddons,
  "Extra Add-ons": japaneseMenuMessages.ui.extraAddons,
  "Drink Add-ons": japaneseMenuMessages.ui.drinkAddons,
  ...japaneseMenuMessages.options,
};

function translateOptionText(
  value: string,
  language: MenuLanguage | "ko",
): string {
  return OPTION_TEXT_TRANSLATIONS[language]?.[value] ?? value;
}

export type MenuDataItem = {
  id: string;
  dbId?: string;
  category: Exclude<MenuCategory, "all">;
  name_en: string;
  name_cn: string;
  tagline_en: string;
  tagline_cn: string;
  translations?: MenuTranslations;
  price: number;
  rating: string;
  reviews: string;
  time: string;
  isLocalPick: boolean;
  options_title_en: string;
  options_title_cn: string;
  options: MenuDataOption[];
  optionsGroupId?: string;
  optionsSelectionMode?: MenuOptionSelectionMode;
  addonOptionsTitle_en?: string;
  addonOptionsTitle_cn?: string;
  addonOptions?: MenuDataOption[];
  drinkOptionsTitle_en?: string;
  drinkOptionsDescription_en?: string;
  drinkOptions?: MenuDataOption[];
  imageUrl?: string;
  imageUrls?: string[];
  imagePosition?: string;
  emoji?: string;
};

export const INITIAL_MENU_DATA: MenuDataItem[] = [
  {
    id: "premium-k-fried-chicken",
    category: "chicken",
    name_en: "Premium K-Fried Chicken",
    name_cn: "韩式精品炸鸡",
    tagline_en: removeMenuBeverageNote(
      "Experience the authentic Korean crispy chicken.",
    ),
    tagline_cn: "体验正宗韩式酥脆炸鸡。",
    translations: {
      ko: {
        name: "프리미엄 K-치킨",
        tagline: "정통 한국식 바삭한 치킨을 경험해 보세요.",
      },
    },
    price: 24,
    rating: "4.9",
    reviews: "1.8k+",
    time: "25-40 min",
    isLocalPick: true,
    emoji: "🍗",
    imageUrl: "/images/chicken.jpg",
    imagePosition: "center",
    options_title_en: "Flavor (Select 1)",
    options_title_cn: "选择口味",
    options: [
      { id: "fried", label_en: "Fried", label_cn: "原味炸鸡" },
      {
        id: "sweet_spicy",
        label_en: "Sweet & Spicy Seasoned",
        label_cn: "甜辣酱汁",
      },
      { id: "half_half", label_en: "Half & Half", label_cn: "半半炸鸡" },
      {
        id: "bburinkle",
        label_en: "Golden Cheese Powder / Bburinkle",
        label_cn: "芝士粉 / 噗灵克",
      },
    ],
    addonOptionsTitle_en: "Side Add-ons",
    addonOptionsTitle_cn: "附加小食",
    addonOptions: [
      {
        id: "cheese_balls",
        label_en: "Add Crunchy Cheese Balls",
        label_cn: "加芝士球",
        price: 4.5,
      },
    ],
  },
  {
    id: "k-street-tteokbokki",
    category: "tteokbokki",
    name_en: "K-Street Tteokbokki (Chewy Rice Cakes)",
    name_cn: "韩式街头炒年糕",
    tagline_en: removeMenuBeverageNote(
      "The ultimate Korean soul food. Chewy rice cakes in delicious sauce.",
    ),
    tagline_cn: "韩国街头灵魂美食，Q弹年糕配上浓郁酱汁。",
    translations: {
      ko: {
        name: "K-스트리트 떡볶이",
        tagline: "궁극의 한국 소울푸드. 쫄깃한 떡이 맛있는 소스에 버무려집니다.",
      },
    },
    price: 18,
    rating: "4.8",
    reviews: "920",
    time: "20-35 min",
    isLocalPick: true,
    emoji: "🌶️",
    imageUrl: "/images/tteokbokki.jpg",
    imagePosition: "center",
    options_title_en: "Type & Spicy Level (Select 1)",
    options_title_cn: "选择种类与辣度",
    options: [
      {
        id: "original_mild",
        label_en: "Original Style - Mild",
        label_cn: "原味 - 微辣",
      },
      {
        id: "original_medium",
        label_en: "Original Style - Medium",
        label_cn: "原味 - 中辣",
      },
      {
        id: "original_spicy",
        label_en: "Original Style - Spicy",
        label_cn: "原味 - 辣",
      },
      {
        id: "rose_mild",
        label_en: "Rose Cream Style - Mild",
        label_cn: "玫瑰奶油 - 微辣",
      },
      {
        id: "rose_spicy",
        label_en: "Rose Cream Style - Spicy",
        label_cn: "玫瑰奶油 - 辣",
      },
    ],
  },
  {
    id: "premium-k-pizza",
    category: "pizza",
    name_en: "Premium K-Pizza",
    name_cn: "韩式精品披萨",
    tagline_en: removeMenuBeverageNote(
      "Unique and loaded Korean-style pizza that you've never tried before.",
    ),
    tagline_cn: "独特料足的韩式披萨，带来前所未有的味觉体验。",
    translations: {
      ko: {
        name: "프리미엄 K-피자",
        tagline: "지금껏 맛보지 못한 독특하고 푸짐한 한국식 피자.",
      },
    },
    price: 26,
    rating: "4.7",
    reviews: "1.1k+",
    time: "25-35 min",
    isLocalPick: true,
    emoji: "🍕",
    imageUrl: "/images/pizza.jpg",
    imagePosition: "center",
    options_title_en: "Flavor (Select 1)",
    options_title_cn: "选择口味",
    options: [
      { id: "bulgogi", label_en: "Real Bulgogi", label_cn: "烤肉" },
      {
        id: "sweet_potato",
        label_en: "Sweet Potato Mousse",
        label_cn: "红薯泥",
      },
      { id: "combination", label_en: "Combination", label_cn: "综合" },
      {
        id: "pepperoni",
        label_en: "Classic Pepperoni",
        label_cn: "经典意式香肠",
      },
    ],
    addonOptionsTitle_en: "Side Add-ons",
    addonOptionsTitle_cn: "附加小食",
    addonOptions: [
      {
        id: "french_fries",
        label_en: "Add French Fries",
        label_cn: "加薯条",
        price: 3.5,
      },
      {
        id: "oven_spaghetti",
        label_en: "Add Oven-Baked Spaghetti",
        label_cn: "加烤箱意面",
        price: 5.5,
      },
    ],
  },
  {
    id: "jjajang-tangsuyuk-combo",
    category: "chinese",
    name_en: "Jajangmyeon & Tangsuyuk Combo (For 1~2 Players)",
    name_cn: "炸酱面糖醋肉套餐（1~2人）",
    tagline_en: removeMenuBeverageNote(
      "The legendary Korean-Chinese duo. Perfect harmony of savory and sweet. Includes Black Bean Noodles (1) + Sweet & Sour Pork mini (1).",
    ),
    tagline_cn:
      "传奇韩式中餐组合，咸香与酸甜完美平衡。含炸酱面1份+糖醋肉小份1份。",
    translations: {
      ko: {
        name: "짜장면 & 탕수육 콤보 (1~2인)",
        tagline:
          "전설적인 한국식 중식 듀오. 짜장면 1 + 탕수육 미니 1이 기본 구성입니다.",
      },
    },
    price: 28,
    rating: "4.8",
    reviews: "1.2k+",
    time: "25-40 min",
    isLocalPick: true,
    emoji: "🥡",
    imageUrl: "/images/jjajang.jpg",
    imagePosition: "center",
    options_title_en: "Customize Your Combo (Select 1)",
    options_title_cn: "定制套餐",
    options: [
      {
        id: "standard",
        label_en: "Standard: Jajangmyeon (1) + Mini Tangsuyuk (1)",
        label_cn: "标准：炸酱面1 + 糖醋肉小份1",
      },
      {
        id: "jampong_swap",
        label_en: "Swap Noodles to Spicy Seafood Soup / Jampong",
        label_cn: "换辣海鲜汤面 / 炒码面",
        price: 4,
      },
    ],
    addonOptionsTitle_en: "Extra Add-ons",
    addonOptionsTitle_cn: "额外加购",
    addonOptions: [
      {
        id: "extra_jjajang",
        label_en: "Add 1 More Jajangmyeon",
        label_cn: "加一份炸酱面",
        price: 8,
      },
      {
        id: "fried_mandu",
        label_en: "Add Crispy Fried Mandu / Dumplings",
        label_cn: "加酥脆煎饺",
        price: 5,
      },
    ],
  },
  {
    id: "premium-k-bingsu-coffee",
    category: "dessert",
    name_en: "Premium K-Shaved Ice (Bingsu) & Coffee",
    name_cn: "韩式精品刨冰与咖啡",
    tagline_en: removeMenuBeverageNote(
      "The perfect sweet ending to complete your K-food journey.",
    ),
    tagline_cn: "为您的韩式美食之旅画上完美的甜蜜句号。",
    translations: {
      ko: {
        name: "프리미엄 K-빙수 & 커피",
        tagline: "K-푸드 여정을 완성하는 완벽한 달콤한 마무리.",
      },
    },
    price: 15,
    rating: "4.9",
    reviews: "2.1k+",
    time: "15-25 min",
    isLocalPick: true,
    emoji: "🍧",
    imageUrl: "/images/dessert.jpg",
    imagePosition: "center",
    options_title_en: "Flavor (Select 1)",
    options_title_cn: "选择口味",
    options: [
      {
        id: "injeolmi",
        label_en: "Classic Injeolmi (Sweet Red Bean & Roasted Grain Powder)",
        label_cn: "经典豆粉刨冰（红豆+黄豆粉）",
      },
      {
        id: "mango_cheese",
        label_en: "Sweet Mango & Cheese Cube",
        label_cn: "甜芒果芝士方块",
      },
    ],
    addonOptionsTitle_en: "Drink Add-ons",
    addonOptionsTitle_cn: "饮品加购",
    addonOptions: [
      {
        id: "iced_coffee",
        label_en: "Add Iced Americano / Premium Korean Coffee",
        label_cn: "加冰美式 / 精品韩式咖啡",
        price: 3.5,
      },
    ],
  },
];

export const MENU_CATEGORY_CAPSULES: Array<{
  id: MenuCategory;
  emoji: string;
}> = [
  { id: "all", emoji: "✨" },
  { id: "chicken", emoji: "🍗" },
  { id: "tteokbokki", emoji: "🌶️" },
  { id: "pizza", emoji: "🍕" },
  { id: "chinese", emoji: "🥡" },
  { id: "jokbal", emoji: "🥩" },
  { id: "dessert", emoji: "🍦" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  chicken: "🍗",
  tteokbokki: "🌶️",
  pizza: "🍕",
  noodles: "🍜",
  chinese: "🥡",
  jokbal: "🥩",
  side: "+",
  dessert: "🍦",
};

const PUBLIC_MENU_CATEGORIES = new Set<MenuCategory>([
  "all",
  "chicken",
  "tteokbokki",
  "pizza",
  "chinese",
  "jokbal",
  "dessert",
]);

export function isPublicMenuCategory(category: MenuCategory): boolean {
  return PUBLIC_MENU_CATEGORIES.has(category);
}

export function normalizeMenuCategory(
  category: string,
  name = "",
): Exclude<MenuCategory, "all"> {
  const lowerName = name.toLowerCase();

  if (category === "side") {
    return "side";
  }

  if (
    category === "chinese" ||
    lowerName.includes("jjajang") ||
    lowerName.includes("jajang") ||
    lowerName.includes("tangsuyuk") ||
    lowerName.includes("짜장")
  ) {
    return "chinese";
  }

  if (
    [
      "chicken",
      "tteokbokki",
      "pizza",
      "noodles",
      "jokbal",
      "dessert",
    ].includes(category)
  ) {
    return category as Exclude<MenuCategory, "all">;
  }

  return "chicken";
}

function findSeedItem(slug: string): MenuDataItem | undefined {
  return INITIAL_MENU_DATA.find((item) => item.id === slug);
}

function sideMenuToAddonOption(side: Menu): MenuDataOption {
  return {
    id: side.slug,
    label_en: side.side_name_en || side.name,
    label_cn: side.side_name_zh || side.name,
    side_name: side.name,
    side_name_en: side.side_name_en,
    side_name_zh: side.side_name_zh,
    side_name_ja: side.side_name_ja,
    price: side.base_price > 0 ? side.base_price : undefined,
  };
}

function positiveOptionPrice(option: unknown): number | undefined {
  const price = getMenuOptionPrice(option);
  return price > 0 ? price : undefined;
}

function resolveOptionsSelectionMode(): MenuOptionSelectionMode {
  return "multi_quantity";
}

function mapDrinkOptionsBlock(menu: Menu) {
  if (!shouldAttachDrinkOptions(menu.category)) {
    return {};
  }

  const drinkRadioGroup =
    menu.option_groups.find(isDrinkOptionGroup) ?? DRINK_OPTION_GROUP;
  const drinkDescription =
    drinkRadioGroup.description?.trim() || DRINK_OPTION_GROUP_DESCRIPTION;

  return {
    drinkOptionsTitle_en: drinkRadioGroup.label,
    drinkOptionsDescription_en: drinkDescription,
    drinkOptions: drinkRadioGroup.options.map((option) => ({
      id: normalizeOptionId(option.id),
      label_en: option.label,
      label_cn: option.label,
      price: parseOptionPrice(getMenuOptionPrice(option)),
    })),
  };
}

function mapDbOptions(
  menu: Menu,
  sideMenusById: Map<string, Menu>,
): {
  options_title_en: string;
  options_title_cn: string;
  options: MenuDataOption[];
  optionsGroupId?: string;
  optionsSelectionMode?: MenuOptionSelectionMode;
  addonOptionsTitle_en?: string;
  addonOptionsTitle_cn?: string;
  addonOptions?: MenuDataOption[];
  drinkOptionsTitle_en?: string;
  drinkOptionsDescription_en?: string;
  drinkOptions?: MenuDataOption[];
} {
  const radioGroups = menu.option_groups.filter((group) => group.type === "radio");
  const mainRadioGroup = radioGroups.find((group) => !isDrinkOptionGroup(group));
  const checkboxGroup = menu.option_groups.find(
    (group) => group.type === "checkbox",
  );
  const drinkBlock = mapDrinkOptionsBlock(menu);

  const inlineAddonOptions =
    checkboxGroup?.options.map((option) => ({
      id: normalizeOptionId(option.id),
      label_en: option.label,
      label_cn: option.label,
      price: positiveOptionPrice(option),
    })) ?? [];

  const attachedAddonOptions = (menu.attached_side_menu_ids ?? [])
    .map((sideId) => sideMenusById.get(sideId))
    .filter((side): side is Menu => Boolean(side?.is_active))
    .map(sideMenuToAddonOption);

  const customAddonOptions = (menu.attached_custom_sides ?? []).map((side) => ({
    id: side.id,
    label_en: side.name,
    label_cn: side.name,
    price: side.price > 0 ? side.price : undefined,
  }));

  const seenAddonIds = new Set<string>();
  const mergedAddonOptions = [
    ...inlineAddonOptions,
    ...attachedAddonOptions,
    ...customAddonOptions,
  ].filter(
    (option) => {
      if (seenAddonIds.has(option.id)) {
        return false;
      }

      seenAddonIds.add(option.id);
      return true;
    },
  );

  const addonOptions =
    mergedAddonOptions.length > 0
      ? {
          addonOptionsTitle_en: checkboxGroup?.label ?? "Add-ons",
          addonOptionsTitle_cn: checkboxGroup?.label ?? "附加选项",
          addonOptions: mergedAddonOptions,
        }
      : {};

  if (!mainRadioGroup) {
    const fallbackGroup =
      menu.category === "chicken" ? CHICKEN_FLAVOR_OPTION_GROUP : null;

    if (fallbackGroup) {
      const groupId = normalizeOptionId(fallbackGroup.id);
      return {
        options_title_en: fallbackGroup.label,
        options_title_cn: fallbackGroup.label,
        optionsGroupId: groupId,
        optionsSelectionMode: resolveOptionsSelectionMode(),
        options: fallbackGroup.options.map((option) => ({
          id: normalizeOptionId(option.id),
          label_en: option.label,
          label_cn: option.description ?? option.label,
          price: positiveOptionPrice(option),
        })),
        ...addonOptions,
        ...drinkBlock,
      };
    }

    return {
      options_title_en: "Select Option",
      options_title_cn: "请选择",
      optionsGroupId: "options",
      optionsSelectionMode: "multi_quantity",
      options: [
        {
          id: `${menu.slug}_default`,
          label_en: "Standard",
          label_cn: "标准",
        },
      ],
      ...addonOptions,
      ...drinkBlock,
    };
  }

  const groupId = normalizeOptionId(mainRadioGroup.id);

  return {
    options_title_en: mainRadioGroup.label,
    options_title_cn: mainRadioGroup.label,
    optionsGroupId: groupId,
    optionsSelectionMode: resolveOptionsSelectionMode(),
    options: mainRadioGroup.options.map((option) => ({
      id: normalizeOptionId(option.id),
      label_en: option.label,
      label_cn: option.label,
      price: positiveOptionPrice(option),
    })),
    ...addonOptions,
    ...drinkBlock,
  };
}

export function dbMenuToMenuDataItem(
  menu: Menu,
  allMenus: Menu[] = [],
): MenuDataItem {
  const seed = findSeedItem(menu.slug);
  const sideMenusById = new Map(
    allMenus
      .filter((entry) => entry.category === "side")
      .map((entry) => [entry.id, entry]),
  );
  const optionBlock = mapDbOptions(menu, sideMenusById);
  const category = normalizeMenuCategory(menu.category, menu.name);
  const imageUrls = parseMenuImageUrls(menu.image_url);
  const seedOptionsById = new Map(
    (seed?.options ?? []).map((option) => [
      normalizeOptionId(option.id),
      option,
    ]),
  );

  return {
    id: menu.slug,
    dbId: menu.id,
    category,
    name_en: menu.name,
    name_cn: seed?.name_cn ?? menu.name,
    tagline_en: removeMenuBeverageNote(menu.tagline || menu.description),
    tagline_cn: seed?.tagline_cn ?? (menu.tagline || menu.description),
    translations: menu.translations,
    price: menu.base_price,
    rating: seed?.rating ?? "4.8",
    reviews: seed?.reviews ?? "",
    time: seed?.time ?? "20-40 min",
    isLocalPick: seed?.isLocalPick ?? true,
    emoji: menu.emoji || CATEGORY_EMOJI[category] || "🍽️",
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    imageUrl: imageUrls[0] ?? seed?.imageUrl,
    imagePosition: menu.image_position || "center",
    options_title_en: optionBlock.options_title_en,
    options_title_cn: seed?.options_title_cn ?? optionBlock.options_title_cn,
    optionsGroupId: optionBlock.optionsGroupId,
    optionsSelectionMode: optionBlock.optionsSelectionMode,
    addonOptionsTitle_en: optionBlock.addonOptionsTitle_en,
    addonOptionsTitle_cn: optionBlock.addonOptionsTitle_cn,
    addonOptions: optionBlock.addonOptions,
    drinkOptionsTitle_en: optionBlock.drinkOptionsTitle_en,
    drinkOptionsDescription_en: optionBlock.drinkOptionsDescription_en,
    drinkOptions: optionBlock.drinkOptions,
    options:
      optionBlock.options.length > 0
        ? optionBlock.options.map((option) => {
            const seedOption = seedOptionsById.get(normalizeOptionId(option.id));

            return {
              id: option.id,
              label_en: option.label_en,
              label_cn: seedOption?.label_cn ?? option.label_cn,
              ...(typeof option.price === "number" ? { price: option.price } : {}),
            };
          })
        : seed?.options ?? optionBlock.options,
  };
}

export function menusToMenuData(menus: Menu[]): MenuDataItem[] {
  return menus
    .filter((menu) => menu.is_active)
    .map((menu) => dbMenuToMenuDataItem(menu, menus))
    .filter((item) => item.category !== "side")
    .sort((left, right) => {
      const leftOrder =
        menus.find((menu) => menu.slug === left.id)?.sort_order ?? 0;
      const rightOrder =
        menus.find((menu) => menu.slug === right.id)?.sort_order ?? 0;
      return leftOrder - rightOrder;
    });
}

export function pickLocalizedField(
  item: MenuDataItem,
  field: "name" | "tagline" | "options_title",
  language: MenuLanguage,
): string {
  if (field === "name" || field === "tagline") {
    const translatedValue = item.translations?.[language]?.[field]?.trim();
    if (translatedValue) {
      return translatedValue;
    }

    if (language === "ja") {
      const catalogValue = JAPANESE_MENU_ITEMS[item.id]?.[field]?.trim();
      if (catalogValue) {
        return catalogValue;
      }
    }
  }

  if (language === "zh") {
    const cnKey = `${field}_cn` as keyof MenuDataItem;
    const cnValue = item[cnKey];
    if (typeof cnValue === "string" && cnValue.trim()) {
      return cnValue;
    }
  }

  const enKey = `${field}_en` as keyof MenuDataItem;
  const enValue = item[enKey];
  if (typeof enValue === "string" && enValue) {
    if (field === "options_title") {
      return translateOptionText(enValue, language);
    }

    return enValue;
  }

  return "";
}

export function pickOptionLabel(
  option: MenuDataOption,
  language: MenuLanguage | "ko",
): string {
  const sideName = option.side_name?.trim();

  if (sideName) {
    const localizedSideName =
      language === "en"
        ? option.side_name_en
        : language === "zh"
          ? option.side_name_zh
          : language === "ja"
            ? option.side_name_ja
            : sideName;

    return localizedSideName?.trim() || sideName;
  }

  if (language === "zh" && option.label_cn.trim()) {
    return option.label_cn;
  }

  return translateOptionText(option.label_en, language);
}

export function pickAddonTitle(
  item: MenuDataItem,
  language: MenuLanguage,
): string {
  const englishTitle = item.addonOptionsTitle_en ?? "Add-ons";

  if (language === "zh" && item.addonOptionsTitle_cn?.trim()) {
    return item.addonOptionsTitle_cn;
  }

  if (language === "ja") {
    return englishTitle === "Add-ons"
      ? japaneseMenuMessages.ui.addons
      : translateOptionText(englishTitle, language);
  }

  return translateOptionText(englishTitle, language);
}

export function pickDrinkOptionsTitle(
  item: MenuDataItem,
  language: MenuLanguage,
): string {
  const englishTitle = item.drinkOptionsTitle_en ?? "Need a Drink?";
  return translateOptionText(englishTitle, language);
}

export function pickDrinkOptionsDescription(
  item: MenuDataItem,
  language: MenuLanguage,
): string {
  const englishDescription =
    item.drinkOptionsDescription_en ?? DRINK_OPTION_GROUP_DESCRIPTION;
  return translateOptionText(englishDescription, language);
}

export const DEFAULT_DRINK_OPTION_ID = "no_extra_drink";

export function pickCategoryLabel(
  categoryId: MenuCategory,
  translations: Partial<Record<MenuCategory, string>>,
): string {
  return translations[categoryId] ?? categoryId;
}

export function formatMenuPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
