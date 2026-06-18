export type GokwonCatalogItem = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  rating: string;
  reviews: string;
  time: string;
  tags: string[];
};

export const GOKWON_CATALOG: GokwonCatalogItem[] = [
  {
    id: "premium-k-fried-chicken",
    name: "Premium K-Fried Chicken",
    tagline:
      "Experience the authentic Korean crispy chicken. Choose Fried, Sweet & Spicy, Half & Half, or Bburinkle cheese powder.",
    price: "24.00",
    rating: "4.9",
    reviews: "1,840",
    time: "25-40 min",
    tags: ["Local Pick", "Fried Chicken", "Best Seller"],
  },
  {
    id: "k-street-tteokbokki",
    name: "K-Street Tteokbokki (Chewy Rice Cakes)",
    tagline:
      "The ultimate Korean soul food. Chewy rice cakes in delicious sauce — pick Original or Rose Cream, Mild to Spicy.",
    price: "18.00",
    rating: "4.8",
    reviews: "920",
    time: "20-35 min",
    tags: ["Comfort Food", "Street Food", "Highly Rated"],
  },
  {
    id: "premium-k-pizza",
    name: "Premium K-Pizza",
    tagline:
      "Unique and loaded Korean-style pizza. Bulgogi, Sweet Potato, Combination, or Classic Pepperoni.",
    price: "26.00",
    rating: "4.7",
    reviews: "1,100",
    time: "25-35 min",
    tags: ["Unique Pizza", "K-Style", "Local Favorite"],
  },
  {
    id: "jjajang-tangsuyuk-combo",
    name: "Jajangmyeon & Tangsuyuk Combo (For 1~2 Players)",
    tagline:
      "The legendary Korean-Chinese duo. Black Bean Noodles (1) + Sweet & Sour Pork mini (1). Customize with Jampong swap or extras.",
    price: "28.00",
    rating: "4.8",
    reviews: "2,150",
    time: "25-40 min",
    tags: ["Noodles", "K-Chinese", "K-Drama Essential"],
  },
  {
    id: "premium-k-bingsu-coffee",
    name: "Premium K-Shaved Ice (Bingsu) & Coffee",
    tagline:
      "The perfect sweet ending to complete your K-food journey. Injeolmi or Mango & Cheese — add premium Korean coffee.",
    price: "15.00",
    rating: "4.9",
    reviews: "3,410",
    time: "15-25 min",
    tags: ["Top Trend", "Bingsu", "Sweet Tooth"],
  },
];

export function getGokwonProductById(id: string): GokwonCatalogItem | undefined {
  return GOKWON_CATALOG.find((item) => item.id === id);
}

export function getGokwonProductIndex(id: string): number {
  return GOKWON_CATALOG.findIndex((item) => item.id === id);
}

export function getGokwonMeals(): GokwonCatalogItem[] {
  return GOKWON_CATALOG.filter((item) => item.id !== "premium-k-bingsu-coffee");
}

export function getGokwonDesserts(): GokwonCatalogItem[] {
  return GOKWON_CATALOG.filter((item) => item.id === "premium-k-bingsu-coffee");
}
