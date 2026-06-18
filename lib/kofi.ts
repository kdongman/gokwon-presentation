/** Ko-fi creator page — donation / "Buy a Coffee" flow (no shop catalog). */
export const KOFI_DONATION_PAGE_URL = "https://ko-fi.com/gokwon";

export const KOFI_DONATION_PRODUCT_ID = "kofi-donation";
export const KOFI_DONATION_PRODUCT_TITLE = "GoKwon Ko-fi Donation";

export function getKofiDonationUrl(amount?: number): string {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return KOFI_DONATION_PAGE_URL;
  }

  const url = new URL(KOFI_DONATION_PAGE_URL);
  url.searchParams.set("amount", amount.toFixed(2));
  return url.toString();
}
