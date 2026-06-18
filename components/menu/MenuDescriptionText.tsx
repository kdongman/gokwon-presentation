"use client";

import { removeMenuBeverageNote } from "@/lib/menu-beverage-note";

type MenuDescriptionTextProps = {
  text: string;
  className?: string;
};

export default function MenuDescriptionText({
  text,
  className = "mt-2 text-sm leading-6 text-slate-600",
}: MenuDescriptionTextProps) {
  return <p className={className}>{removeMenuBeverageNote(text)}</p>;
}
