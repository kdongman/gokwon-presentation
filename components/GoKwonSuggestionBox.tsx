"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function GoKwonSuggestionBox() {
  const t = useTranslations("home.suggestions");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setToast(null);

    const normalizedContent = content.trim();
    const normalizedContact = contact.trim();

    if (!normalizedContent) {
      setError(t("contentRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("suggestions").insert({
        content: normalizedContent,
        contact: normalizedContact || null,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setContent("");
      setContact("");
      setToast(t("success"));
      window.setTimeout(() => setToast(null), 3200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {toast && (
        <div
          className="fixed left-1/2 top-14 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {t("description")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={5}
            className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder={t("contentPlaceholder")}
          />
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder={t("contactPlaceholder")}
          />
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>
        </form>
      </section>
    </>
  );
}
