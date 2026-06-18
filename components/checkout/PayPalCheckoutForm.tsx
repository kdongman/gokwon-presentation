"use client";

import {
  FUNDING,
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  ChevronDown,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";

import { formatUsd } from "@/lib/gokwon-menu";
import type { DeliveryCoordinates } from "@/lib/delivery-address";

export type PayPalCheckoutLineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type PayPalCheckoutOrderMeta = {
  menuId: string;
  locale?: string;
  foodRequest: string;
  specialRequest?: string;
  contactEmail: string;
  location: string;
  coordinates?: DeliveryCoordinates | null;
  spiciness?: string | null;
  isPreOrder?: boolean;
};

export type PayPalCheckoutSummary = {
  items: PayPalCheckoutLineItem[];
  deliveryAddress: string;
  totalAmount: number;
  orderMeta: PayPalCheckoutOrderMeta;
};

export type PayPalPaymentSuccessResult = {
  paypalOrderId: string;
  captureId?: string;
  orderId: number;
};

type PayPalCheckoutFormProps = {
  summary: PayPalCheckoutSummary;
  payDisabled?: boolean;
  onValidate?: () => string | null;
  onPaymentSuccess?: (result: PayPalPaymentSuccessResult) => void;
  onPaymentError?: (message: string) => void;
};

type CreateOrderResponse = {
  success?: boolean;
  data?: {
    orderId?: string;
    internalOrderId?: number;
    approvalUrl?: string;
  };
  error?: string;
};

type CaptureOrderResponse = {
  success?: boolean;
  data?: {
    orderId?: number;
    paypalOrderId?: string;
    captureId?: string;
  };
  error?: string;
};

type PaymentMethod = "apple_pay" | "google_pay" | "card" | "paypal";

type PayPalWalletNamespace = {
  Applepay?: () => {
    config: () => Promise<{
      isEligible: boolean;
      countryCode: string;
      merchantCapabilities: string[];
      supportedNetworks: string[];
    }>;
    validateMerchant: (input: {
      validationUrl: string;
      displayName: string;
    }) => Promise<{ merchantSession: unknown }>;
    confirmOrder: (input: {
      orderId: string;
      token: unknown;
      billingContact?: unknown;
      shippingContact?: unknown;
    }) => Promise<{ status?: string }>;
  };
  Googlepay?: () => {
    config: () => Promise<{
      isEligible: boolean;
      apiVersion: number;
      apiVersionMinor: number;
      allowedPaymentMethods: unknown[];
      merchantInfo: Record<string, unknown>;
    }>;
    confirmOrder: (input: {
      orderId: string;
      paymentMethodData: unknown;
    }) => Promise<{ status?: string }>;
    initiatePayerAction: (input: {
      orderId: string;
    }) => Promise<unknown>;
  };
};

type WalletWindow = Window & {
  gokwonPayPal?: PayPalWalletNamespace;
  ApplePaySession?: {
    new (version: number, request: Record<string, unknown>): {
      onvalidatemerchant: ((event: { validationURL: string }) => void) | null;
      onpaymentauthorized:
        | ((event: {
            payment: {
              token: unknown;
              billingContact?: unknown;
              shippingContact?: unknown;
            };
          }) => void)
        | null;
      oncancel: (() => void) | null;
      begin: () => void;
      abort: () => void;
      completeMerchantValidation: (session: unknown) => void;
      completePayment: (status: number) => void;
    };
    canMakePayments: () => boolean;
    STATUS_SUCCESS: number;
    STATUS_FAILURE: number;
  };
  google?: {
    payments?: {
      api?: {
        PaymentsClient: new (options: Record<string, unknown>) => {
          isReadyToPay: (
            request: Record<string, unknown>,
          ) => Promise<{ result: boolean }>;
          createButton: (options: Record<string, unknown>) => HTMLElement;
          loadPaymentData: (
            request: Record<string, unknown>,
          ) => Promise<unknown>;
        };
      };
    };
  };
};

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ?? "";
const PAYPAL_NAMESPACE = "gokwonPayPal";
const GOOGLE_PAY_ENVIRONMENT =
  process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT?.trim().toLowerCase() ===
  "sandbox"
    ? "TEST"
    : "PRODUCTION";

export default function PayPalCheckoutForm(props: PayPalCheckoutFormProps) {
  const t = useTranslations("checkout");

  if (!PAYPAL_CLIENT_ID) {
    return (
      <p
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        role="alert"
      >
        {t("paypalNotConfigured")}
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
        components:
          "buttons,card-fields,googlepay,applepay,funding-eligibility",
        dataNamespace: PAYPAL_NAMESPACE,
        enableFunding: "card",
        disableFunding: "credit,paylater,venmo",
      }}
    >
      <PayPalCheckoutButtons {...props} />
    </PayPalScriptProvider>
  );
}

