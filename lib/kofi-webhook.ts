export type KofiWebhookPayload = {
  verification_token?: string;
  message_id?: string;
  timestamp?: string;
  type?: string;
  is_public?: boolean;
  from_name?: string;
  message?: string | null;
  amount?: string;
  url?: string;
  email?: string;
  currency?: string;
  is_subscription_payment?: boolean;
  is_first_subscription_payment?: boolean;
  kofi_transaction_id?: string;
};

const DONATION_TYPES = new Set(["Donation", "Subscription"]);

export function parseKofiWebhookPayload(rawBody: string): KofiWebhookPayload | null {
  const trimmed = rawBody.trim();
  if (!trimmed) {
    return null;
  }

  try {
    if (trimmed.startsWith("{")) {
      const parsed = JSON.parse(trimmed) as
        | KofiWebhookPayload
        | { data?: string | KofiWebhookPayload };

      if (
        "data" in parsed &&
        typeof parsed.data === "string" &&
        parsed.data.trim()
      ) {
        return JSON.parse(parsed.data) as KofiWebhookPayload;
      }

      if (
        "data" in parsed &&
        parsed.data &&
        typeof parsed.data === "object"
      ) {
        return parsed.data;
      }

      return parsed as KofiWebhookPayload;
    }

    const params = new URLSearchParams(trimmed);
    const encoded = params.get("data");
    if (!encoded) {
      return null;
    }

    return JSON.parse(encoded) as KofiWebhookPayload;
  } catch {
    return null;
  }
}

export function isKofiDonationEvent(payload: KofiWebhookPayload): boolean {
  return DONATION_TYPES.has(payload.type ?? "");
}

export function parseKofiAmountUsd(amount: string | undefined): number | null {
  if (!amount) {
    return null;
  }

  const parsed = Number.parseFloat(amount);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

export function toStoredUsdCents(amountUsd: number): number {
  return Math.max(0, Math.round(amountUsd * 100));
}

export function extractOrderIdFromMessage(message: string | null | undefined): string | null {
  if (!message) {
    return null;
  }

  const match = message.match(/(?:order\s*#?\s*|#)(\d{1,12})/i);
  return match?.[1] ?? null;
}
