"use client";

import { Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import MenuDescriptionText from "@/components/menu/MenuDescriptionText";
import {
  DEFAULT_DRINK_OPTION_ID,
  formatMenuPrice,
  pickAddonTitle,
  pickDrinkOptionsDescription,
  pickDrinkOptionsTitle,
  pickLocalizedField,
  pickOptionLabel,
  type MenuDataItem,
  type MenuLanguage,
} from "@/lib/gokwon-menu-data";
import { resolveMenuImageUrls } from "@/lib/menu-images";
import { estimateLineTotal } from "@/lib/gokwon-order-form";
import {
  adjustOptionQuantitiesToTotal,
  createEmptyOptionQuantityMap,
  normalizeOptionQuantityMap,
  optionQuantitiesFromLegacySingle,
  sumOptionQuantities,
  type OptionQuantityMap,
} from "@/lib/menu-flavor-selection";
import {
  normalizeOptionId,
  optionIdsMatch,
} from "@/lib/menu-option-utils";

type MenuDetailBottomSheetProps = {
  item: MenuDataItem | null;
  open: boolean;
  language: MenuLanguage;
  selectedOptionId?: string;
  selectedOptionQuantities?: OptionQuantityMap;
  selectedDrinkOptionId?: string;
  selectedAddonIds?: string[];
  quantity: number;
  inCart: boolean;
  addLabel: string;
  updateLabel: string;
  estimatedTotalLabel: string;
  quantityLabel: string;
  decreaseQuantityLabel: string;
  increaseQuantityLabel: string;
  closeLabel: string;
  selectOptionError: string;
  onClose: () => void;
  onConfirm: (configuration: {
    itemId: string;
    optionId?: string;
    optionQuantities?: OptionQuantityMap;
    drinkOptionId?: string;
    addonIds: string[];
    quantity: number;
  }) => void;
};

type MenuQuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  decreaseLabel: string;
  increaseLabel: string;
  groupLabel: string;
  onChange: (value: number) => void;
};

