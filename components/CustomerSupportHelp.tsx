"use client";

import { Mail, MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  getCustomerSupportChannels,
  type CustomerSupportChannel,
} from "@/lib/customer-support";

function channelLabel(
  channel: CustomerSupportChannel,
  t: ReturnType<typeof useTranslations<"common">>,
): string {
  switch (channel.id) {
    case "whatsapp":
      return t("helpWhatsApp");
    case "kakao":
      return t("helpKakao");
    case "email":
      return t("helpEmail");
    default:
      return t("helpLabel");
  }
}

function channelIcon(channel: CustomerSupportChannel) {
  switch (channel.id) {
    case "whatsapp":
      return <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />;
    case "kakao":
      return (
        <span className="text-sm leading-none" aria-hidden>
          💬
        </span>
      );
    case "email":
      return <Mail className="h-4 w-4 shrink-0 text-violet-600" aria-hidden />;
    default:
      return null;
  }
}

export default function CustomerSupportHelp() {
  const t = useTranslations("common");
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const channels = getCustomerSupportChannels();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const supportDialog =
    isOpen ? (
      <div
        className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16 backdrop-blur-[2px] sm:items-center sm:pb-8"
        role="presentation"
        onClick={() => setIsOpen(false)}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-support-title"
          className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-5 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-600">
                GoKwon CS
              </p>
              <h2
                id="customer-support-title"
                className="mt-1 text-base font-extrabold text-slate-900"
              >
                {t("helpTitle")}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {t("helpSubtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              aria-label={t("helpClose")}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {channels.map((channel) => (
              <li key={channel.id}>
                <a
                  href={channel.href}
                  target={channel.external ? "_blank" : undefined}
                  rel={channel.external ? "noopener noreferrer" : undefined}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-violet-200 hover:bg-violet-50"
                >
                  {channelIcon(channel)}
                  {channelLabel(channel, t)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span aria-hidden>💬</span>
        {t("helpLabel")}
      </button>

      {isMounted && supportDialog
        ? createPortal(supportDialog, document.body)
        : null}
    </>
  );
}
