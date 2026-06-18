"use client";

import { BadgeCheck, Check, Minus, Plus } from "lucide-react";
import { useMemo } from "react";

import MenuOptionGroup from "@/components/menu/MenuOptionGroup";
import { resolveGokwonItemDisplay } from "@/lib/gokwon-bilingual-menu";
import type { MenuPageLanguage } from "@/lib/gokwon-bilingual-menu";
import {
  estimateItemTotal,
  formatUsd,
  type GokwonMenuItem,
} from "@/lib/gokwon-menu";

type MenuProductCardProps = {
  item: GokwonMenuItem;
  language: MenuPageLanguage;
  selections: Record<string, string | string[]>;
  quantity: number;
  inCart: boolean;
  localPickBadge: string;
  addLabel: string;
  addedLabel: string;
  itemTotalLabel: string;
  quantityLabel: string;
  onSelectionsChange: (
    itemId: string,
    selections: Record<string, string | string[]>,
  ) => void;
  onToggleCart: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
};

export default function MenuProductCard({
  item,
  language,
  selections,
  quantity,
  inCart,
  localPickBadge,
  addLabel,
  addedLabel,
  itemTotalLabel,
  quantityLabel,
  onSelectionsChange,
  onToggleCart,
  onQuantityChange,
}: MenuProductCardProps) {
  const display = useMemo(
    () => resolveGokwonItemDisplay(item, language),
    [item, language],
  );
  const estimatedTotal = useMemo(
    () => estimateItemTotal(item, selections, inCart ? quantity : 1),
    [inCart, item, quantity, selections],
  );

  function handleSelectionChange(groupId: string, value: string | string[]) {
    onSelectionsChange(item.id, { ...selections, [groupId]: value });
  }

  function adjustQuantity(delta: number) {
    onQuantityChange(item.id, quantity + delta);
  }

  return (
    <article
      className={`rounded-2xl bg-white shadow-sm ring-1 transition ${
        inCart ? "ring-2 ring-red-300" : "ring-slate-100"
      }`}
    >
      <div className="overflow-hidden rounded-t-2xl">
        <div
          className="relative h-52 bg-cover bg-slate-100 sm:h-56"
          style={{
            backgroundImage: `url('${item.imageUrl ?? "/images/gokwon-kfood-hero.png"}')`,
            backgroundPosition: item.imagePosition,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
              <BadgeCheck className="h-3 w-3" aria-hidden />
              {localPickBadge}
            </span>
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-black text-slate-900 shadow-sm">
              {item.emoji} {item.mealType}
            </span>
          </div>
          <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1.5 text-sm font-black text-slate-950 shadow-sm">
            {formatUsd(item.basePrice)}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-4">
        <div>
          <h2 className="text-xl font-black leading-snug tracking-tight text-slate-950">
            {item.emoji} {display.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{display.tagline}</p>
          {item.tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {item.optionGroups.length > 0 ? (
          <div className="space-y-5 border-t border-slate-100 pt-5">
            {item.optionGroups.map((group) => (
              <MenuOptionGroup
                key={group.id}
                group={group}
                value={
                  selections[group.id] ?? (group.type === "checkbox" ? [] : "")
                }
                onChange={handleSelectionChange}
              />
            ))}
          </div>
        ) : null}

        {inCart ? (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-sm font-bold text-slate-600">
              {quantityLabel}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => adjustQuantity(-1)}
                disabled={quantity <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-lg font-black tabular-nums text-slate-950">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => adjustQuantity(1)}
                disabled={quantity >= 99}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-sm font-bold text-slate-600">{itemTotalLabel}</span>
          <span className="text-lg font-black tabular-nums text-slate-950">
            {formatUsd(estimatedTotal)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onToggleCart(item.id)}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${
            inCart
              ? "bg-red-50 text-red-700 ring-2 ring-red-500"
              : "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          {inCart ? (
            <>
              <Check className="h-4 w-4" aria-hidden />
              {addedLabel}
            </>
          ) : (
            addLabel
          )}
        </button>
      </div>
    </article>
  );
}