function PayPalCheckoutButtons({
  summary,
  payDisabled = false,
  onValidate,
  onPaymentSuccess,
  onPaymentError,
}: PayPalCheckoutFormProps) {
  const t = useTranslations("checkout");
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isMobileCheckout, setIsMobileCheckout] = useState<boolean | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const totalLabel = useMemo(
    () => formatUsd(summary.totalAmount),
    [summary.totalAmount],
  );

  const setPaymentError = useCallback((message: string) => {
    setErrorMessage(message);
    onPaymentError?.(message);
  }, [onPaymentError]);

  const validateBeforePayment = useCallback((): boolean => {
    const validationError = onValidate?.();
    if (validationError) {
      setPaymentError(validationError);
      return false;
    }
    if (payDisabled) {
      setPaymentError(t("paypalCompleteDetails"));
      return false;
    }
    setErrorMessage(null);
    return true;
  }, [onValidate, payDisabled, setPaymentError, t]);

  const createOrder = useCallback(async (): Promise<string> => {
    if (!validateBeforePayment()) {
      throw new Error(t("paypalOrderIncomplete"));
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...summary.orderMeta,
          totalUsd: summary.totalAmount,
        }),
      });
      const result = (await response.json()) as CreateOrderResponse;

      if (!response.ok || !result.success || !result.data?.orderId) {
        throw new Error(
          result.error ?? t("paypalInitFailed"),
        );
      }

      return result.data.orderId;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("paypalInitFailed");
      setPaymentError(message);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [summary, validateBeforePayment, setPaymentError, t]);

  const startRedirectCheckout = useCallback(async (): Promise<void> => {
    if (!validateBeforePayment()) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...summary.orderMeta,
          totalUsd: summary.totalAmount,
          checkoutMode: "redirect",
        }),
      });
      const result = (await response.json()) as CreateOrderResponse;

      if (
        !response.ok ||
        !result.success ||
        !result.data?.orderId ||
        !result.data.approvalUrl
      ) {
        throw new Error(
          result.error ?? t("paypalOpenFailed"),
        );
      }

      window.location.assign(result.data.approvalUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("paypalOpenFailed");
      setPaymentError(message);
      setIsProcessing(false);
    }
  }, [summary, validateBeforePayment, setPaymentError, t]);

  useEffect(() => {
    const mobileUserAgent =
      /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    const mobileViewport = window.matchMedia("(max-width: 767px)").matches;
    setIsMobileCheckout(mobileUserAgent || mobileViewport);
  }, []);

  const captureOrder = useCallback(async (
    paypalOrderId: string,
    paymentMethod: PaymentMethod,
  ): Promise<boolean> => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(paypalOrderId)}/capture`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethod }),
        },
      );
      const result = (await response.json()) as CaptureOrderResponse;

      if (!response.ok || !result.success || !result.data?.orderId) {
        throw new Error(
          result.error ??
            t("paypalCaptureFailed"),
        );
      }

      onPaymentSuccess?.({
        paypalOrderId,
        captureId: result.data.captureId,
        orderId: result.data.orderId,
      });
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("paypalCompleteFailed");
      setPaymentError(message);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [onPaymentSuccess, setPaymentError, t]);

  if (isPending) {
    return (
      <div className="flex min-h-24 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {t("paypalLoading")}
      </div>
    );
  }

  if (isRejected) {
    return (
      <p
        className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        role="alert"
      >
        {t("paypalLoadFailed")}
      </p>
    );
  }

  const sharedButtonProps = {
    disabled: payDisabled || isProcessing,
    forceReRender: [
      summary.totalAmount,
      summary.orderMeta,
      payDisabled,
    ],
    createOrder,
    onCancel: () => {
      setErrorMessage(t("paymentCancelledNoCharge"));
      setIsProcessing(false);
    },
    onError: (error: Record<string, unknown>) => {
      const message =
        typeof error.message === "string"
          ? error.message
          : t("paypalProcessFailed");
      setPaymentError(message);
      setIsProcessing(false);
    },
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-red-100 bg-gradient-to-b from-red-50/80 to-white p-4 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-black text-slate-950">
              {t("fastCheckoutTitle")}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-slate-600">
              {t("fastCheckoutBody")}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <WalletPaymentButtons
            amount={summary.totalAmount}
            disabled={payDisabled || isProcessing}
            createOrder={createOrder}
            captureOrder={captureOrder}
            onError={setPaymentError}
            onCancel={() => {
              setErrorMessage(t("paymentCancelledNoCharge"));
              setIsProcessing(false);
            }}
          />

          {isMobileCheckout === null ? (
            <div
              className="h-12 animate-pulse rounded-md bg-[#ffc439]/60"
              aria-label={t("loadingPaypal")}
            />
          ) : isMobileCheckout ? (
            <button
              type="button"
              onClick={() => void startRedirectCheckout()}
              disabled={payDisabled || isProcessing}
              className="flex h-12 w-full items-center justify-center rounded-md bg-[#ffc439] px-4 text-[21px] font-black italic tracking-tight text-[#003087] shadow-sm transition hover:bg-[#f2ba36] disabled:cursor-not-allowed disabled:opacity-55"
              aria-label={t("payWithPaypal")}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                "PayPal"
              )}
            </button>
          ) : (
            <PayPalButtons
              {...sharedButtonProps}
              fundingSource={FUNDING.PAYPAL}
              onApprove={async (data) => {
                await captureOrder(data.orderID, "paypal");
              }}
              style={{
                color: "gold",
                layout: "vertical",
                shape: "rect",
                height: 48,
                label: "paypal",
                tagline: false,
              }}
            />
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setIsCardOpen((current) => !current)}
          aria-expanded={isCardOpen}
          aria-controls="paypal-card-checkout"
          className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition hover:bg-slate-50"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <CreditCard className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black text-slate-900">
                {t("payWithCard")}
              </span>
              <span className="block text-xs leading-5 text-slate-500">
                {t("cardDetailsHint")}
              </span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="text-sm font-black text-slate-950">
              {totalLabel}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${
                isCardOpen ? "rotate-180" : ""
              }`}
              aria-hidden
            />
          </span>
        </button>

        {isCardOpen ? (
          <div
            id="paypal-card-checkout"
            className="border-t border-slate-100 bg-slate-50/60 p-4"
          >
            <p className="mb-3 text-xs leading-5 text-slate-500">
              {t("billingAddressNote")}
            </p>
            <div className="min-h-[48px]">
              <PayPalButtons
                {...sharedButtonProps}
                fundingSource={FUNDING.CARD}
                onApprove={async (data) => {
                  await captureOrder(data.orderID, "card");
                }}
                style={{
                  color: "black",
                  layout: "vertical",
                  shape: "rect",
                  height: 48,
                  label: "pay",
                  tagline: false,
                }}
              />
            </div>
          </div>
        ) : null}
      </section>

      {errorMessage ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-semibold leading-5 text-emerald-800">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {t("cardSecurity")}
      </div>
      <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <Lock className="h-3 w-3" aria-hidden />
        {t("guestAvailability")}
      </p>
    </div>
  );
}

