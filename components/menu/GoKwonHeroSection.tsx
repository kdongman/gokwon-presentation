"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function GoKwonHeroSection() {
  const t = useTranslations("home.delivery");

  return (
    <section className="relative min-h-[240px] overflow-hidden text-white sm:min-h-[280px] lg:min-h-[320px]">
      <div
        className="absolute inset-0 bg-[url('/images/gokwon-kfood-hero.png')] bg-cover bg-[right_center]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      <div className="relative mx-auto flex h-full w-full max-w-2xl items-center px-4 pb-12 pt-20 sm:max-w-3xl lg:max-w-5xl">
        <div className="max-w-[19rem] text-left sm:max-w-md lg:max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/95 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("eyebrow")}
          </div>

          <h1 className="mt-5 text-[1.75rem] font-black leading-[1.12] tracking-[-0.03em] text-white sm:text-4xl sm:leading-[1.08] [text-shadow:0_2px_18px_rgba(0,0,0,0.4)]">
            {t.rich("heroHeading", {
              river: (chunks) => (
                <span className="text-amber-300">{chunks}</span>
              ),
            })}
          </h1>

          <p className="mt-3 max-w-[20rem] text-[0.95rem] font-semibold leading-snug tracking-[0.005em] text-white/90 sm:max-w-md sm:text-lg [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
            {t.rich("heroSubheading", {
              lead: (chunks) => (
                <span className="font-extrabold text-white">{chunks}</span>
              ),
              body: (chunks) => <span>{chunks}</span>,
              assistant: (chunks) => (
                <span className="font-semibold text-emerald-200">
                  {chunks}
                </span>
              ),
              river: (chunks) => (
                <span className="font-extrabold text-amber-300">{chunks}</span>
              ),
              br: () => <br />,
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
