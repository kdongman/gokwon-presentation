export type MenuPageLanguage = "en" | "zh";

export type BilingualMenuCategory =
  | "all"
  | "chicken"
  | "pizza"
  | "tteokbokki"
  | "dessert";

export type BilingualMenuRecord = {
  id: string;
  name_en: string;
  name_cn: string;
  tagline_en: string;
  tagline_cn: string;
  price: string;
  rating: string;
  reviews: string;
  time: string;
  tags: string[];
};

export const GOKWON_BILINGUAL_MENU: BilingualMenuRecord[] = [
  {
    id: "set_01",
    name_en: "The Famous 'Sweet & Cheese' Crispy Chicken Set",
    name_cn: "韩国爆款‘芝士雪花’酥脆炸鸡套餐",
    tagline_en:
      "K-Chicken Recommendation: This is the exact 'Dan-Zan' (sweet & savory) chicken that locals crave. Includes mozzarella cheese balls and a cola.",
    tagline_cn:
      "韩国人推荐：这就是韩国本地人最爱的‘咸甜神仙组合’雪花炸鸡！包含爆浆芝士球(5个)和可乐。",
    price: "24.99",
    rating: "4.9",
    reviews: "1,840",
    time: "25-40 min",
    tags: ["Local Pick", "韩国人推荐", "Fried Chicken"],
  },
  {
    id: "set_02",
    name_en: "Creamy Rose Tteokbokki & Golden Fries Combo",
    name_cn: "香浓奶油罗惹(Rose)辣炒年糕与黄金炸物组合",
    tagline_en:
      "K-Street Food Recommendation: Traditional tteokbokki can be too spicy, so Koreans created this smooth, creamy rose sauce version. Pairs perfectly with assorted fries.",
    tagline_cn:
      "韩国人推荐：传统年糕可能太辣，所以韩国人研发(奶油+高丽酱)罗惹酱，香浓微辣！附带炸紫菜包饭和炸饺子，蘸酱吃绝配。",
    price: "19.99",
    rating: "4.8",
    reviews: "920",
    time: "20-35 min",
    tags: ["Comfort Food", "人气爆款", "Street Food"],
  },
  {
    id: "set_03",
    name_en: "Half-and-Half Glazed & Spicy Braised Pork (Jokbal)",
    name_cn: "半半双拼韩式猪蹄套餐 (秘制酱香 + 绝味香辣)",
    tagline_en:
      "K-Midnight Snack Recommendation: The ultimate late-night food for locals. Tender, smoky glazed pork trotters paired with a fiery spicy version.",
    tagline_cn:
      "韩国人推荐：韩国骨灰级深夜外卖灵魂！软糯Q弹的富含胶原蛋白的酱香猪蹄，搭配让人欲罢不能的直火香辣双拼。",
    price: "34.99",
    rating: "4.9",
    reviews: "640",
    time: "30-45 min",
    tags: ["Authentic K-BBQ", "深夜夜宵", "Trending"],
  },
  {
    id: "set_04",
    name_en: "Sweet Potato Gold & Bacon Premium K-Pizza",
    name_cn: "韩式金牌红薯慕斯培根豪华披萨",
    tagline_en:
      "K-Pizza Recommendation: A unique local creation you can't find in the West. Loaded with sweet potato mousse crust, smoky bacon, and rich cheese.",
    tagline_cn:
      "韩国人推荐：欧美绝对见不到的韩国独创披萨！边圈塞满了甜甜的红薯泥(Mousse)，上面铺满培根，口感丰富神奇。",
    price: "21.99",
    rating: "4.7",
    reviews: "1,100",
    time: "25-35 min",
    tags: ["Unique Pizza", "红薯地带", "Local Favorite"],
  },
  {
    id: "set_05",
    name_en: "The K-Drama Classic: Jjajangmyeon & Crispy Pork Combo",
    name_cn: "韩剧同款：韩式炸酱面 + 锅包肉(糖醋肉)黄金组合",
    tagline_en:
      "K-Classic Recommendation: The most iconic moving-day and rainy-day food in Korea. Savory black bean noodles paired with ultra-crunchy sweet-and-sour pork.",
    tagline_cn:
      "韩国人推荐：韩剧中出镜率100%的国民外卖。浓郁咸香 Black Bean 酱面，搭配口感酥脆、酸甜开胃的韩式糖醋肉。",
    price: "18.99",
    rating: "4.8",
    reviews: "2,150",
    time: "20-30 min",
    tags: ["Noodles", "韩剧同款", "K-Drama Essential"],
  },
  {
    id: "dessert_01",
    name_en: "Trending Premium Yogurt Ice Cream with Real Honeycomb",
    name_cn: "韩国当下顶流：天然蜂巢蜜鲜果酸奶冰淇淋",
    tagline_en:
      "K-Dessert Recommendation: The absolute #1 trending dessert in Korea right now. Refreshing yogurt ice cream topped with real, chewy honeycomb.",
    tagline_cn:
      "韩国人推荐：当下韩国年轻人在外卖App上疯狂打卡的顶流甜品(Yoajung风)。清爽酸奶冰淇淋搭配一整块纯天然拉丝蜂巢蜜和鲜草莓。",
    price: "14.99",
    rating: "4.9",
    reviews: "3,410",
    time: "15-25 min",
    tags: ["Top Trend", "天然蜂巢", "Sweet Tooth"],
  },
  {
    id: "dessert_02",
    name_en: "Toasted Croffle & Sweet Injeolmi Rice-Cake Toast",
    name_cn: "韩式冰雪期待：现烤可颂华夫饼(Croffle) & 年糕吐司组合",
    tagline_en:
      "K-Cafe Recommendation: A brilliant fusion dessert. Flaky, buttery croissant-waffles paired with crispy toast filled with chewy traditional Korean rice cake.",
    tagline_cn:
      "韩国人推荐：传统的韩国年糕与西方烘焙完美融合。外酥里软的面包里夹着软糯拉丝의切糕，洒满香甜黄豆粉，绝对要试一下！",
    price: "12.99",
    rating: "4.7",
    reviews: "850",
    time: "15-30 min",
    tags: ["Traditional Fusion", "网红传统", "Must-Try"],
  },
];

