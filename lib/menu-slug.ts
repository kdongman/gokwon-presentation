/** Slugify menu name: lowercase, spaces/special chars → hyphens, Korean preserved. */
export function slugifyMenuName(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  if (normalized) {
    return normalized;
  }

  return `menu-${Date.now()}`;
}

/** Auto-sync slug while typing the menu name until the slug is manually edited. */
export function shouldAutoSyncMenuSlug(
  currentSlug: string,
  previousName: string,
): boolean {
  const trimmed = currentSlug.trim();
  if (!trimmed) {
    return true;
  }

  return trimmed === slugifyMenuName(previousName);
}
