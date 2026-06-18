"use client";

import { CreditCard, Handshake, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

const STEPS = [
  { icon: MessageCircle, titleKey: "step1Title", bodyKey: "step1Body" },
  { icon: CreditCard, titleKey: "step2Title", bodyKey: "step2Body" },
  { icon: Handshake, titleKey: "step3Title", bodyKey: "step3Body" },
] as const;

export default function GoKwonHowItWorks() {
  const t = useTranslations("home.delivery");

  return (
    <section className="mx-auto max-w-2xl px-4 py-10">
      <h2 className="text-center text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
        {t("howItWorksTitle")}
      </h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, titleKey, bodyKey }) => (
          <article
            key={titleKey}
            className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-100">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="mt-4 text-sm font-black leading-snug text-slate-950">
              {t(titleKey)}
            </h3>
            <p className="mt-2 text-sm leading-snug text-slate-600">{t(bodyKey)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
