export const MAX_ADMIN_MENU_PRICE_USD = 100;

export function isValidAdminMenuPrice(price: number): boolean {
  return (
    Number.isFinite(price) && price > 0 && price <= MAX_ADMIN_MENU_PRICE_USD
  );
}

export function getAdminMenuPriceAlertMessage(price: number): string {
  const display = Number.isFinite(price) ? price.toFixed(2) : String(price);
  return `가격을 다시 한번 확인해 주세요. (입력된 금액: $${display})`;
}

export function alertInvalidAdminMenuPrice(price: number): boolean {
  if (isValidAdminMenuPrice(price)) {
    return true;
  }

  window.alert(getAdminMenuPriceAlertMessage(price));
  return false;
}
