import "server-only";

import { revalidatePath } from "next/cache";

/**
 * Invalidate every surface that reads live menu / option_groups data.
 * Called after admin menu create, update, delete, reorder, or quick patch.
 */
export function revalidatePublicMenuCache(): void {
  revalidatePath("/api/menus");
  revalidatePath("/api/admin/menus");

  // Root + layout (localized home, marketing shell).
  revalidatePath("/", "layout");
  revalidatePath("/");

  // Menu board, checkout, and legacy options path the team uses in ops.
  revalidatePath("/home");
  revalidatePath("/home/menu");
  revalidatePath("/checkout");
  revalidatePath("/options");

  // Admin list should never serve a stale row after save.
  revalidatePath("/admin/menus");
}
