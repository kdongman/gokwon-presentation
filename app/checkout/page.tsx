"use client";

import { ArrowLeft, Mail, MessageSquareText, Tag } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import CheckoutOrderItems, {
  type CheckoutOrderItem,
} from "@/components/checkout/CheckoutOrderItems";
import DeliveryAddressFields from "@/components/checkout/DeliveryAddressFields";
import PaymentCheckout from "@/components/checkout/PaymentCheckout";
import type { PayPalCheckoutSummary } from "@/components/checkout/PayPalCheckoutForm";
import {
  isOpenForLiveDeliveryKst,
  LIVE_DELIVERY_HOURS_NOTICE,
} from "@/lib/business-hours";
import {
  clearCartDraft,
  clearOrderDraft,
  formatUsd as formatMenuUsd,
  getGokwonMenuItem,
  getOrderItemOptionLabel,
  readCartDraft,
  readOrderDraft,
  removeCartDraftItem,
  saveCartDraft,
  saveOrderDraft,
  updateCartDraftItemQuantity,
  updateOrderDraftQuantity,
  type GokwonCartDraft,
  type GokwonOrderDraft,
} from "@/lib/gokwon-menu";
import {
  getGokwonProductById,
} from "@/lib/gokwon-catalog";
import { fetchJson } from "@/lib/client-api";
import type { Menu } from "@/lib/menu-data";
import { getLocalizedMenuText } from "@/lib/menu-localization";
import {
  applyPromoDiscount,
  validatePromoCode,
  type AppliedPromo,
} from "@/lib/promo-codes";
import {
  combineDeliveryAddress,
  type DeliveryCoordinates,
} from "@/lib/delivery-address";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORT_EMAIL = "admin@example.com";

