export const PROMO_FIRST100 = "FIRST100";
export const PROMO_FIRST100_DISCOUNT_USD = 5;

export type AppliedPromo = {
  code: string;
  discountUsd: number;
};

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function validatePromoCode(raw: string): AppliedPromo | null {
  const code = normalizePromoCode(raw);
  if (!code) {
    return null;
  }

  if (code === PROMO_FIRST100) {
    return {
      code: PROMO_FIRST100,
      discountUsd: PROMO_FIRST100_DISCOUNT_USD,
    };
  }

  return null;
}

export function applyPromoDiscount(
  subtotalUsd: number,
  discountUsd: number,
): number {
  return Math.max(0, Math.round((subtotalUsd - discountUsd) * 100) / 100);
}
