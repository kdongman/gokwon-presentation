import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/server";
import {
  MENU_SELECT,
  MENU_SELECT_FALLBACK_CHAIN,
} from "@/lib/menu-columns";
import type { MenuOptionGroup } from "@/lib/gokwon-menu";
import {
  parseCustomAttachedSides,
  type CustomAttachedSide,
} from "@/lib/menu-sides";
import type { AppLocale } from "@/i18n/routing";
import type { MenuImageValue } from "@/lib/menu-images";
import { normalizeMenuImageValue } from "@/lib/menu-images";
import {
  formatSupabasePostgrestError,
  serializeOptionGroupsForDatabase,
  SupabaseMenuUpdateError,
} from "@/lib/menu-option-groups-db";
import {
  getMenuOptionPrice,
  normalizeOptionId,
} from "@/lib/menu-option-utils";

export type MenuTranslation = {
  name?: string;
  description?: string;
  tagline?: string;
};

export type MenuTranslations = Partial<
  Record<AppLocale | "ko", MenuTranslation>
>;

export type Menu = {
  id: string;
  slug: string;
  name: string;
  side_name_en: string;
  side_name_zh: string;
  side_name_ja: string;
  description: string;
  tagline: string;
  translations: MenuTranslations;
  price: number;
  base_price: number;
  category: string;
  emoji: string;
  meal_type: string;
  image_url: MenuImageValue;
  image_position: string;
  option_groups: MenuOptionGroup[];
  attached_side_menu_ids: string[];
  attached_custom_sides: CustomAttachedSide[];
  sort_order: number;
  is_active: boolean;
  is_sold_out: boolean;
  created_at: string;
};

export type MenuInput = {
  slug: string;
  name: string;
  side_name_en: string;
  side_name_zh: string;
  side_name_ja: string;
  description: string;
  tagline: string;
  translations: MenuTranslations;
  price: number;
  base_price: number;
  category: string;
  emoji: string;
  meal_type: string;
  image_url?: MenuImageValue;
  image_position: string;
  option_groups: MenuOptionGroup[];
  attached_side_menu_ids?: string[];
  attached_custom_sides?: CustomAttachedSide[];
  sort_order: number;
  is_active: boolean;
  is_sold_out?: boolean;
};

function parseOptionGroups(value: unknown): MenuOptionGroup[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((group) => {
    if (!group || typeof group !== "object" || Array.isArray(group)) {
      return [];
    }

    const entry = group as Record<string, unknown>;
    const groupId = normalizeOptionId(
      typeof entry.id === "string" ? entry.id : "",
    );
    const label = typeof entry.label === "string" ? entry.label.trim() : "";
    const options = Array.isArray(entry.options) ? entry.options : [];

    if (!groupId || !label) {
      return [];
    }

    return [
      {
        id: groupId,
        label,
        description:
          typeof entry.description === "string"
            ? entry.description.trim() || undefined
            : undefined,
        type: entry.type === "checkbox" ? "checkbox" : "radio",
        required: Boolean(entry.required),
        options: options.flatMap((option) => {
          if (!option || typeof option !== "object" || Array.isArray(option)) {
            return [];
          }

          const optionEntry = option as Record<string, unknown>;
          const optionId = normalizeOptionId(
            typeof optionEntry.id === "string" ? optionEntry.id : "",
          );
          const optionLabel =
            typeof optionEntry.label === "string"
              ? optionEntry.label.trim()
              : "";

          if (!optionId || !optionLabel) {
            return [];
          }

          const price = getMenuOptionPrice(optionEntry);
          return [
            {
              id: optionId,
              label: optionLabel,
              description:
                typeof optionEntry.description === "string"
                  ? optionEntry.description.trim() || undefined
                  : undefined,
              price,
            },
          ];
        }),
      } satisfies MenuOptionGroup,
    ];
  });
}

function parseAttachedSideMenuIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((id): id is string => typeof id === "string" && id.trim().length > 0);
}

function parseTranslations(value: unknown): MenuTranslations {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as MenuTranslations;
}

function slugifyMenu(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function inferCategory(name: string): string {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("dessert") || lowerName.includes("ice cream")) {
    return "dessert";
  }

  if (lowerName.includes("side") || lowerName.includes("cheese ball")) {
    return "side";
  }

  if (lowerName.includes("pizza")) {
    return "pizza";
  }

  if (lowerName.includes("tteokbokki")) {
    return "tteokbokki";
  }

  if (
    lowerName.includes("jjajang") ||
    lowerName.includes("jajang") ||
    lowerName.includes("tangsuyuk") ||
    lowerName.includes("chinese")
  ) {
    return "chinese";
  }

  if (lowerName.includes("noodle")) {
    return "noodles";
  }

  if (lowerName.includes("jokbal") || lowerName.includes("bbq")) {
    return "jokbal";
  }

  return "chicken";
}

