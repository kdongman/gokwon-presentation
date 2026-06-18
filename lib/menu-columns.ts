export const MENU_SELECT_BASE =
  "id, slug, name, description, tagline, translations, price, base_price, category, emoji, meal_type, image_url, image_position, option_groups, sort_order, is_active, is_sold_out, created_at";

export const MENU_SELECT_WITH_SIDE_NAMES =
  `${MENU_SELECT_BASE}, side_name_en, side_name_zh, side_name_ja`;

export const MENU_SELECT_WITH_SIDE_IDS = `${MENU_SELECT_BASE}, attached_side_menu_ids`;

export const MENU_SELECT_WITH_SIDE_NAMES_AND_SIDE_IDS =
  `${MENU_SELECT_WITH_SIDE_NAMES}, attached_side_menu_ids`;

export const MENU_SELECT =
  `${MENU_SELECT_WITH_SIDE_NAMES_AND_SIDE_IDS}, attached_custom_sides`;

const LEGACY_MENU_SELECT =
  `${MENU_SELECT_WITH_SIDE_IDS}, attached_custom_sides`;

/** Progressive fallback order when newer columns are not migrated yet. */
export const MENU_SELECT_FALLBACK_CHAIN = [
  MENU_SELECT,
  MENU_SELECT_WITH_SIDE_NAMES_AND_SIDE_IDS,
  MENU_SELECT_WITH_SIDE_NAMES,
  LEGACY_MENU_SELECT,
  MENU_SELECT_WITH_SIDE_IDS,
  MENU_SELECT_BASE,
] as const;
