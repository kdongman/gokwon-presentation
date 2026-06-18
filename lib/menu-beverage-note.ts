export function removeMenuBeverageNote(text: string): string {
  return text
    .replace(
      /\s*\*?Note:\s*The beverage brand and size \(can or bottle\) may vary based on local store circumstances\.\*?/gi,
      "",
    )
    .trim();
}