function isMissingColumnError(error: { message?: string; code?: string } | null): boolean {
  return Boolean(
    error?.code === "42703" ||
      error?.message?.includes("column menus.") ||
      error?.message?.includes("does not exist"),
  );
}

type MenuQueryResult = {
  data: unknown;
  error: { message?: string; code?: string } | null;
};

async function runMenuListQuery(
  run: (select: string) => Promise<MenuQueryResult>,
): Promise<Menu[]> {
  for (let index = 0; index < MENU_SELECT_FALLBACK_CHAIN.length; index += 1) {
    const select = MENU_SELECT_FALLBACK_CHAIN[index];
    const result = await run(select);
    if (!result.error) {
      return ((result.data as Parameters<typeof mapMenu>[0][]) ?? []).map(mapMenu);
    }

    if (
      !isMissingColumnError(result.error) ||
      index === MENU_SELECT_FALLBACK_CHAIN.length - 1
    ) {
      throw new Error(result.error.message ?? "Failed to load menus.");
    }
  }

  return [];
}

async function runMenuSingleQuery(
  run: (select: string) => Promise<MenuQueryResult>,
): Promise<Menu | null> {
  for (let index = 0; index < MENU_SELECT_FALLBACK_CHAIN.length; index += 1) {
    const select = MENU_SELECT_FALLBACK_CHAIN[index];
    const result = await run(select);
    if (!result.error) {
      return result.data
        ? mapMenu(result.data as Parameters<typeof mapMenu>[0])
        : null;
    }

    if (
      !isMissingColumnError(result.error) ||
      index === MENU_SELECT_FALLBACK_CHAIN.length - 1
    ) {
      throw new Error(result.error.message ?? "Failed to load menu.");
    }
  }

  return null;
}

function mapMenu(row: {
  id: string;
  slug?: string | null;
  name: string;
  side_name_en?: string | null;
  side_name_zh?: string | null;
  side_name_ja?: string | null;
  description: string;
  tagline?: string | null;
  translations?: unknown;
  price: number;
  base_price?: number | null;
  category?: string | null;
  emoji?: string | null;
  meal_type?: string | null;
  image_url?: unknown;
  image_position?: string | null;
  option_groups?: unknown;
  attached_side_menu_ids?: unknown;
  attached_custom_sides?: unknown;
  sort_order?: number | null;
  is_active?: boolean | null;
  is_sold_out?: boolean | null;
  created_at: string;
}): Menu {
  const basePrice = Number(row.base_price ?? row.price);
  const category = row.category ?? inferCategory(row.name);

  return {
    id: row.id,
    slug: row.slug ?? slugifyMenu(row.name || row.id),
    name: row.name,
    side_name_en: row.side_name_en?.trim() ?? "",
    side_name_zh: row.side_name_zh?.trim() ?? "",
    side_name_ja: row.side_name_ja?.trim() ?? "",
    description: row.description,
    tagline: row.tagline ?? "",
    translations: parseTranslations(row.translations),
    price: Number(row.price),
    base_price: basePrice,
    category,
    emoji: row.emoji ?? "🍽️",
    meal_type: row.meal_type ?? (category === "side" ? "Side Menu" : "Meal"),
    image_url: normalizeMenuImageValue(row.image_url),
    image_position: row.image_position ?? "center",
    option_groups: parseOptionGroups(row.option_groups),
    attached_side_menu_ids: parseAttachedSideMenuIds(row.attached_side_menu_ids),
    attached_custom_sides: parseCustomAttachedSides(row.attached_custom_sides),
    sort_order: Number(row.sort_order ?? 0),
    is_active: row.is_active ?? true,
    is_sold_out: row.is_sold_out ?? false,
    created_at: row.created_at,
  };
}

export async function fetchMenus(): Promise<Menu[]> {
  const supabase = createPublicClient();
  return runMenuListQuery(async (select) =>
    supabase
      .from("menus")
      .select(select)
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  );
}

export async function fetchMenuByIdAdmin(
  id: string,
): Promise<Menu | null> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  return runMenuSingleQuery(async (select) =>
    admin.from("menus").select(select).eq("id", id).maybeSingle(),
  );
}

export async function fetchMenuBySlugAdmin(
  slug: string,
): Promise<Menu | null> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  const row = await runMenuSingleQuery(async (select) =>
    admin.from("menus").select(select).eq("slug", slug).maybeSingle(),
  );

  if (row) {
    return row;
  }

  const rows = await runMenuListQuery(async (select) =>
    admin.from("menus").select(select).order("created_at", { ascending: true }),
  );

  return rows.find((menu) => menu.slug === slug) ?? null;
}

