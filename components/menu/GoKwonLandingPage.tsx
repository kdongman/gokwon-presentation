"use client";

import { CreditCard, Handshake, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import GoKwonTopBar from "@/components/GoKwonTopBar";
import { Link } from "@/i18n/navigation";

const STEPS = [
  { icon: MessageCircle, titleKey: "step1Title", bodyKey: "step1Body" },
  { icon: CreditCard, titleKey: "step2Title", bodyKey: "step2Body" },
  { icon: Handshake, titleKey: "step3Title", bodyKey: "step3Body" },
] as const;

export default function GoKwonLandingPage() {
  const t = useTranslations("home.delivery");

  return (
    <main className="flex min-h-[100dvh] flex-col bg-[#f7f7f5] text-slate-950">
      <div className="shrink-0 border-b border-slate-200 bg-[#f7f7f5] px-4 py-3">
        <div className="mx-auto max-w-2xl lg:max-w-5xl">
          <GoKwonTopBar />
        </div>
      </div>

      <section className="relative min-h-[220px] shrink-0 overflow-hidden text-white sm:min-h-[260px] lg:min-h-[300px]">
        <div
          className="absolute inset-0 bg-[url('/images/gokwon-kfood-hero.png')] bg-cover bg-[right_center]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-black/40" aria-hidden />

        <div className="relative mx-auto flex h-full w-full max-w-2xl items-center px-4 py-8 sm:max-w-3xl sm:py-10 lg:max-w-5xl lg:py-12">
          <div className="max-w-[21rem] text-left sm:max-w-lg lg:max-w-xl">
            <h1 className="text-[1.95rem] font-black leading-[1.1] tracking-[-0.03em] text-white sm:text-[2.15rem] lg:text-[2.75rem] lg:leading-[1.06] [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
              {t.rich("heroHeading", {
                river: (chunks) => (
                  <span className="text-amber-300">{chunks}</span>
                ),
              })}
            </h1>
            <p className="mt-3 max-w-[19rem] text-[0.92rem] font-semibold leading-snug tracking-[0.005em] text-white/95 sm:max-w-md sm:text-base lg:text-[1.05rem] [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
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
                  <span className="font-extrabold text-amber-300">
                    {chunks}
                  </span>
                ),
                br: () => <br />,
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-3 lg:max-w-5xl">
        <h2 className="text-center text-base font-black tracking-tight sm:text-lg">
          {t("howItWorksTitle")}
        </h2>

        <div className="mt-2 grid flex-1 gap-2 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, titleKey, bodyKey }) => (
            <article
              key={titleKey}
              className="flex flex-col rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </div>
              <h3 className="mt-2 text-[13px] font-black leading-tight tracking-tight text-slate-950">
                {t(titleKey)}
              </h3>
              <p className="mt-1 text-[11px] leading-snug tracking-tight text-slate-600 sm:text-xs">
                {t(bodyKey)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="mx-auto max-w-2xl lg:max-w-5xl">
          <Link
            href="/home/menu"
            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-5 py-4 text-base font-black text-white shadow-lg shadow-orange-500/25 transition-all duration-200 hover:scale-105 hover:from-orange-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/30 active:scale-[0.98]"
          >
            {t("browseMenuButton")}
          </Link>
          <p className="mt-2 text-center text-xs font-medium text-slate-500">
            {t("browseMenuHint")}
          </p>
        </div>
      </div>
    </main>
  );
}
