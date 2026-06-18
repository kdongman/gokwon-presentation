"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import GoKwonTopBar from "@/components/GoKwonTopBar";
import { useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

import CustomOrderMiniBanner from "@/components/menu/CustomOrderMiniBanner";
import DynamicMenuCard from "@/components/menu/DynamicMenuCard";
import GoKwonTrustBadges from "@/components/menu/GoKwonTrustBadges";
import MenuDetailBottomSheet from "@/components/menu/MenuDetailBottomSheet";
import { fetchJson } from "@/lib/client-api";
import type { Menu } from "@/lib/menu-data";
import { saveCartDraft, setActiveMenuItems } from "@/lib/gokwon-menu";
import {
  MENU_CATEGORY_CAPSULES,
  isPublicMenuCategory,
  menusToMenuData,
  pickCategoryLabel,
  type MenuCategory,
  type MenuDataItem,
} from "@/lib/gokwon-menu-data";
import {
  buildOrderPayload,
  calculateOrderTotal,
  createInitialOrderForm,
  menuDataToGokwonItems,
  normalizeOptionQuantityMap,
  orderPayloadToCartDraft,
  type OrderFormState,
} from "@/lib/gokwon-order-form";
import { normalizeOptionId } from "@/lib/menu-option-utils";
import { DEFAULT_DRINK_OPTION_ID } from "@/lib/gokwon-menu-data";

export default function GoKwonMenuPage() {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("home.delivery");
  const categoryLabels = useMemo(
    () => ({
      all: t("categories.all"),
      chicken: t("categories.chicken"),
      tteokbokki: t("categories.tteokbokki"),
      pizza: t("categories.pizza"),
      chinese: t("categories.chinese"),
      jokbal: t("categories.jokbal"),
      dessert: t("categories.dessert"),
    }),
    [t],
  );
  const [menuData, setMenuData] = useState<MenuDataItem[]>([]);
  const [orderForm, setOrderForm] = useState<OrderFormState>(createInitialOrderForm);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const [showLoadFallback, setShowLoadFallback] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function loadMenus() {
      setIsLoadingMenus(true);
      setShowLoadFallback(false);

      const result = await fetchJson<{
        success: boolean;
        data?: Menu[];
        error?: string;
      }>("/api/menus", { signal: controller.signal });

      if (!isMounted || controller.signal.aborted) {
        return;
      }

      if (
        result.ok &&
        result.data.success &&
        Array.isArray(result.data.data)
      ) {
        const mapped = menusToMenuData(result.data.data);
        setMenuData(mapped);
        setActiveMenuItems(menuDataToGokwonItems(mapped));
        setIsLoadingMenus(false);
        return;
      }

      setMenuData([]);
      setActiveMenuItems([]);

      if (!result.ok || !result.data?.success) {
        setShowLoadFallback(true);
      }

      setIsLoadingMenus(false);
    }

    void loadMenus();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const visibleCategories = useMemo(() => {
    const activeIds = new Set(menuData.map((item) => item.category));
    return MENU_CATEGORY_CAPSULES.filter(
      (capsule) =>
        isPublicMenuCategory(capsule.id) &&
        (capsule.id === "all" || activeIds.has(capsule.id)),
    );
  }, [menuData]);

  const visibleItems = useMemo(() => {
    if (orderForm.activeCategory === "all") {
      return menuData;
    }

    return menuData.filter((item) => item.category === orderForm.activeCategory);
  }, [menuData, orderForm.activeCategory]);

  const activeMenuItem = useMemo(
    () => menuData.find((item) => item.id === activeMenuId) ?? null,
    [activeMenuId, menuData],
  );

  const cartTotal = useMemo(
    () => calculateOrderTotal(menuData, orderForm),
    [menuData, orderForm],
  );

  const cartUnitCount = useMemo(
    () =>
      orderForm.cartItemIds.reduce(
        (sum, itemId) => sum + (orderForm.quantities[itemId] ?? 1),
        0,
      ),
    [orderForm.cartItemIds, orderForm.quantities],
  );

  const hasCartItems = cartUnitCount > 0;

  function updateOrderForm(patch: Partial<OrderFormState>) {
    setOrderForm((current) => ({ ...current, ...patch }));
    setOrderError(null);
  }

  function openMenuDetails(itemId: string) {
    setActiveMenuId(itemId);
    setIsDetailOpen(false);
    window.requestAnimationFrame(() => {
      setIsDetailOpen(true);
    });
    setOrderError(null);
  }

  const closeMenuDetails = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  function handleConfirmMenu({
    itemId,
    optionId,
    optionQuantities,
    drinkOptionId,
    addonIds,
    quantity,
  }: {
    itemId: string;
    optionId?: string;
    optionQuantities?: Record<string, number>;
    drinkOptionId?: string;
    addonIds: string[];
    quantity: number;
  }) {
    const menuItem = menuData.find((entry) => entry.id === itemId);
    const isMulti = (menuItem?.options.length ?? 0) > 0;

    setOrderForm((current) => {
      const nextSelectedOptions = { ...current.selectedOptions };
      const nextSelectedOptionQuantities = {
        ...current.selectedOptionQuantities,
      };
      const normalizedDrinkOptionId =
        normalizeOptionId(drinkOptionId) || DEFAULT_DRINK_OPTION_ID;
      const safeQuantity = Math.min(99, Math.max(isMulti ? 0 : 1, quantity));

      if (isMulti && menuItem) {
        const normalizedQuantities = normalizeOptionQuantityMap(
          optionQuantities,
          menuItem.options.map((option) => option.id),
        );
        nextSelectedOptionQuantities[itemId] = normalizedQuantities;
        delete nextSelectedOptions[itemId];
      } else {
        const normalizedOptionId = normalizeOptionId(optionId);
        if (normalizedOptionId) {
          nextSelectedOptions[itemId] = normalizedOptionId;
        } else {
          delete nextSelectedOptions[itemId];
        }
        delete nextSelectedOptionQuantities[itemId];
      }

      return {
        ...current,
        selectedOptions: nextSelectedOptions,
        selectedOptionQuantities: nextSelectedOptionQuantities,
        selectedDrinkOptions: {
          ...current.selectedDrinkOptions,
          [itemId]: normalizedDrinkOptionId,
        },
        cartItemIds: current.cartItemIds.includes(itemId)
          ? current.cartItemIds
          : [...current.cartItemIds, itemId],
        quantities: {
          ...current.quantities,
          [itemId]: safeQuantity,
        },
        selectedAddons: {
          ...current.selectedAddons,
          [itemId]: addonIds.map(normalizeOptionId).filter(Boolean),
        },
      };
    });
    setIsDetailOpen(false);
    setOrderError(null);
  }

  function handleCheckout() {
    const payload = buildOrderPayload(menuData, orderForm, locale);

    if ("error" in payload) {
      setOrderError(
        payload.error === "missing_option"
          ? t("selectOptionError")
          : t("emptyCartError"),
      );
      return;
    }

    const checkoutState = {
      items: payload.items,
      address: payload.deliveryAddress,
      contactEmail: orderForm.contactEmail.trim() || undefined,
      totalPrice: payload.totalPrice,
      language: payload.language,
    };

    window.sessionStorage.setItem(
      "gokwon-checkout-bridge",
      JSON.stringify(checkoutState),
    );
    saveCartDraft(
      orderPayloadToCartDraft(payload, orderForm.contactEmail.trim() || undefined),
    );
    router.push("/checkout?cart=1");
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] pb-40 text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#f7f7f5]/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-4 pb-2 pt-2">
          <GoKwonTopBar showBack backLabel={t("backToLanding")} />
        </div>

        <div className="mx-auto max-w-2xl px-4 pb-2">
          <nav className="mt-1.5">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleCategories.map((capsule) => {
            const active = orderForm.activeCategory === capsule.id;
            const label = pickCategoryLabel(capsule.id, categoryLabels);

            return (
              <button
                key={capsule.id}
                type="button"
                onClick={() =>
                  updateOrderForm({ activeCategory: capsule.id as MenuCategory })
                }
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                  active
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {capsule.id === "all" ? label : `${capsule.emoji} ${label}`}
              </button>
            );
          })}
            </div>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4">
        <CustomOrderMiniBanner />
      </div>

      <section className="mx-auto max-w-2xl px-4 pt-2">
        {showLoadFallback ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            {t("loadFallbackNotice")}
          </p>
        ) : null}

        {orderError ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {orderError}
          </p>
        ) : null}

        {isLoadingMenus ? (
          <div className="rounded-2xl bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500 ring-1 ring-slate-100">
            {t("loadingMenus")}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="rounded-2xl bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500 ring-1 ring-slate-100">
            {t("emptyCategory")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {visibleItems.map((item) => (
              <DynamicMenuCard
                key={item.id}
                item={item}
                language={locale}
                inCart={orderForm.cartItemIds.includes(item.id)}
                localPickBadge={t("localBadge")}
                onOpen={openMenuDetails}
              />
            ))}
          </div>
        )}

      </section>

      <GoKwonTrustBadges />

      <MenuDetailBottomSheet
        item={activeMenuItem}
        open={isDetailOpen}
        language={locale}
        selectedOptionId={
          activeMenuId ? orderForm.selectedOptions[activeMenuId] : undefined
        }
        selectedOptionQuantities={
          activeMenuId
            ? orderForm.selectedOptionQuantities[activeMenuId]
            : undefined
        }
        selectedDrinkOptionId={
          activeMenuId
            ? orderForm.selectedDrinkOptions[activeMenuId]
            : undefined
        }
        selectedAddonIds={
          activeMenuId ? orderForm.selectedAddons[activeMenuId] ?? [] : []
        }
        quantity={activeMenuId ? orderForm.quantities[activeMenuId] ?? 1 : 1}
        inCart={
          activeMenuId
            ? orderForm.cartItemIds.includes(activeMenuId)
            : false
        }
        addLabel={t("addToOrder")}
        updateLabel={t("updateOrder")}
        estimatedTotalLabel={t("estimatedTotal")}
        quantityLabel={t("quantityLabel")}
        decreaseQuantityLabel={t("decreaseQuantity")}
        increaseQuantityLabel={t("increaseQuantity")}
        closeLabel={t("closeMenuDetails")}
        selectOptionError={t("selectOptionError")}
        onClose={closeMenuDetails}
        onConfirm={handleConfirmMenu}
      />

      <footer
        className={`fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-3 backdrop-blur-md transition-all duration-300 ${
          hasCartItems
            ? "border-red-200 bg-white shadow-[0_-12px_40px_rgba(220,38,38,0.18)]"
            : "border-slate-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.1)]"
        }`}
      >
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            <p
              className={`min-w-[5.5rem] shrink-0 text-2xl font-black tabular-nums tracking-tight transition-colors duration-300 ${
                hasCartItems ? "text-red-600" : "text-slate-400"
              }`}
            >
              ${cartTotal.toFixed(2)}
            </p>
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!hasCartItems}
              className={`flex min-w-0 flex-1 items-center justify-center rounded-full px-5 py-3.5 text-sm font-black transition-all duration-200 active:scale-[0.98] ${
                hasCartItems
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md hover:scale-[1.02] hover:from-orange-600 hover:to-red-700 hover:shadow-lg"
                  : "cursor-not-allowed bg-slate-300 text-slate-500 shadow-none"
              }`}
            >
              {t("orderButton")}
            </button>
          </div>
          <p className="mt-2 text-center text-xs leading-snug text-slate-500">
            {t("refundPolicyLine")}
          </p>
        </div>
      </footer>
    </main>
  );
}
