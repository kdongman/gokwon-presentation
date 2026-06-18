"use client";

import {
  GOKWON_BILINGUAL_CATEGORIES,
  type BilingualMenuCategory,
} from "@/lib/gokwon-bilingual-menu";

type CategoryFilterBarProps = {
  activeCategory: BilingualMenuCategory;
  onChange: (category: BilingualMenuCategory) => void;
};

export default function CategoryFilterBar({
  activeCategory,
  onChange,
}: CategoryFilterBarProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-2 pt-4">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GOKWON_BILINGUAL_CATEGORIES.map(({ id, label, emoji }) => {
          const active = activeCategory === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-black transition ${
                active
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {id === "all" ? label : `${emoji} ${label}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