type WalletPaymentButtonsProps = {
  amount: number;
  disabled: boolean;
  createOrder: () => Promise<string>;
  captureOrder: (
    paypalOrderId: string,
    paymentMethod: PaymentMethod,
  ) => Promise<boolean>;
  onError: (message: string) => void;
  onCancel: () => void;
};

function loadExternalScript(id: string, src: string): Promise<void> {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing?.dataset.loaded === "true") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = existing ?? document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => {
      script.dataset.loaded = "true";
      resolve();
    }, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error(`Failed to load ${src}`)),
      { once: true },
    );
    if (!existing) {
      document.head.appendChild(script);
    }
  });
}

function WalletPaymentButtons(props: WalletPaymentButtonsProps) {
  return (
    <div className="space-y-3">
      <ApplePayButton {...props} />
      <GooglePayButton {...props} />
    </div>
  );
}

function ApplePayButton({
  amount,
  disabled,
  createOrder,
  captureOrder,
  onError,
  onCancel,
}: WalletPaymentButtonsProps) {
  const t = useTranslations("checkout");
  const [isEligible, setIsEligible] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let active = true;

    void loadExternalScript(
      "gokwon-apple-pay-sdk",
      "https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js",
    )
      .then(async () => {
        const walletWindow = window as WalletWindow;
        if (
          !walletWindow.ApplePaySession?.canMakePayments() ||
          !walletWindow.gokwonPayPal?.Applepay
        ) {
          return;
        }
        const config = await walletWindow.gokwonPayPal.Applepay().config();
        if (active) {
          setIsEligible(Boolean(config.isEligible));
        }
      })
      .catch(() => {
        if (active) setIsEligible(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const beginApplePay = async () => {
    const walletWindow = window as WalletWindow;
    const ApplePaySession = walletWindow.ApplePaySession;
    const applePay = walletWindow.gokwonPayPal?.Applepay?.();
    if (!ApplePaySession || !applePay || disabled || isBusy) return;

    setIsBusy(true);
    try {
      const config = await applePay.config();
      const session = new ApplePaySession(4, {
        countryCode: config.countryCode,
        currencyCode: "USD",
        merchantCapabilities: config.merchantCapabilities,
        supportedNetworks: config.supportedNetworks,
        total: {
          label: "GoKwon",
          amount: amount.toFixed(2),
          type: "final",
        },
      });

      session.onvalidatemerchant = async (event) => {
        try {
          const validation = await applePay.validateMerchant({
            validationUrl: event.validationURL,
            displayName: "GoKwon",
          });
          session.completeMerchantValidation(validation.merchantSession);
        } catch (error) {
          session.abort();
          onError(
            error instanceof Error
              ? error.message
              : "Apple Pay merchant validation failed.",
          );
          setIsBusy(false);
        }
      };
      session.onpaymentauthorized = async (event) => {
        try {
          const orderId = await createOrder();
          const confirmation = await applePay.confirmOrder({
            orderId,
            token: event.payment.token,
            billingContact: event.payment.billingContact,
            shippingContact: event.payment.shippingContact,
          });
          if (confirmation.status !== "APPROVED") {
            throw new Error(
              `Apple Pay confirmation returned ${confirmation.status ?? "an unknown status"}.`,
            );
          }
          const captured = await captureOrder(orderId, "apple_pay");
          session.completePayment(
            captured
              ? ApplePaySession.STATUS_SUCCESS
              : ApplePaySession.STATUS_FAILURE,
          );
        } catch (error) {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          onError(
            error instanceof Error
              ? error.message
              : "Apple Pay could not complete this payment.",
          );
        } finally {
          setIsBusy(false);
        }
      };
      session.oncancel = () => {
        setIsBusy(false);
        onCancel();
      };
      session.begin();
    } catch (error) {
      setIsBusy(false);
      onError(
        error instanceof Error
          ? error.message
          : "Apple Pay is not available for this order.",
      );
    }
  };

  if (!isEligible) return null;

  return createElement("apple-pay-button", {
    buttonstyle: "black",
    type: "pay",
    locale: "en",
    onClick: () => void beginApplePay(),
    "aria-disabled": disabled || isBusy,
    className: `block h-12 w-full ${
      disabled || isBusy
        ? "pointer-events-none opacity-55"
        : "cursor-pointer"
    }`,
    "aria-label": t("payWithApple"),
  });
}

function GooglePayButton({
  amount,
  disabled,
  createOrder,
  captureOrder,
  onError,
  onCancel,
}: WalletPaymentButtonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let button: HTMLElement | null = null;

    void loadExternalScript(
      "gokwon-google-pay-sdk",
      "https://pay.google.com/gp/p/js/pay.js",
    )
      .then(async () => {
        const walletWindow = window as WalletWindow;
        const googlePay = walletWindow.gokwonPayPal?.Googlepay?.();
        const PaymentsClient =
          walletWindow.google?.payments?.api?.PaymentsClient;
        if (!googlePay || !PaymentsClient || !containerRef.current) return;

        const config = await googlePay.config();
        if (!config.isEligible || !active) return;

        const client = new PaymentsClient({
          environment: GOOGLE_PAY_ENVIRONMENT,
          paymentDataCallbacks: {
            onPaymentAuthorized: async (paymentData: unknown) => {
              try {
                const orderId = await createOrder();
                const walletPaymentData = paymentData as {
                  paymentMethodData?: unknown;
                };
                if (!walletPaymentData.paymentMethodData) {
                  throw new Error(
                    "Google Pay did not return payment method data.",
                  );
                }

                const confirmation = await googlePay.confirmOrder({
                  orderId,
                  paymentMethodData: walletPaymentData.paymentMethodData,
                });

                if (confirmation.status === "PAYER_ACTION_REQUIRED") {
                  await googlePay.initiatePayerAction({ orderId });
                } else if (confirmation.status !== "APPROVED") {
                  throw new Error(
                    `Google Pay confirmation returned ${confirmation.status ?? "an unknown status"}.`,
                  );
                }

                const captured = await captureOrder(orderId, "google_pay");
                if (!captured) {
                  throw new Error(
                    "Google Pay was approved but the order could not be completed.",
                  );
                }

                return { transactionState: "SUCCESS" };
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Google Pay could not complete this payment.";
                onError(message);
                return {
                  transactionState: "ERROR",
                  error: {
                    intent: "PAYMENT_AUTHORIZATION",
                    message,
                    reason: "OTHER_ERROR",
                  },
                };
              }
            },
          },
        });
        const ready = await client.isReadyToPay({
          apiVersion: config.apiVersion,
          apiVersionMinor: config.apiVersionMinor,
          allowedPaymentMethods: config.allowedPaymentMethods,
        });
        if (!ready.result || !active || !containerRef.current) return;

        button = client.createButton({
          buttonColor: "black",
          buttonType: "pay",
          buttonSizeMode: "fill",
          allowedPaymentMethods: config.allowedPaymentMethods,
          onClick: async () => {
            if (disabled) return;
            try {
              await client.loadPaymentData({
                apiVersion: config.apiVersion,
                apiVersionMinor: config.apiVersionMinor,
                allowedPaymentMethods: config.allowedPaymentMethods,
                transactionInfo: {
                  currencyCode: "USD",
                  totalPriceStatus: "FINAL",
                  totalPrice: amount.toFixed(2),
                },
                merchantInfo: config.merchantInfo,
                callbackIntents: ["PAYMENT_AUTHORIZATION"],
              });
            } catch (error) {
              const errorCode =
                typeof error === "object" && error !== null && "statusCode" in error
                  ? String(error.statusCode)
                  : "";
              if (errorCode === "CANCELED") {
                onCancel();
                return;
              }
              onError(
                error instanceof Error
                  ? error.message
                  : "Google Pay could not complete this payment.",
              );
            }
          },
        });
        button.style.width = "100%";
        button.style.height = "48px";
        containerRef.current.replaceChildren(button);
      })
      .catch(() => {
        // Eligibility and browser support determine whether the wallet appears.
      });

    return () => {
      active = false;
      button?.remove();
    };
  }, [
    amount,
    disabled,
    createOrder,
    captureOrder,
    onError,
    onCancel,
  ]);

  return <div ref={containerRef} className="min-h-0 w-full" />;
}
