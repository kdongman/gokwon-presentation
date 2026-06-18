import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Presentation-safe stub.
 *
 * The production project uses a Supabase service-role client for server-only
 * admin operations. That implementation is intentionally removed from this
 * public presentation repository.
 */
export function createAdminClient(): SupabaseClient | null {
  return null as unknown as SupabaseClient | null;
}