export const ITEM_CATEGORY_META: Record<
  string,
  {
    category: Exclude<BilingualMenuCategory, "all">;
    emoji: string;
    imagePosition: string;
  }
> = {
  set_01: { category: "chicken", emoji: "🍗", imagePosition: "72% 18%" },
  set_02: { category: "tteokbokki", emoji: "🌶️", imagePosition: "54% 42%" },
  set_03: { category: "chicken", emoji: "🥩", imagePosition: "48% 36%" },
  set_04: { category: "pizza", emoji: "🍕", imagePosition: "25% 88%" },
  set_05: { category: "tteokbokki", emoji: "🍜", imagePosition: "62% 28%" },
  dessert_01: { category: "dessert", emoji: "🍦", imagePosition: "40% 78%" },
  dessert_02: { category: "dessert", emoji: "🧇", imagePosition: "46% 72%" },
};

export const GOKWON_BILINGUAL_CATEGORIES: Array<{
  id: BilingualMenuCategory;
  label: string;
  emoji: string;
}> = [
  { id: "all", label: "All / 全部", emoji: "✨" },
  { id: "chicken", label: "Chicken / 韩国炸鸡", emoji: "🍗" },
  { id: "tteokbokki", label: "Tteokbokki / 辣炒年糕", emoji: "🌶️" },
  { id: "pizza", label: "Pizza / 披萨", emoji: "🍕" },
  { id: "dessert", label: "Dessert / 甜品", emoji: "🍦" },
];

export function resolveMenuName(
  item: BilingualMenuRecord,
  language: MenuPageLanguage,
): string {
  return language === "zh" ? item.name_cn : item.name_en;
}

export function resolveMenuTagline(
  item: BilingualMenuRecord,
  language: MenuPageLanguage,
): string {
  return language === "zh" ? item.tagline_cn : item.tagline_en;
}

export function resolveGokwonItemDisplay(
  item: {
    name: string;
    tagline: string;
    name_en?: string;
    name_cn?: string;
    tagline_en?: string;
    tagline_cn?: string;
  },
  language: MenuPageLanguage,
): { name: string; tagline: string } {
  if (language === "zh") {
    return {
      name: item.name_cn ?? item.name,
      tagline: item.tagline_cn ?? item.tagline,
    };
  }

  return {
    name: item.name_en ?? item.name,
    tagline: item.tagline_en ?? item.tagline,
  };
}

export const GOKWON_MENU_LANG_KEY = "gokwon-menu-lang";

export function readMenuPageLanguage(): MenuPageLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(GOKWON_MENU_LANG_KEY);
  return stored === "zh" ? "zh" : "en";
}

export function saveMenuPageLanguage(language: MenuPageLanguage): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GOKWON_MENU_LANG_KEY, language);
}
