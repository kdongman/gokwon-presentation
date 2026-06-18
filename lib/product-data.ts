import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/server";
import { PRODUCT_SELECT } from "@/lib/product-columns";
import { getLocalizedProductTitle } from "@/lib/product-title";

export { PRODUCT_SELECT, getLocalizedProductTitle };

export type Product = {
  id: number;
  title: string;
  title_ko: string | null;
  title_en: string | null;
  title_es: string | null;
  title_ja: string | null;
  title_ru: string | null;
  image_url: string | null;
  price: number;
  created_at: string | null;
};

export type ProductInput = {
  title: string;
  title_ko?: string | null;
  title_en?: string | null;
  title_es?: string | null;
  title_ja?: string | null;
  title_ru?: string | null;
  image_url?: string | null;
  price: number;
};

function mapProduct(row: {
  id: number;
  title: string;
  title_ko?: string | null;
  title_en?: string | null;
  title_es?: string | null;
  title_ja?: string | null;
  title_ru?: string | null;
  image_url?: string | null;
  price: number;
  created_at: string | null;
}): Product {
  return {
    id: Number(row.id),
    title: row.title,
    title_ko: row.title_ko ?? null,
    title_en: row.title_en ?? null,
    title_es: row.title_es ?? null,
    title_ja: row.title_ja ?? null,
    title_ru: row.title_ru ?? null,
    image_url: row.image_url ?? null,
    price: Number(row.price),
    created_at: row.created_at,
  };
}

export function cleanProductField(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function fetchProducts(): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProduct);
}

export async function fetchProductById(id: string | number): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProduct(data) : null;
}

export async function fetchProductByIdAdmin(
  id: string | number,
): Promise<Product | null> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  const { data, error } = await admin
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProduct(data) : null;
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  const { data, error } = await admin
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapProduct);
}

export async function createAdminProduct(input: ProductInput): Promise<Product> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  const { data, error } = await admin
    .from("products")
    .insert({
      title: input.title,
      title_ko: cleanProductField(input.title_ko),
      title_en: cleanProductField(input.title_en),
      title_es: cleanProductField(input.title_es),
      title_ja: cleanProductField(input.title_ja),
      title_ru: cleanProductField(input.title_ru),
      image_url: cleanProductField(input.image_url),
      price: input.price,
    })
    .select(PRODUCT_SELECT)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create product.");
  }

  return mapProduct(data);
}

export async function deleteAdminProduct(id: string | number): Promise<void> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  const { error } = await admin.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateAdminProductPrice(
  id: string | number,
  price: number,
): Promise<void> {
  const admin = createAdminClient();

  if (!admin) {
    throw new Error("Server database admin access is not available in this presentation build.");
  }

  const { error } = await admin
    .from("products")
    .update({ price })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
