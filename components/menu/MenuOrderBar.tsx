"use client";

import { formatUsd } from "@/lib/gokwon-menu";

type MenuOrderBarProps = {
  itemCount: number;
  totalPrice: number;
  orderLabel: string;
  disabled?: boolean;
  onOrder: () => void;
};

export default function MenuOrderBar({
  itemCount,
  totalPrice,
  orderLabel,
  disabled = false,
  onOrder,
}: MenuOrderBarProps) {
  const canOrder = itemCount > 0 && !disabled;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <p className="min-w-[5.5rem] shrink-0 text-2xl font-black tabular-nums tracking-tight text-slate-950">
          {formatUsd(totalPrice)}
        </p>
        <button
          type="button"
          onClick={onOrder}
          disabled={!canOrder}
          className="flex min-w-0 flex-1 items-center justify-center rounded-xl bg-red-600 px-4 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:bg-slate-300"
        >
          {orderLabel}
        </button>
      </div>
    </div>
  );
}
