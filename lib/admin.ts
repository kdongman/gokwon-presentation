export function isAdminEmail(email: string | undefined | null): boolean {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!normalizedEmail || !normalizedAdminEmail) {
    return false;
  }

  return normalizedEmail === normalizedAdminEmail;
}