export async function fetchAdminMenus(): Promise<Menu[]> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  return runMenuListQuery(async (select) =>
    admin.from("menus").select(select).order("sort_order", { ascending: true }),
  );
}

export async function createAdminMenu(input: MenuInput): Promise<Menu> {
  const admin = createAdminClient();

  if (!admin) {
    throw new SupabaseMenuUpdateError(
      "Server database admin access is not available in this presentation build.",
      {
        table: "menus",
        column: "option_groups",
        layer: "admin_client",
      },
    );
  }

  const payload: MenuInput = {
    ...input,
    option_groups: serializeOptionGroupsForDatabase(
      input.option_groups,
    ) as MenuInput["option_groups"],
  };

  const { data, error } = await admin
    .from("menus")
    .insert(payload)
    .select(MENU_SELECT)
    .maybeSingle();

  if (error) {
    throw formatSupabasePostgrestError(error, {
      table: "menus",
      column: "option_groups",
      layer: "menus.insert",
    });
  }

  if (!data) {
    throw new SupabaseMenuUpdateError("No row was returned after insert.", {
      table: "menus",
      column: "option_groups",
      layer: "menus.insert",
    });
  }

  return mapMenu(data);
}

export async function overwriteAdminMenuOptionGroups(
  id: string,
  groups: MenuOptionGroup[],
): Promise<void> {
  const admin = createAdminClient();

  if (!admin) {
    throw new SupabaseMenuUpdateError(
      "Server database admin access is not available in this presentation build.",
      {
        table: "menus",
        column: "option_groups",
        layer: "admin_client",
      },
    );
  }

  const option_groups = serializeOptionGroupsForDatabase(groups);

  const { error } = await admin
    .from("menus")
    .update({ option_groups })
    .eq("id", id);

  if (error) {
    throw formatSupabasePostgrestError(error, {
      table: "menus",
      column: "option_groups",
      layer: "menus.option_groups.overwrite",
    });
  }
}

export async function updateAdminMenu(
  id: string,
  input: Partial<MenuInput>,
): Promise<Menu> {
  const admin = createAdminClient();

  if (!admin) {
    throw new SupabaseMenuUpdateError(
      "Server database admin access is not available in this presentation build.",
      {
        table: "menus",
        column: "option_groups",
        layer: "admin_client",
      },
    );
  }

  const { option_groups, ...scalarPatch } = input;

  if (Object.keys(scalarPatch).length > 0) {
    const { error } = await admin.from("menus").update(scalarPatch).eq("id", id);

    if (error) {
      throw formatSupabasePostgrestError(error, {
        table: "menus",
        column: "option_groups",
        layer: "menus.update",
      });
    }
  }

  if (option_groups) {
    await overwriteAdminMenuOptionGroups(id, option_groups);
  }

  const menu = await fetchMenuByIdAdmin(id);

  if (!menu) {
    throw new SupabaseMenuUpdateError(
      "Menu row could not be reloaded after update.",
      {
        table: "menus",
        column: "option_groups",
        layer: "menus.reload",
      },
    );
  }

  return menu;
}

export async function deleteAdminMenu(id: string): Promise<void> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  const { error } = await admin.from("menus").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export type MenuQuickPatch = {
  is_active?: boolean;
  is_sold_out?: boolean;
  base_price?: number;
};

export async function patchAdminMenu(
  id: string,
  patch: MenuQuickPatch,
): Promise<Menu> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  const update: Record<string, unknown> = {};

  if (typeof patch.is_active === "boolean") {
    update.is_active = patch.is_active;
  }

  if (typeof patch.is_sold_out === "boolean") {
    update.is_sold_out = patch.is_sold_out;
  }

  if (typeof patch.base_price === "number" && Number.isFinite(patch.base_price)) {
    if (patch.base_price < 0) {
      throw new Error("Base price must be 0 or greater.");
    }

    update.base_price = patch.base_price;
    update.price = Math.max(0, Math.round(patch.base_price));
  }

  if (Object.keys(update).length === 0) {
    throw new Error("No valid fields to update.");
  }

  const { data, error } = await admin
    .from("menus")
    .update(update)
    .eq("id", id)
    .select(MENU_SELECT)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update menu.");
  }

  return mapMenu(data);
}

export async function reorderAdminMenus(ids: string[]): Promise<void> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  if (ids.length === 0) {
    return;
  }

  const updates = ids.map((id, index) =>
    admin.from("menus").update({ sort_order: index }).eq("id", id),
  );

  const results = await Promise.all(updates);

  for (const result of results) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }
}
