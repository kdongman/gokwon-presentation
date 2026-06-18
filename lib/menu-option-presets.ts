import type { MenuOptionGroup } from "@/lib/gokwon-menu";

export const CHICKEN_FLAVOR_OPTION_GROUP: MenuOptionGroup = {
  id: "flavor",
  label: "Flavor (Select 1)",
  type: "radio",
  required: true,
  options: [
    {
      id: "fried",
      label: "Fried",
      description: "후라이드",
    },
    {
      id: "sweet_spicy",
      label: "Sweet & Spicy Seasoned",
      description: "양념",
    },
    {
      id: "half_half",
      label: "Half & Half",
      description: "반반",
    },
    {
      id: "bburinkle",
      label: "Golden Cheese Powder / Bburinkle",
      description: "뿌링클",
    },
  ],
};

export function cloneOptionGroup(group: MenuOptionGroup): MenuOptionGroup {
  return {
    ...group,
    options: group.options.map((option) => ({ ...option })),
  };
}

export function createChickenFlavorOptionGroup(): MenuOptionGroup {
  return cloneOptionGroup(CHICKEN_FLAVOR_OPTION_GROUP);
}

export function hasFlavorOptionGroup(groups: MenuOptionGroup[]): boolean {
  return groups.some(
    (group) =>
      group.type === "radio" &&
      (group.id === "flavor" ||
        group.label.toLowerCase().includes("flavor") ||
        group.label.includes("맛")),
  );
}

export const FLAVOR_OPTION_GROUP_ID = "flavor";

export const DRINK_OPTIONS_GROUP_ID = "drink_options";

export const DRINK_OPTION_GROUP_DESCRIPTION =
  "Basic drinks are NOT guaranteed with your meal (restaurant policy varies daily). If you add a large drink, you may receive Pepsi, Coca-Cola, Sprite, or another cola/lemon-lime soda depending on stock — not a specific brand.";

export const DRINK_OPTION_GROUP: MenuOptionGroup = {
  id: DRINK_OPTIONS_GROUP_ID,
  label: "Need a Drink?",
  description: DRINK_OPTION_GROUP_DESCRIPTION,
  type: "radio",
  required: false,
  options: [
    {
      id: "no_extra_drink",
      label: "No Extra Drink",
      price: 0,
    },
    {
      id: "large_cola",
      label: "Add Large Cola (1.25L)",
      price: 4,
    },
    {
      id: "large_lemon_lime_soda",
      label: "Add Large Lemon-Lime Soda (1.25L)",
      price: 4,
    },
  ],
};

export function isDrinkOptionGroup(group: MenuOptionGroup): boolean {
  return (
    group.type === "radio" &&
    (group.id === DRINK_OPTIONS_GROUP_ID ||
      group.label.toLowerCase().includes("need a drink") ||
      group.label.includes("음료"))
  );
}

export function hasDrinkOptionGroup(groups: MenuOptionGroup[]): boolean {
  return groups.some(isDrinkOptionGroup);
}

export function createDrinkOptionGroup(): MenuOptionGroup {
  return cloneOptionGroup(DRINK_OPTION_GROUP);
}

export function shouldAttachDrinkOptions(category: string): boolean {
  return category !== "side" && category !== "dessert";
}
