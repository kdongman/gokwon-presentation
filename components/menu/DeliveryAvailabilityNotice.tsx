"use client";

import { MapPinOff } from "lucide-react";

type DeliveryAvailabilityNoticeProps = {
  message: string;
  compact?: boolean;
};

export default function DeliveryAvailabilityNotice({
  message,
  compact = false,
}: DeliveryAvailabilityNoticeProps) {
  return (
    <div
      className={`flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <MapPinOff
        className={`shrink-0 text-amber-700 ${compact ? "mt-0.5 h-4 w-4" : "mt-0.5 h-5 w-5"}`}
        aria-hidden
      />
      <p
        className={`font-semibold leading-6 text-amber-950 ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        {message}
      </p>
    </div>
  );
}
