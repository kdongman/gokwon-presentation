const PRODUCT_VISUALS = [
  {
    accent: "from-violet-500 to-fuchsia-500",
    imageGradient: "from-violet-200 via-fuchsia-100 to-white",
  },
  {
    accent: "from-sky-500 to-indigo-600",
    imageGradient: "from-sky-200 via-indigo-100 to-white",
  },
  {
    accent: "from-rose-500 to-orange-500",
    imageGradient: "from-rose-200 via-orange-100 to-white",
  },
  {
    accent: "from-emerald-500 to-teal-600",
    imageGradient: "from-emerald-200 via-teal-100 to-white",
  },
];

export function getProductVisual(productId: string | number) {
  const numericId = Number(productId);
  const index = Number.isFinite(numericId)
    ? Math.abs(numericId - 1) % PRODUCT_VISUALS.length
    : 0;

  return PRODUCT_VISUALS[index];
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Order totals are stored in USD cents (`total_krw` / `subtotal_krw`). */
export function formatUsdFromStoredCents(storedAmount: number): string {
  return formatUsd(storedAmount / 100);
}

/**
 * Supports current cents storage and older rows saved as whole-dollar integers.
 */
export function formatOrderTotalUsd(
  storedAmount: number,
  menuPrice?: number | null,
): string {
  if (!Number.isFinite(storedAmount)) {
    return formatUsd(0);
  }

  if (storedAmount < 100) {
    return formatUsd(storedAmount);
  }

  const fromCents = storedAmount / 100;

  if (menuPrice != null && menuPrice > 0) {
    const legacyDelta = Math.abs(storedAmount - menuPrice);
    const centsDelta = Math.abs(fromCents - menuPrice);

    if (legacyDelta < centsDelta && legacyDelta <= Math.max(5, menuPrice * 0.25)) {
      return formatUsd(storedAmount);
    }
  }

  return formatUsd(fromCents);
}
