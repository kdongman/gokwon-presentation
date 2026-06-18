"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

import { formatUsd } from "@/lib/gokwon-menu";

export type CheckoutOrderItem = {
  key: string;
  name: string;
  optionLabel?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type CheckoutOrderItemsProps = {
  items: CheckoutOrderItem[];
  quantityLabel: string;
  decreaseQuantityLabel: string;
  increaseQuantityLabel: string;
  removeItemLabel: string;
  onQuantityChange: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
};

export default function CheckoutOrderItems({
  items,
  quantityLabel,
  decreaseQuantityLabel,
  increaseQuantityLabel,
  removeItemLabel,
  onQuantityChange,
  onRemove,
}: CheckoutOrderItemsProps) {
  return (
    <ul className="mt-3 space-y-3">
      {items.map((item, index) => (
        <li
          key={item.key}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Item {index + 1}
              </p>
              <p className="mt-1 text-sm font-black leading-snug text-slate-950">
                {item.name}
              </p>
              {item.optionLabel ? (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.optionLabel}
                </p>
              ) : null}
              <p className="mt-2 text-xs font-semibold text-slate-500">
                {formatUsd(item.unitPrice)} each
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.key)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-red-100 bg-white text-red-600 transition hover:border-red-200 hover:bg-red-50"
              aria-label={removeItemLabel}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-slate-600">
              {quantityLabel}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onQuantityChange(item.key, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={decreaseQuantityLabel}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-lg font-black tabular-nums text-slate-950">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(item.key, item.quantity + 1)}
                disabled={item.quantity >= 99}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={increaseQuantityLabel}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              Line total
            </span>
            <span className="text-base font-black tabular-nums text-red-600">
              {formatUsd(item.lineTotal)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
