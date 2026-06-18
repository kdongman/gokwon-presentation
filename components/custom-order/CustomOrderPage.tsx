"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Mail,
  X,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import DeliveryAddressFields from "@/components/checkout/DeliveryAddressFields";
import { Link } from "@/i18n/navigation";
import {
  combineDeliveryAddress,
  type DeliveryCoordinates,
} from "@/lib/delivery-address";

type SubmitStatus = "idle" | "loading" | "error";

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read the selected image."));
    };
    reader.onerror = () =>
      reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 disabled:bg-slate-50";

export default function CustomOrderPage() {
  const t = useTranslations("home.delivery");
  const [craving, setCraving] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [roomDetail, setRoomDetail] = useState("");
  const [deliveryCoordinates, setDeliveryCoordinates] =
    useState<DeliveryCoordinates | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deliveryAddress = combineDeliveryAddress(streetAddress, roomDetail);
  const isSubmitting = status === "loading";

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!showSuccessModal) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowSuccessModal(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showSuccessModal]);

  function clearImage() {
    setImageFile(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function resetForm() {
    setCraving("");
    setCustomerEmail("");
    setStreetAddress("");
    setRoomDetail("");
    setDeliveryCoordinates(null);
    clearImage();
    setStatus("idle");
    setErrorMessage(null);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      clearImage();
      return;
    }

    if (!file.type.startsWith("image/")) {
      clearImage();
      setStatus("error");
      setErrorMessage(t("customOrderImageInvalid"));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      clearImage();
      setStatus("error");
      setErrorMessage(t("customOrderImageTooLarge"));
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus("idle");
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!craving.trim()) {
      setStatus("error");
      setErrorMessage(t("customOrderFoodNameRequired"));
      return;
    }

    if (!customerEmail.trim()) {
      setStatus("error");
      setErrorMessage(t("customOrderEmailRequired"));
      return;
    }

    if (!streetAddress.trim()) {
      setStatus("error");
      setErrorMessage(t("customOrderDeliveryAddressRequired"));
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const image = imageFile ? await readFileAsDataUrl(imageFile) : undefined;
      const response = await fetch("/api/custom-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: craving.trim(),
          requests: "",
          customerEmail: customerEmail.trim(),
          deliveryAddress: deliveryAddress.trim(),
          coordinates: deliveryCoordinates,
          image,
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? t("customOrderErrorGeneric"));
      }

      resetForm();
      setShowSuccessModal(true);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : t("customOrderErrorGeneric"),
      );
    }
  }

  return (
    <>
      <main className="min-h-screen bg-[#f7f7f5] pb-12 text-slate-950">
        <div className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#f7f7f5]/95 backdrop-blur-md">
          <div className="relative mx-auto flex h-14 max-w-2xl items-center px-4">
            <Link
              href="/home/menu"
              className="inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              {t("backToMenu")}
            </Link>
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
              GoKwon
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 pt-6">
          <header className="min-w-0">
            <h1 className="max-w-full break-words text-[clamp(1.75rem,8vw,2.25rem)] font-extrabold leading-[1.08] tracking-tight text-slate-900">
              {t("customOrderPageTitle")}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-[0.95rem]">
              {t("customOrderPageSubtitle")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                t("customOrderPillFood"),
                t("customOrderPillErrands"),
                t("customOrderPillQuote"),
              ].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-violet-100 bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-violet-700 shadow-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          </header>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div>
              <label
                htmlFor="custom-order-craving"
                className="text-sm font-black text-slate-900"
              >
                {t("customOrderCravingLabel")}
              </label>
              <textarea
                id="custom-order-craving"
                value={craving}
                onChange={(event) => setCraving(event.target.value)}
                placeholder={t("customOrderCravingPlaceholder")}
                rows={6}
                maxLength={3000}
                disabled={isSubmitting}
                className={`mt-3 resize-y bg-slate-50 leading-6 ${inputClassName}`}
              />

              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  id="custom-order-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="sr-only"
                />
                {!imageFile || !previewUrl ? (
                  <label
                    htmlFor="custom-order-image"
                    className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition-all hover:bg-slate-100"
                  >
                    <ImagePlus
                      className="mx-auto h-7 w-7 text-violet-500"
                      aria-hidden
                    />
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {t("customOrderImageUploadTitle")}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {t("customOrderImageUploadHint")}
                    </p>
                  </label>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <Image
                      src={previewUrl}
                      alt="Selected upload preview"
                      width={72}
                      height={72}
                      unoptimized
                      className="h-[4.5rem] w-[4.5rem] rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {imageFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(imageFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearImage}
                      disabled={isSubmitting}
                      aria-label="Remove uploaded image"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="text-sm font-black text-slate-900">
                {t("customOrderContactSectionTitle")}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {t("customOrderContactSectionHint")}
              </p>

              <label htmlFor="custom-order-email" className="mt-5 block">
                <span className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <Mail className="h-4 w-4 text-violet-600" aria-hidden />
                  {t("customOrderEmailLabel")}
                </span>
                <input
                  id="custom-order-email"
                  name="email"
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  placeholder={t("customOrderEmailPlaceholder")}
                  maxLength={320}
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={isSubmitting}
                  className={`mt-2 ${inputClassName}`}
                />
              </label>

              <DeliveryAddressFields
                streetAddress={streetAddress}
                roomDetail={roomDetail}
                onStreetAddressChange={setStreetAddress}
                onRoomDetailChange={setRoomDetail}
                onCoordinatesChange={setDeliveryCoordinates}
                streetLabel={t("deliveryTo")}
                streetPlaceholder={t("deliveryToPlaceholder")}
                roomLabel={t("roomDetailLabel")}
                roomPlaceholder={t("roomDetailPlaceholder")}
                useCurrentLocationLabel={t("useCurrentLocation")}
                locatingLabel={t("locatingCurrentLocation")}
                locationErrorLabel={t("locationLookupFailed")}
                mapsUnavailableLabel={t("mapsUnavailableHint")}
                addressSearchLoadingLabel={t("addressSearchLoading")}
                searchHintLabel={t("addressSearchHint")}
                locationSelectedLabel={t("locationSelected")}
                markerTitleLabel={t("markerTitle")}
                updatingAddressLabel={t("updatingAddress")}
                dragPinHintLabel={t("dragPinHint")}
              />
            </div>

            {status === "error" && errorMessage ? (
              <p
                className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-4 text-base font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:scale-[1.02] hover:from-orange-600 hover:to-red-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    {t("customOrderSending")}
                  </>
                ) : (
                  t("customOrderPageSubmitButton")
                )}
              </button>
              <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                {t("customOrderPageSubmitHint")}
              </p>
            </div>
          </form>
        </div>
      </main>

      {showSuccessModal ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-order-success-title"
            className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                <CheckCircle2 className="h-8 w-8" aria-hidden />
              </span>
              <h3
                id="custom-order-success-title"
                className="mt-4 text-lg font-extrabold text-slate-900"
              >
                {t("customOrderSuccessModalTitle")}
              </h3>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                {t("customOrderSuccessModalMessage")}
              </p>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                {t("customOrderSuccessModalClose")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
