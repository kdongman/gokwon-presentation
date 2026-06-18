"use client";

import PayPalCheckoutForm, {
  type PayPalCheckoutSummary,
  type PayPalPaymentSuccessResult,
} from "@/components/checkout/PayPalCheckoutForm";

type PaymentCheckoutProps = {
  summary: PayPalCheckoutSummary;
  payDisabled?: boolean;
  onValidate?: () => string | null;
  onPaymentSuccess?: (result: PayPalPaymentSuccessResult) => void;
  onPaymentError?: (message: string) => void;
};

export default function PaymentCheckout(props: PaymentCheckoutProps) {
  return <PayPalCheckoutForm {...props} />;
}
