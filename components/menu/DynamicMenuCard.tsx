"use client";

import { BadgeCheck } from "lucide-react";

import {
  formatMenuPrice,
  pickLocalizedField,
  type MenuDataItem,
  type MenuLanguage,
} from "@/lib/gokwon-menu-data";
import { removeMenuBeverageNote } from "@/lib/menu-beverage-note";
import { resolveMenuImageUrls } from "@/lib/menu-images";

type DynamicMenuCardProps = {
  item: MenuDataItem;
  language: MenuLanguage;
  inCart: boolean;
  localPickBadge: string;
  onOpen: (itemId: string) => void;
};

export default function DynamicMenuCard({
  item,
  language,
  inCart,
  localPickBadge,
  onOpen,
}: DynamicMenuCardProps) {
  const name = pickLocalizedField(item, "name", language);
  const tagline = removeMenuBeverageNote(
    pickLocalizedField(item, "tagline", language),
  );
  const imageUrl = resolveMenuImageUrls(item.imageUrls ?? item.imageUrl)[0];

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      aria-label={`${name} ${formatMenuPrice(item.price)}`}
      className={`group flex w-full items-center gap-5 rounded-2xl border bg-white p-5 text-left shadow-sm shadow-indigo-950/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(30,27,75,0.08)] active:translate-y-0 active:scale-[0.99] ${
        inCart
          ? "border-red-200 ring-2 ring-red-400"
          : "border-transparent hover:border-gray-100"
      }`}
    >
      <div className="min-w-0 flex-1 self-stretch">
        <h2 className="flex flex-wrap items-baseline gap-x-1.5 text-xl font-extrabold leading-snug tracking-tight text-gray-900">
          {item.emoji ? (
            <span className="shrink-0" aria-hidden>
              {item.emoji}
            </span>
          ) : null}
          <span>{name}</span>
        </h2>

        {tagline ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
            {tagline}
          </p>
        ) : null}

        <p className="mt-3 text-lg font-bold tabular-nums text-gray-950">
          {formatMenuPrice(item.price)}
        </p>

        {item.isLocalPick ? (
          <span className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-green-200/60 bg-green-50 px-2.5 py-0.5 text-xs font-medium leading-5 text-green-700">
            <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="whitespace-normal">{localPickBadge}</span>
          </span>
        ) : null}
      </div>

      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 sm:h-28 sm:w-28">
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          style={{ objectPosition: item.imagePosition ?? "center" }}
        />
      </div>
    </button>
  );
}
