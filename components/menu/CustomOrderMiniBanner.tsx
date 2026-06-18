"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export default function CustomOrderMiniBanner() {
  const t = useTranslations("home.delivery");

  return (
    <Link
      href="/custom-order"
      className="group my-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition-colors duration-200 hover:border-red-200 hover:bg-white"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug text-slate-900">
          {t("customOrderMiniBannerTitle")}
        </p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
          {t("customOrderMiniBannerSubtitle")}
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-red-600 px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-sm transition-colors duration-200 group-hover:bg-red-700">
        {t("customOrderMiniBannerButton")}
      </span>
    </Link>
  );
}
