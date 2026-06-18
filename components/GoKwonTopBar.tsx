"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import CustomerSupportHelp from "@/components/CustomerSupportHelp";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Link } from "@/i18n/navigation";

type GoKwonTopBarProps = {
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
};

export default function GoKwonTopBar({
  showBack = false,
  backHref = "/home",
  backLabel,
}: GoKwonTopBarProps) {
  const tCommon = useTranslations("common");

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        {showBack ? (
          <Link
            href={backHref}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-red-200 hover:text-red-600"
            aria-label={backLabel ?? tCommon("goBack")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
        <span className="truncate text-sm font-black uppercase tracking-[0.14em] text-red-600">
          {tCommon("appName")}
        </span>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <CustomerSupportHelp />
        <LanguageSwitcher />
      </div>
    </div>
  );
}
