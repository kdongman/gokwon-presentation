"use client";

import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import type { PayPalCheckoutSummary } from "@/components/checkout/PayPalCheckoutForm";
import { formatUsd } from "@/lib/gokwon-menu";

type KofiCheckoutFallbackProps = {
  summary: PayPalCheckoutSummary;
  payDisabled?: boolean;
  onValidate?: () => string | null;
};

type CreateKofiOrderResponse = {
  success?: boolean;
  data?: { orderId?: number };
  error?: string;
};

const KOFI_EMBED_URL =
  "https://ko-fi.com/gokwon/?hidefeed=true&widget=true&embed=true&preview=true";

export default function KofiCheckoutFallback({
  summary,
  payDisabled = false,
  onValidate,
}: KofiCheckoutFallbackProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<number | null>(null);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const amountLabel = useMemo(
    () => formatUsd(summary.totalAmount),
    [summary.totalAmount],
  );

  function validateOrder(): boolean {
    const validationError = onValidate?.();
    if (validationError) {
      setErrorMessage(validationError);
      return false;
    }
    if (payDisabled) {
      setErrorMessage("Complete the required order details before paying.");
      return false;
    }
    setErrorMessage(null);
    return true;
  }

  async function copyAmount() {
    try {
      await navigator.clipboard.writeText(summary.totalAmount.toFixed(2));
      setCopiedAmount(true);
      window.setTimeout(() => setCopiedAmount(false), 1800);
    } catch {
      setErrorMessage("Could not copy the payment amount.");
    }
  }

  async function savePendingOrder() {
    if (!validateOrder()) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/kofi/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...summary.orderMeta,
          totalUsd: summary.totalAmount,
        }),
      });
      const result = (await response.json()) as CreateKofiOrderResponse;

      if (!response.ok || !result.success || !result.data?.orderId) {
        throw new Error(result.error ?? "Failed to save your order.");
      }

      setSavedOrderId(result.data.orderId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save your order.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#ff5e5b]/25 bg-[#fff8f7] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-slate-950">
              Secure payment with Ko-fi
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Save the order first, then pay the exact USD amount below.
            </p>
          </div>
          <span className="shrink-0 text-lg font-black text-[#e94f4c]">
            {amountLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={copyAmount}
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#ff5e5b]/30 bg-white px-3 py-2 text-xs font-bold text-[#d94845] transition hover:bg-[#fff1f0]"
        >
          {copiedAmount ? (
            <Check className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden />
          )}
          {copiedAmount ? "Amount copied" : "Copy payment amount"}
        </button>
      </div>

      {!savedOrderId ? (
        <button
          type="button"
          onClick={savePendingOrder}
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5e5b] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#e94f4c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {isSaving ? "Saving order..." : "Save Order & Continue to Ko-fi"}
        </button>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-bold text-emerald-800">
              Order #{savedOrderId} saved. Use the same email on Ko-fi.
            </p>
            <a
              href="https://ko-fi.com/gokwon"
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-800 underline underline-offset-2"
            >
              Open
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </div>
          <iframe
            id="kofiframe"
            src={KOFI_EMBED_URL}
            title="GoKwon Ko-fi payment"
            height="712"
            className="w-full bg-[#f9f9f9] p-1"
            allow="payment *"
            loading="eager"
          />
        </div>
      )}

      {errorMessage ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
