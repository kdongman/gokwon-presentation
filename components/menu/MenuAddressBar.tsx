"use client";

import { MapPin, Search } from "lucide-react";

type MenuAddressBarProps = {
  brandEyebrow: string;
  headerTitle: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export default function MenuAddressBar({
  brandEyebrow,
  headerTitle,
  label,
  placeholder,
  value,
  onChange,
}: MenuAddressBarProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 pb-4 pt-16 backdrop-blur-md">
      <div className="mx-auto max-w-2xl">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">
            {brandEyebrow}
          </p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950">
            {headerTitle}
          </h1>
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <MapPin className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-500">{label}</span>
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              className="mt-0.5 w-full truncate bg-transparent text-sm font-black text-slate-950 outline-none placeholder:font-medium placeholder:text-slate-400"
            />
          </div>
          <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
        </label>
      </div>
    </div>
  );
}
