"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import {
  localeLabels,
  locales,
  type AppLocale,
} from "@/i18n/routing";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("language");
  const [isPending, startTransition] = useTransition();

  function handleSelect(nextLocale: AppLocale) {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="inline-flex items-center whitespace-nowrap rounded-full border border-slate-200 bg-white p-0.5 shadow-sm"
    >
      {locales.map((optionLocale) => {
        const selected = optionLocale === locale;

        return (
          <button
            key={optionLocale}
            type="button"
            onClick={() => handleSelect(optionLocale)}
            disabled={isPending}
            aria-pressed={selected}
            className={`rounded-full px-2 py-1.5 text-[10px] font-bold leading-none transition sm:px-3 sm:py-2 sm:text-xs ${
              selected
                ? "bg-red-50 text-red-600 shadow-sm ring-1 ring-inset ring-red-100"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            } disabled:cursor-wait disabled:opacity-60`}
          >
            {localeLabels[optionLocale]}
          </button>
        );
      })}
    </div>
  );
}
