export function formatKoreanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("82") && digits.length >= 12) {
    const national = digits.slice(2);
    return `+82-${national.slice(0, 2)}-${national.slice(2, 6)}-${national.slice(6)}`;
  }

  if (digits.startsWith("010") && digits.length === 11) {
    return `+82-${digits.slice(1, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return phone;
}
