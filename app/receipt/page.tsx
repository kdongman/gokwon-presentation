"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";

import { formatUsdFromStoredCents } from "@/lib/products";

type Order = {
  id: string;
  product_title: string;
  food_selection: string | null;
  product_options: string | null;
  booking_date: string;
  booking_time: string;
  subtotal_krw: number;
  service_fee_krw: number;
  total_krw: number;
  status: string;
  created_at: string;
};

function ReceiptContent() {
  const locale = useLocale();
  const t = useTranslations("receipt");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError(t("orderNotFound"));
      return;
    }

    async function loadOrder() {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        setError(t("loadFailed"));
        return;
      }

      setOrder(result.data as Order);
    }

    void loadOrder();
  }, [orderId, t]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 pt-14">
        <p className="text-slate-600">{error}</p>
        <Link href="/home" className="text-sm font-semibold text-red-600">
          {t("backToHome")}
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-red-600"
          aria-hidden
        />
      </div>
    );
  }

  const bookingDate = new Date(`${order.booking_date}T12:00:00`).toLocaleDateString(
    locale,
    { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-8 pt-14">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center">
          <CheckCircle2
            className="mx-auto h-14 w-14 text-emerald-500"
            aria-hidden
          />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {t("successTitle")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{t("successSub")}</p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("orderNumber", { id: "" })}
            {String(order.id).slice(0, 8)}
          </p>
          <h2 className="mt-2 text-lg font-bold text-slate-900">
            {order.product_title}
          </h2>
          {order.food_selection ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {t("foodSelection")}: {order.food_selection}
            </p>
          ) : null}
          {order.product_options ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              {t("productOptions")}: {order.product_options}
            </p>
          ) : null}
          <p className="mt-3 text-sm text-slate-600">
            {bookingDate} · {order.booking_time}
          </p>
          <div className="mt-4 space-y-2 border-t border-dashed border-slate-200 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{t("subtotal")}</span>
              <span>{formatUsdFromStoredCents(Number(order.subtotal_krw))}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t("serviceFee")}</span>
              <span>{formatUsdFromStoredCents(Number(order.service_fee_krw))}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900">
              <span>{t("totalPaid")}</span>
              <span>{formatUsdFromStoredCents(Number(order.total_krw))}</span>
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase text-emerald-600">
            {t("status", { status: order.status })}
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-950">
          <p>{t("deliveryReassurance")}</p>
        </section>

        <Link
          href="/home"
          className="mt-6 block w-full rounded-2xl bg-red-600 py-4 text-center text-sm font-bold text-white shadow-lg hover:bg-red-700"
        >
          {t("backToHome")}
        </Link>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-red-600"
            aria-hidden
          />
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  );
}
