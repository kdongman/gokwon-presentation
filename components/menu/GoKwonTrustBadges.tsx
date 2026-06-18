"use client";

import { Globe2, MapPinned, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

const BADGES = [
  {
    icon: ShieldCheck,
    titleKey: "trustZeroFrictionTitle",
    bodyKey: "trustZeroFrictionBody",
    emoji: "🔒",
  },
  {
    icon: MapPinned,
    titleKey: "trustDeliveryTitle",
    bodyKey: "trustDeliveryBody",
    emoji: "📍",
  },
  {
    icon: Globe2,
    titleKey: "trustBilingualTitle",
    bodyKey: "trustBilingualBody",
    emoji: "💬",
  },
] as const;

export default function GoKwonTrustBadges() {
  const t = useTranslations("home.delivery");

  return (
    <section className="mx-auto max-w-2xl px-4 pb-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {BADGES.map(({ icon: Icon, titleKey, bodyKey, emoji }) => (
          <article
            key={titleKey}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden>
                {emoji}
              </span>
              <Icon className="h-4 w-4 text-red-500" aria-hidden />
            </div>
            <h3 className="mt-3 text-sm font-black text-slate-950">
              {t(titleKey)}
            </h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600">
              {t(bodyKey)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