function CheckoutContent() {
  const t = useTranslations("concierge");
  const tMenu = useTranslations("home.delivery");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMenuId = searchParams.get("menuId") ?? "";
  const requestedProductId = searchParams.get("productId") ?? "";
  const isCartCheckout = searchParams.get("cart") === "1";
  const catalogProduct = useMemo(
    () =>
      requestedProductId
        ? getGokwonProductById(requestedProductId)
        : undefined,
    [requestedProductId],
  );
  const menuProduct = useMemo(
    () =>
      requestedProductId ? getGokwonMenuItem(requestedProductId) : undefined,
    [requestedProductId],
  );
  const [cartDraft, setCartDraft] = useState<GokwonCartDraft | null>(null);
  const [loadedOrderDraft, setLoadedOrderDraft] =
    useState<GokwonOrderDraft | null>(null);

  useEffect(() => {
    if (isCartCheckout) {
      setCartDraft(readCartDraft());
      setLoadedOrderDraft(null);
      return;
    }

    const draft = readOrderDraft();
    if (draft && draft.itemId === requestedProductId) {
      setLoadedOrderDraft(draft);
    } else {
      setLoadedOrderDraft(null);
    }
    setCartDraft(null);
  }, [isCartCheckout, requestedProductId]);

  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState(requestedMenuId);
  const [foodRequest, setFoodRequest] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [roomDetail, setRoomDetail] = useState("");
  const [deliveryCoordinates, setDeliveryCoordinates] =
    useState<DeliveryCoordinates | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [promoInvalid, setPromoInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLiveDeliveryOpen, setIsLiveDeliveryOpen] = useState(() =>
    isOpenForLiveDeliveryKst(),
  );

  useEffect(() => {
    let isMounted = true;

    async function loadMenus() {
      try {
        const result = await fetchJson<{
          success: boolean;
          data?: Menu[];
          error?: string;
        }>("/api/menus");

        if (!isMounted) {
          return;
        }

        if (!result.ok || !result.data.success || !Array.isArray(result.data.data)) {
          setMenus([]);
          setIsLoading(false);
          return;
        }

        const nextMenus = result.data.data;

        setMenus(nextMenus);

        const firstCartItem = cartDraft?.items[0];
        const itemSlug =
          firstCartItem?.itemId ??
          menuProduct?.id ??
          catalogProduct?.id ??
          "";
        const matchedMenu =
          (firstCartItem?.dbMenuId
            ? nextMenus.find((menu) => menu.id === firstCartItem.dbMenuId)
            : undefined) ??
          nextMenus.find((menu) => menu.slug === itemSlug);

        setSelectedMenuId((current) => {
          if (nextMenus.some((menu) => menu.id === current)) {
            return current;
          }
          if (matchedMenu?.id) {
            return matchedMenu.id;
          }
          if (
            requestedMenuId &&
            nextMenus.some((menu) => menu.id === requestedMenuId)
          ) {
            return requestedMenuId;
          }
          return nextMenus[0]?.id ?? "";
        });
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : "메뉴를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMenus();
    return () => {
      isMounted = false;
    };
  }, [cartDraft, catalogProduct, menuProduct, requestedMenuId]);

  useEffect(() => {
    if (cartDraft) {
      setFoodRequest((current) =>
        current.trim() ? current : cartDraft.formattedSummary,
      );
      if (cartDraft.deliveryAddress) {
        setStreetAddress((current) =>
          current.trim() ? current : cartDraft.deliveryAddress!,
        );
      }
      if (cartDraft.contactEmail) {
        setContactEmail((current) =>
          current.trim() ? current : cartDraft.contactEmail!,
        );
      }
      return;
    }

    if (loadedOrderDraft) {
      setFoodRequest((current) =>
        current.trim() ? current : loadedOrderDraft.formattedSummary,
      );
      if (loadedOrderDraft.deliveryAddress) {
        setStreetAddress((current) =>
          current.trim() ? current : loadedOrderDraft.deliveryAddress!,
        );
      }
      return;
    }

    if (menuProduct) {
      setFoodRequest((current) => {
        if (current.trim()) {
          return current;
        }
        return `${menuProduct.name}\n\n${menuProduct.tagline}`;
      });
      return;
    }

    if (!catalogProduct) {
      return;
    }

    setFoodRequest((current) => {
      if (current.trim()) {
        return current;
      }
      return `${catalogProduct.name}\n\n${catalogProduct.tagline}`;
    });
  }, [cartDraft, catalogProduct, loadedOrderDraft, menuProduct]);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIsLiveDeliveryOpen(isOpenForLiveDeliveryKst()),
      60_000,
    );
    return () => window.clearInterval(timer);
  }, []);

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu.id === selectedMenuId) ?? null,
    [menus, selectedMenuId],
  );
  const paymentMenuId =
    selectedMenu?.id ?? cartDraft?.items[0]?.dbMenuId ?? menus[0]?.id ?? "";
  const displayTitle = cartDraft
    ? tMenu("cartTitle", {
        count: cartDraft.items.reduce((sum, item) => sum + item.quantity, 0),
      })
    : loadedOrderDraft?.itemName ??
      menuProduct?.name ??
      (selectedMenu
        ? getLocalizedMenuText(selectedMenu, locale, "name")
        : null) ??
      t("chooseSet");
  const subtotalUsd =
    cartDraft?.totalPrice ??
    loadedOrderDraft?.totalPrice ??
    menuProduct?.basePrice ??
    selectedMenu?.price ??
    0;
  const finalTotalUsd = applyPromoDiscount(
    subtotalUsd,
    appliedPromo?.discountUsd ?? 0,
  );
  const editableOrderItems = useMemo((): CheckoutOrderItem[] => {
    if (cartDraft) {
      return cartDraft.items.map((item, index) => ({
        key: `cart-${index}`,
        name: item.itemName,
        optionLabel: getOrderItemOptionLabel(item.formattedSummary),
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.totalPrice,
      }));
    }

    if (loadedOrderDraft) {
      return [
        {
          key: "order-0",
          name: loadedOrderDraft.itemName,
          optionLabel: getOrderItemOptionLabel(loadedOrderDraft.formattedSummary),
          unitPrice: loadedOrderDraft.unitPrice,
          quantity: loadedOrderDraft.quantity,
          lineTotal: loadedOrderDraft.totalPrice,
        },
      ];
    }

    return [];
  }, [cartDraft, loadedOrderDraft]);

  const location = useMemo(
    () => combineDeliveryAddress(streetAddress, roomDetail),
    [roomDetail, streetAddress],
  );
  const normalizedEmail = contactEmail.trim().toLowerCase();
  const normalizedLocation = location.trim();
  const normalizedStreet = streetAddress.trim();
  const normalizedRequest = foodRequest.trim();
  const normalizedSpecialRequest = specialRequest.trim();
  const isEmailValid = EMAIL_PATTERN.test(normalizedEmail);
  const isFormInvalid =
    !contactEmail.trim() ||
    !normalizedStreet ||
    !isEmailValid ||
    isLoading;

  const paypalCheckoutSummary = useMemo((): PayPalCheckoutSummary => {
    const items =
      editableOrderItems.length > 0
        ? editableOrderItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        : [
            {
              name: displayTitle,
              quantity: 1,
              unitPrice: finalTotalUsd,
            },
          ];

    return {
      items,
      deliveryAddress: normalizedLocation,
      totalAmount: finalTotalUsd,
      orderMeta: {
        menuId: paymentMenuId,
        locale,
        foodRequest: normalizedRequest || displayTitle,
        specialRequest: normalizedSpecialRequest,
        contactEmail: normalizedEmail,
        location: normalizedLocation,
        coordinates: deliveryCoordinates,
        isPreOrder: !isLiveDeliveryOpen,
      },
    };
  }, [
    displayTitle,
    deliveryCoordinates,
    editableOrderItems,
    finalTotalUsd,
    isLiveDeliveryOpen,
    locale,
    normalizedEmail,
    normalizedLocation,
    normalizedRequest,
    normalizedSpecialRequest,
    paymentMenuId,
  ]);

  const validateCheckoutForm = useCallback((): string | null => {
    if (!contactEmail.trim()) {
      return t("emailInvalid");
    }
    if (!isEmailValid) {
      return t("emailInvalid");
    }
    if (!normalizedStreet) {
      return t("locationRequired");
    }
    if (!normalizedRequest) {
      return t("foodRequired");
    }
    if (!paymentMenuId) {
      return t("menuRequired");
    }
    return null;
  }, [
    contactEmail,
    isEmailValid,
    normalizedRequest,
    normalizedStreet,
    paymentMenuId,
    t,
  ]);

  function syncSelectedMenuFromCart(nextCart: GokwonCartDraft) {
    const firstItem = nextCart.items[0];
    if (!firstItem) {
      return;
    }

    if (
      firstItem.dbMenuId &&
      menus.some((menu) => menu.id === firstItem.dbMenuId)
    ) {
      setSelectedMenuId(firstItem.dbMenuId);
      return;
    }

    const matchedMenu = menus.find((menu) => menu.slug === firstItem.itemId);
    if (matchedMenu) {
      setSelectedMenuId(matchedMenu.id);
    }
  }

  function persistCartDraft(nextCart: GokwonCartDraft) {
    setCartDraft(nextCart);
    saveCartDraft(nextCart);
    setFoodRequest(nextCart.formattedSummary);
    syncSelectedMenuFromCart(nextCart);
  }

  function persistOrderDraft(nextDraft: GokwonOrderDraft) {
    setLoadedOrderDraft(nextDraft);
    saveOrderDraft(nextDraft);
    setFoodRequest(nextDraft.formattedSummary);
  }

  function handleOrderItemQuantityChange(key: string, quantity: number) {
    if (key.startsWith("cart-") && cartDraft) {
      const index = Number.parseInt(key.slice(5), 10);
      if (Number.isNaN(index)) {
        return;
      }

      persistCartDraft(
        updateCartDraftItemQuantity(cartDraft, index, quantity),
      );
      return;
    }

    if (key === "order-0" && loadedOrderDraft) {
      persistOrderDraft(updateOrderDraftQuantity(loadedOrderDraft, quantity));
    }
  }

  function handleOrderItemRemove(key: string) {
    if (key.startsWith("cart-") && cartDraft) {
      const index = Number.parseInt(key.slice(5), 10);
      if (Number.isNaN(index)) {
        return;
      }

      const nextCart = removeCartDraftItem(cartDraft, index);
      if (!nextCart) {
        clearCartDraft();
        router.push("/home/menu");
        return;
      }

      persistCartDraft(nextCart);
      return;
    }

    if (key === "order-0" && loadedOrderDraft) {
      clearOrderDraft();
      router.push("/home/menu");
    }
  }

  function handleApplyPromoCode() {
    const trimmed = promoCodeInput.trim();
    if (!trimmed) {
      setAppliedPromo(null);
      setPromoInvalid(false);
      return;
    }

    const promo = validatePromoCode(trimmed);
    if (promo) {
      setAppliedPromo(promo);
      setPromoInvalid(false);
      return;
    }

    setAppliedPromo(null);
    setPromoInvalid(true);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] pb-12 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pb-4 pt-16">
          <Link
            href="/home/menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white"
            aria-label={t("back")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-red-600">
              GoKwon
            </p>
            <h1 className="truncate text-lg font-black tracking-tight">
              {tMenu("checkoutTitle")}
            </h1>
          </div>
        </div>
      </header>

      <div className="relative z-0 mx-auto max-w-2xl space-y-4 px-4 pb-8 pt-4">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            {t("selectedSet")}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h2 className="text-lg font-black leading-snug text-slate-950">
              {displayTitle}
            </h2>
            <div className="shrink-0 text-right">
              {appliedPromo ? (
                <p className="text-xs font-semibold text-slate-400 line-through">
                  {formatMenuUsd(subtotalUsd)}
                </p>
              ) : null}
              <span className="text-lg font-black text-red-600">
                {formatMenuUsd(finalTotalUsd)}
              </span>
            </div>
          </div>
          {menuProduct ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {menuProduct.tagline}
            </p>
          ) : selectedMenu ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {getLocalizedMenuText(selectedMenu, locale, "tagline")}
            </p>
          ) : null}
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {tMenu("allInclusiveNotice")}
          </p>
        </div>

        {!isLiveDeliveryOpen && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {LIVE_DELIVERY_HOURS_NOTICE}
          </div>
        )}

        <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
          <span className="text-sm font-black text-slate-900">
            {tMenu("orderDetailsLabel")}
          </span>
          {editableOrderItems.length > 0 ? (
            <CheckoutOrderItems
              items={editableOrderItems}
              quantityLabel={tMenu("quantityLabel")}
              decreaseQuantityLabel={tMenu("decreaseQuantity")}
              increaseQuantityLabel={tMenu("increaseQuantity")}
              removeItemLabel={tMenu("removeItem")}
              onQuantityChange={handleOrderItemQuantityChange}
              onRemove={handleOrderItemRemove}
            />
          ) : (
            <label className="mt-3 block">
              <textarea
                value={foodRequest}
                onChange={(event) => setFoodRequest(event.target.value)}
                rows={8}
                maxLength={2000}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                placeholder={t("foodPlaceholder")}
              />
            </label>
          )}
        </section>

        <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
          <label htmlFor="checkout-special-request" className="block">
            <span className="flex items-center gap-2 text-sm font-black text-slate-900">
              <MessageSquareText
                className="h-4 w-4 text-red-600"
                aria-hidden
              />
              {tMenu("specialRequestLabel")}
            </span>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {tMenu("specialRequestHint")}
            </p>
            <textarea
              id="checkout-special-request"
              name="specialRequest"
              value={specialRequest}
              onChange={(event) => setSpecialRequest(event.target.value)}
              rows={4}
              maxLength={1000}
              className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100"
              placeholder={tMenu("specialRequestPlaceholder")}
            />
            <p className="mt-1.5 text-right text-[11px] font-medium tabular-nums text-slate-400">
              {specialRequest.length}/1000
            </p>
          </label>
        </section>

        <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
          <h2 className="text-sm font-black text-slate-900">
            {tMenu("deliveryContactTitle")}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {tMenu("deliveryContactSubtitle")}
          </p>

          <label htmlFor="checkout-contact-email" className="mt-4 block">
            <span className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Mail className="h-4 w-4 text-red-600" aria-hidden />
              {t("emailLabel")}
            </span>
            <input
              id="checkout-contact-email"
              name="email"
              value={contactEmail}
              onChange={(event) => setContactEmail(event.target.value)}
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="you@example.com"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {t("emailHint")}
            </p>
          </label>

          <DeliveryAddressFields
            streetAddress={streetAddress}
            roomDetail={roomDetail}
            onStreetAddressChange={setStreetAddress}
            onRoomDetailChange={setRoomDetail}
            onCoordinatesChange={setDeliveryCoordinates}
            streetLabel={tMenu("deliveryTo")}
            streetPlaceholder={tMenu("deliveryToPlaceholder")}
            roomLabel={tMenu("roomDetailLabel")}
            roomPlaceholder={tMenu("roomDetailPlaceholder")}
            useCurrentLocationLabel={tMenu("useCurrentLocation")}
            locatingLabel={tMenu("locatingCurrentLocation")}
            locationErrorLabel={tMenu("locationLookupFailed")}
            mapsUnavailableLabel={tMenu("mapsUnavailableHint")}
            addressSearchLoadingLabel={tMenu("addressSearchLoading")}
            searchHintLabel={tMenu("addressSearchHint")}
            locationSelectedLabel={tMenu("locationSelected")}
            markerTitleLabel={tMenu("markerTitle")}
            updatingAddressLabel={tMenu("updatingAddress")}
            dragPinHintLabel={tMenu("dragPinHint")}
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">{t("locationHint")}</p>

          <label className="mt-4 block">
            <span className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Tag className="h-4 w-4 text-red-600" aria-hidden />
              {tMenu("promoCodeLabel")}
            </span>
            <div className="mt-2 flex gap-2">
              <input
                value={promoCodeInput}
                onChange={(event) => {
                  setPromoCodeInput(event.target.value);
                  if (promoInvalid) {
                    setPromoInvalid(false);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleApplyPromoCode();
                  }
                }}
                type="text"
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
                placeholder={tMenu("promoCodePlaceholder")}
              />
              <button
                type="button"
                onClick={handleApplyPromoCode}
                className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                {tMenu("promoApply")}
              </button>
            </div>
            {appliedPromo ? (
              <p className="mt-2 text-xs font-semibold leading-5 text-emerald-700">
                {tMenu("promoApplied", {
                  code: appliedPromo.code,
                  amount: formatMenuUsd(appliedPromo.discountUsd),
                })}
              </p>
            ) : promoInvalid ? (
              <p className="mt-2 text-xs font-medium leading-5 text-red-600">
                {tMenu("promoInvalid")}
              </p>
            ) : null}
          </label>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <PaymentCheckout
              summary={paypalCheckoutSummary}
              payDisabled={isFormInvalid || !paymentMenuId}
              onValidate={validateCheckoutForm}
              onPaymentSuccess={({ orderId }) => {
                clearCartDraft();
                clearOrderDraft();
                router.push(`/order/success?orderId=${orderId}`);
              }}
            />
            <p className="mt-3 text-center text-xs leading-5 text-slate-500">
              {tMenu("refundPolicyLine")}
            </p>
            <p className="mt-2 text-center text-xs font-medium leading-5 text-slate-600">
              {tMenu("refundContactPrefix")}{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-bold text-red-600 underline decoration-red-300 underline-offset-2 transition hover:text-red-700"
              >
                {SUPPORT_EMAIL}
              </a>
              {tMenu("refundContactSuffix")}
            </p>
          </div>
        </section>

        {errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </p>
        ) : null}

      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f7f5]" />}>
      <CheckoutContent />
    </Suspense>
  );
}
