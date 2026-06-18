export const ADMIN_LOGIN_PATH = "/admin-login";

export function isAdminLoginPath(pathname: string): boolean {
  return pathname === ADMIN_LOGIN_PATH;
}

export function isProtectedAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isSafeAdminNextPath(pathname: string | null | undefined) {
  return Boolean(pathname && isProtectedAdminPath(pathname));
}