function OptionQuantityStepper({
  value,
  max,
  decreaseLabel,
  increaseLabel,
  onChange,
}: {
  value: number;
  max?: number;
  decreaseLabel: string;
  increaseLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        aria-label={decreaseLabel}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <span className="min-w-[1.75rem] px-1 text-center text-base font-black tabular-nums text-slate-950">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max ?? 99, value + 1))}
        disabled={value >= (max ?? 99)}
        aria-label={increaseLabel}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function MenuQuantityStepper({
  value,
  min = 1,
  max = 99,
  decreaseLabel,
  increaseLabel,
  groupLabel,
  onChange,
}: MenuQuantityStepperProps) {
  return (
    <div
      role="group"
      aria-label={groupLabel}
      className="flex shrink-0 items-center gap-1 rounded-2xl border-2 border-slate-200 bg-slate-50 p-1.5"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={decreaseLabel}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-3 text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Minus className="h-5 w-5" aria-hidden />
      </button>
      <span
        aria-live="polite"
        className="min-w-[2.25rem] px-1 text-center text-xl font-black tabular-nums text-slate-950"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={increaseLabel}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-white p-3 text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-35"
      >
        <Plus className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}

export default function MenuDetailBottomSheet({
  item,
  open,
  language,
  selectedOptionId,
  selectedOptionQuantities,
  selectedDrinkOptionId,
  selectedAddonIds = [],
  quantity,
  inCart,
  addLabel,
  updateLabel,
  estimatedTotalLabel,
  quantityLabel,
  decreaseQuantityLabel,
  increaseQuantityLabel,
  closeLabel,
  selectOptionError,
  onClose,
  onConfirm,
}: MenuDetailBottomSheetProps) {
  const [draftOptionId, setDraftOptionId] = useState<string | undefined>();
  const [draftDrinkOptionId, setDraftDrinkOptionId] = useState<string>(
    DEFAULT_DRINK_OPTION_ID,
  );
  const [draftAddonIds, setDraftAddonIds] = useState<string[]>([]);
  const [draftFlavorQty, setDraftFlavorQty] = useState<OptionQuantityMap>({});
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const hasOptionQuantities = (item?.options.length ?? 0) > 0;
  const flavorOptionIds = useMemo(
    () => item?.options.map((option) => normalizeOptionId(option.id)) ?? [],
    [item],
  );

  useEffect(() => {
    if (!item || !open) {
      return;
    }

    const optionIds = item.options.map((option) => option.id);

    setDraftOptionId(
      selectedOptionId ? normalizeOptionId(selectedOptionId) : undefined,
    );
    setDraftDrinkOptionId(
      normalizeOptionId(selectedDrinkOptionId) || DEFAULT_DRINK_OPTION_ID,
    );
    setDraftAddonIds(selectedAddonIds.map(normalizeOptionId).filter(Boolean));

    if (optionIds.length > 0) {
      const hydrated =
        selectedOptionQuantities &&
        sumOptionQuantities(selectedOptionQuantities) > 0
          ? normalizeOptionQuantityMap(selectedOptionQuantities, optionIds)
          : selectedOptionId
            ? normalizeOptionQuantityMap(
                optionQuantitiesFromLegacySingle(
                  selectedOptionId,
                  quantity,
                ),
                optionIds,
              )
            : createEmptyOptionQuantityMap(optionIds);

      setDraftFlavorQty(hydrated);
      setDraftQuantity(sumOptionQuantities(hydrated));
    } else {
      setDraftFlavorQty(createEmptyOptionQuantityMap(optionIds));
      setDraftQuantity(Math.min(99, Math.max(1, quantity)));
    }

    setError(null);
  }, [
    item,
    open,
    quantity,
    selectedAddonIds,
    selectedDrinkOptionId,
    selectedOptionId,
    selectedOptionQuantities,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  const total = useMemo(
    () =>
      item
        ? estimateLineTotal(
            item,
            draftQuantity,
            hasOptionQuantities ? undefined : draftOptionId,
            draftAddonIds,
            draftDrinkOptionId,
            hasOptionQuantities ? draftFlavorQty : undefined,
          )
        : 0,
    [
      draftAddonIds,
      draftDrinkOptionId,
      draftFlavorQty,
      draftOptionId,
      draftQuantity,
      hasOptionQuantities,
      item,
    ],
  );

  if (!item) {
    return null;
  }

  const menuItem = item;
  const name = pickLocalizedField(item, "name", language);
  const tagline = pickLocalizedField(item, "tagline", language);
  const optionsTitle = pickLocalizedField(item, "options_title", language);
  const addonTitle = pickAddonTitle(item, language);
  const drinkTitle = pickDrinkOptionsTitle(item, language);
  const drinkDescription = pickDrinkOptionsDescription(item, language);
  const imageUrl = resolveMenuImageUrls(item.imageUrls ?? item.imageUrl)[0];

  function toggleAddon(addonId: string) {
    const normalizedAddonId = normalizeOptionId(addonId);
    setDraftAddonIds((current) =>
      current.some((id) => optionIdsMatch(id, normalizedAddonId))
        ? current.filter((id) => !optionIdsMatch(id, normalizedAddonId))
        : [...current, normalizedAddonId],
    );
  }

  function updateFlavorQuantity(optionId: string, nextValue: number) {
    const normalizedOptionId = normalizeOptionId(optionId);
    const currentTotal = sumOptionQuantities(draftFlavorQty);
    const currentValue = draftFlavorQty[normalizedOptionId] ?? 0;
    const delta = nextValue - currentValue;

    if (delta > 0 && currentTotal + delta > 99) {
      return;
    }

    const nextMap = {
      ...draftFlavorQty,
      [normalizedOptionId]: Math.max(0, nextValue),
    };
    const nextTotal = sumOptionQuantities(nextMap);

    setDraftFlavorQty(nextMap);
    setDraftQuantity(nextTotal);
    setError(null);
  }

  function handleMainQuantityChange(nextQuantity: number) {
    if (hasOptionQuantities) {
      const nextFlavorQty = adjustOptionQuantitiesToTotal(
        draftFlavorQty,
        flavorOptionIds,
        nextQuantity,
      );
      setDraftFlavorQty(nextFlavorQty);
      setDraftQuantity(sumOptionQuantities(nextFlavorQty));
      setError(null);
      return;
    }

    setDraftQuantity(nextQuantity);
  }

  function handleConfirm() {
    if (hasOptionQuantities) {
      const optionTotal = sumOptionQuantities(draftFlavorQty);
      if (optionTotal <= 0) {
        setError(selectOptionError);
        return;
      }

      onConfirm({
        itemId: menuItem.id,
        optionQuantities: draftFlavorQty,
        drinkOptionId: draftDrinkOptionId,
        addonIds: draftAddonIds,
        quantity: optionTotal,
      });
      return;
    }

    onConfirm({
      itemId: menuItem.id,
      drinkOptionId: draftDrinkOptionId,
      addonIds: draftAddonIds,
      quantity: draftQuantity,
    });
  }

  return (
    <div
      className={`fixed inset-0 z-[80] transition-[visibility] ${
        open
          ? "pointer-events-auto visible delay-0"
          : "pointer-events-none invisible delay-300"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={name}
        className={`absolute bottom-0 left-0 right-0 mx-auto flex max-h-[92dvh] max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="relative shrink-0">
          <div className="absolute left-1/2 top-2 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/80 shadow-sm" />
          <div
            className="h-44 bg-cover bg-slate-100 sm:h-52"
            style={{
              backgroundImage: `url('${imageUrl}')`,
              backgroundPosition: item.imagePosition ?? "center",
            }}
            role="img"
            aria-label={name}
          >
            <div className="h-full bg-gradient-to-t from-black/70 via-black/10 to-black/25" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md transition hover:bg-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-sm font-black">{formatMenuPrice(item.price)}</p>
            <h2 className="mt-1 text-2xl font-black leading-tight tracking-tight">
              {item.emoji ? `${item.emoji} ` : ""}
              {name}
            </h2>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <MenuDescriptionText text={tagline} />

          {item.options.length > 0 ? (
            <fieldset className="mt-6 space-y-3 border-t border-slate-100 pt-5">
              <legend className="text-base font-black text-slate-950">
                {optionsTitle}
              </legend>
              <p className="text-xs font-medium leading-5 text-slate-500">
                Set how many of each option you want — the total syncs with
                quantity below.
              </p>
              {item.options.map((option) => {
                const normalizedOptionId = normalizeOptionId(option.id);
                const optionQty = draftFlavorQty[normalizedOptionId] ?? 0;
                const optionTotal = sumOptionQuantities(draftFlavorQty);
                const maxForRow = Math.min(
                  99,
                  optionQty + Math.max(0, 99 - optionTotal),
                );

                return (
                  <div
                    key={option.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5"
                  >
                    <span className="min-w-0 flex-1 text-sm font-bold leading-5 text-slate-800">
                      {pickOptionLabel(option, language)}
                    </span>
                    {option.price ? (
                      <span className="shrink-0 text-sm font-black text-red-600">
                        +{formatMenuPrice(option.price)}
                      </span>
                    ) : null}
                    <OptionQuantityStepper
                      value={optionQty}
                      max={maxForRow}
                      decreaseLabel={decreaseQuantityLabel}
                      increaseLabel={increaseQuantityLabel}
                      onChange={(value) =>
                        updateFlavorQuantity(normalizedOptionId, value)
                      }
                    />
                  </div>
                );
              })}
            </fieldset>
          ) : null}

          {item.drinkOptions?.length ? (
            <fieldset className="mt-6 space-y-3 border-t border-slate-100 pt-5">
              <legend className="text-base font-black text-slate-950">
                {drinkTitle}
              </legend>
              <p className="text-xs font-medium leading-5 text-slate-500">
                {drinkDescription}
              </p>
              {item.drinkOptions.map((option) => {
                const normalizedOptionId = normalizeOptionId(option.id);
                const checked = optionIdsMatch(
                  draftDrinkOptionId,
                  normalizedOptionId,
                );
                const optionPrice = option.price ?? 0;

                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={checked}
                    onClick={() => {
                      setDraftDrinkOptionId(normalizedOptionId);
                      setError(null);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition ${
                      checked
                        ? "border-red-500 bg-red-50 ring-1 ring-red-200"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        checked
                          ? "border-red-600 bg-red-600"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-hidden
                    >
                      {checked ? (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-bold leading-5 text-slate-800">
                      {pickOptionLabel(option, language)}
                    </span>
                    {optionPrice > 0 ? (
                      <span className="shrink-0 text-sm font-black text-red-600">
                        +{formatMenuPrice(optionPrice)}
                      </span>
                    ) : (
                      <span className="shrink-0 text-sm font-semibold text-slate-400">
                        {formatMenuPrice(0)}
                      </span>
                    )}
                  </button>
                );
              })}
            </fieldset>
          ) : null}

          {item.addonOptions?.length ? (
            <fieldset className="mt-6 space-y-3 border-t border-slate-100 pt-5">
              <legend className="text-base font-black text-slate-950">
                {addonTitle}
              </legend>
              {item.addonOptions.map((addon) => {
                const checked = draftAddonIds.some((id) =>
                  optionIdsMatch(id, addon.id),
                );

                return (
                  <label
                    key={addon.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
                      checked
                        ? "border-red-500 bg-red-50 ring-1 ring-red-200"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAddon(addon.id)}
                      className="h-5 w-5 shrink-0 rounded accent-red-600"
                    />
                    <span className="min-w-0 flex-1 text-sm font-bold leading-5 text-slate-800">
                      {pickOptionLabel(addon, language)}
                    </span>
                    {addon.price ? (
                      <span className="shrink-0 text-sm font-black text-red-600">
                        +{formatMenuPrice(addon.price)}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </fieldset>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)]">
          <div className="flex items-stretch gap-3">
            <MenuQuantityStepper
              value={draftQuantity}
              min={hasOptionQuantities ? 0 : 1}
              decreaseLabel={decreaseQuantityLabel}
              increaseLabel={increaseQuantityLabel}
              groupLabel={quantityLabel}
              onChange={handleMainQuantityChange}
            />
            <button
              type="button"
              onClick={handleConfirm}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-4 py-3 text-white shadow-lg transition active:scale-[0.98]"
            >
              <span className="text-sm font-black leading-tight sm:text-base">
                {inCart ? updateLabel : addLabel}
              </span>
              <span
                aria-live="polite"
                className="text-xl font-black tabular-nums leading-none"
              >
                {formatMenuPrice(total)}
              </span>
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] font-medium text-slate-400">
            {estimatedTotalLabel}
          </p>
        </div>
      </section>
    </div>
  );
}
