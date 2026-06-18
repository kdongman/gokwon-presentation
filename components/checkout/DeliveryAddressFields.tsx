"use client";

import {
  GoogleMap,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { CheckCircle2, Loader2, MapPin, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import type { DeliveryCoordinates } from "@/lib/delivery-address";

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];
const DELIVERY_MAP_OPTIONS: google.maps.MapOptions = {
  clickableIcons: false,
  disableDefaultUI: true,
  fullscreenControl: false,
  gestureHandling: "greedy",
  mapTypeControl: false,
  streetViewControl: false,
  zoomControl: true,
};

type DeliveryAddressFieldsProps = {
  streetAddress: string;
  roomDetail: string;
  onStreetAddressChange: (value: string) => void;
  onRoomDetailChange: (value: string) => void;
  onCoordinatesChange?: (value: DeliveryCoordinates | null) => void;
  streetLabel: string;
  streetPlaceholder: string;
  roomLabel: string;
  roomPlaceholder: string;
  useCurrentLocationLabel: string;
  locatingLabel: string;
  locationErrorLabel: string;
  mapsUnavailableLabel: string;
  addressSearchLoadingLabel: string;
  searchHintLabel: string;
  locationSelectedLabel: string;
  markerTitleLabel: string;
  updatingAddressLabel: string;
  dragPinHintLabel: string;
};

export default function DeliveryAddressFields({
  streetAddress,
  roomDetail,
  onStreetAddressChange,
  onRoomDetailChange,
  onCoordinatesChange,
  streetLabel,
  streetPlaceholder,
  roomLabel,
  roomPlaceholder,
  useCurrentLocationLabel,
  locatingLabel,
  locationErrorLabel,
  mapsUnavailableLabel,
  addressSearchLoadingLabel,
  searchHintLabel,
  locationSelectedLabel,
  markerTitleLabel,
  updatingAddressLabel,
  dragPinHintLabel,
}: DeliveryAddressFieldsProps) {
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const autocompleteSessionRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const autocompleteRequestRef = useRef(0);
  const suppressAutocompleteRef = useRef(false);
  const reverseGeocodeRequestRef = useRef(0);
  const [isLocating, setIsLocating] = useState(false);
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [placePredictions, setPlacePredictions] = useState<
    google.maps.places.PlacePrediction[]
  >([]);
  const [activePredictionIndex, setActivePredictionIndex] = useState(-1);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapCoordinates, setMapCoordinates] =
    useState<DeliveryCoordinates | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "gokwon-google-maps",
    googleMapsApiKey: mapsApiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
    language: "en",
  });

  const resolveAddress = useCallback(
    async (coordinates: DeliveryCoordinates): Promise<string> => {
      if (isLoaded && window.google?.maps?.Geocoder) {
        try {
          const response = await new google.maps.Geocoder().geocode({
            location: {
              lat: coordinates.latitude,
              lng: coordinates.longitude,
            },
          });
          const browserAddress =
            response.results[0]?.formatted_address?.trim() ?? "";

          if (browserAddress) {
            return browserAddress;
          }
        } catch {
          // Fall through to the server route when browser geocoding is unavailable.
        }
      }

      const params = new URLSearchParams({
        lat: String(coordinates.latitude),
        lng: String(coordinates.longitude),
      });
      const response = await fetch(
        `/api/geocode/reverse?${params.toString()}`,
      );
      const result = (await response.json()) as {
        success?: boolean;
        data?: { formattedAddress?: string };
        error?: string;
      };

      if (!response.ok || !result.success || !result.data?.formattedAddress) {
        throw new Error(result.error ?? locationErrorLabel);
      }

      return result.data.formattedAddress;
    },
    [isLoaded, locationErrorLabel],
  );

  const handleMarkerDragEnd = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      const latitude = event.latLng?.lat();
      const longitude = event.latLng?.lng();

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return;
      }

      const coordinates: DeliveryCoordinates = {
        latitude,
        longitude,
        source: "map_pin",
      };
      setMapCoordinates(coordinates);
      onCoordinatesChange?.(coordinates);
      setIsResolvingPin(true);
      setLocationError(null);
      const requestId = reverseGeocodeRequestRef.current + 1;
      reverseGeocodeRequestRef.current = requestId;

      try {
        const formattedAddress = await resolveAddress(coordinates);
        if (requestId !== reverseGeocodeRequestRef.current) {
          return;
        }
        suppressAutocompleteRef.current = true;
        onStreetAddressChange(formattedAddress);
      } catch (error) {
        if (requestId !== reverseGeocodeRequestRef.current) {
          return;
        }
        suppressAutocompleteRef.current = true;
        onStreetAddressChange(
          `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        );
        setLocationError(
          error instanceof Error
            ? `${error.message} Exact pin coordinates were saved.`
            : `${locationErrorLabel} Exact pin coordinates were saved.`,
        );
      } finally {
        if (requestId === reverseGeocodeRequestRef.current) {
          setIsResolvingPin(false);
        }
      }
    },
    [
      locationErrorLabel,
      onCoordinatesChange,
      onStreetAddressChange,
      resolveAddress,
    ],
  );

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (suppressAutocompleteRef.current) {
      suppressAutocompleteRef.current = false;
      setPlacePredictions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    const query = streetAddress.trim();
    if (query.length < 3) {
      setPlacePredictions([]);
      setIsSuggestionsOpen(false);
      setIsSearchingPlaces(false);
      return;
    }

    const requestId = autocompleteRequestRef.current + 1;
    autocompleteRequestRef.current = requestId;
    const timer = window.setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const { AutocompleteSuggestion, AutocompleteSessionToken } =
          (await google.maps.importLibrary(
            "places",
          )) as google.maps.PlacesLibrary;
        autocompleteSessionRef.current ??= new AutocompleteSessionToken();
        const { suggestions } =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            includedRegionCodes: ["kr"],
            language: "en",
            region: "kr",
            sessionToken: autocompleteSessionRef.current,
          });

        if (requestId !== autocompleteRequestRef.current) {
          return;
        }

        const predictions = suggestions
          .map((suggestion) => suggestion.placePrediction)
          .filter(
            (
              prediction,
            ): prediction is google.maps.places.PlacePrediction =>
              prediction !== null,
          );
        setPlacePredictions(predictions);
        setActivePredictionIndex(-1);
        setIsSuggestionsOpen(predictions.length > 0);
        setLocationError(null);
      } catch {
        if (requestId === autocompleteRequestRef.current) {
          setPlacePredictions([]);
          setIsSuggestionsOpen(false);
          setLocationError(mapsUnavailableLabel);
        }
      } finally {
        if (requestId === autocompleteRequestRef.current) {
          setIsSearchingPlaces(false);
        }
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [isLoaded, mapsUnavailableLabel, streetAddress]);

  const handlePlaceSelection = useCallback(
    async (prediction: google.maps.places.PlacePrediction) => {
      setIsSearchingPlaces(true);
      setIsSuggestionsOpen(false);
      try {
        const place = prediction.toPlace();
        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "location"],
        });
        const nextAddress =
          place.formattedAddress?.trim() || place.displayName?.trim() || "";
        const latitude = place.location?.lat();
        const longitude = place.location?.lng();

        if (
          !nextAddress ||
          typeof latitude !== "number" ||
          typeof longitude !== "number"
        ) {
          throw new Error(locationErrorLabel);
        }

        const coordinates: DeliveryCoordinates = {
          latitude,
          longitude,
          source: "google_place",
        };
        suppressAutocompleteRef.current = true;
        autocompleteRequestRef.current += 1;
        autocompleteSessionRef.current = null;
        reverseGeocodeRequestRef.current += 1;
        setPlacePredictions([]);
        setActivePredictionIndex(-1);
        setIsResolvingPin(false);
        setMapCoordinates(coordinates);
        onCoordinatesChange?.(coordinates);
        onStreetAddressChange(nextAddress);
        setLocationError(null);
      } catch (error) {
        setLocationError(
          error instanceof Error ? error.message : locationErrorLabel,
        );
      } finally {
        setIsSearchingPlaces(false);
      }
    },
    [locationErrorLabel, onCoordinatesChange, onStreetAddressChange],
  );

  const handleTypedAddressSearch = useCallback(async () => {
    const query = streetAddress.trim();
    if (!isLoaded || query.length < 3) {
      return;
    }

    setIsSearchingPlaces(true);
    setIsSuggestionsOpen(false);
    try {
      const response = await new google.maps.Geocoder().geocode({
        address: query,
        region: "KR",
      });
      const result = response.results[0];
      const latitude = result?.geometry.location.lat();
      const longitude = result?.geometry.location.lng();
      const nextAddress = result?.formatted_address?.trim() ?? "";

      if (
        !nextAddress ||
        typeof latitude !== "number" ||
        typeof longitude !== "number"
      ) {
        throw new Error(locationErrorLabel);
      }

      const coordinates: DeliveryCoordinates = {
        latitude,
        longitude,
        source: "google_place",
      };
      suppressAutocompleteRef.current = true;
      autocompleteRequestRef.current += 1;
      autocompleteSessionRef.current = null;
      reverseGeocodeRequestRef.current += 1;
      setPlacePredictions([]);
      setActivePredictionIndex(-1);
      setMapCoordinates(coordinates);
      onCoordinatesChange?.(coordinates);
      onStreetAddressChange(nextAddress);
      setLocationError(null);
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : locationErrorLabel,
      );
    } finally {
      setIsSearchingPlaces(false);
    }
  }, [
    isLoaded,
    locationErrorLabel,
    onCoordinatesChange,
    onStreetAddressChange,
    streetAddress,
  ]);

  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError(locationErrorLabel);
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    reverseGeocodeRequestRef.current += 1;
    setIsResolvingPin(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates: DeliveryCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          source: "gps",
        };
        setMapCoordinates(coordinates);
        onCoordinatesChange?.(coordinates);

        try {
          const formattedAddress = await resolveAddress(coordinates);
          suppressAutocompleteRef.current = true;
          onStreetAddressChange(formattedAddress);
        } catch (error) {
          suppressAutocompleteRef.current = true;
          onStreetAddressChange(
            `GPS: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`,
          );
          setLocationError(
            error instanceof Error
              ? `${error.message} Exact GPS coordinates were saved.`
              : `${locationErrorLabel} Exact GPS coordinates were saved.`,
          );
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setLocationError(locationErrorLabel);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }

  const inputClassName =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100";

  if (!mapsApiKey || loadError) {
    return (
      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="flex items-center gap-2 text-sm font-black text-slate-900">
            <MapPin className="h-4 w-4 text-red-600" aria-hidden />
            {streetLabel}
          </span>
          <textarea
            value={streetAddress}
            onChange={(event) => {
              reverseGeocodeRequestRef.current += 1;
              setIsResolvingPin(false);
              onStreetAddressChange(event.target.value);
              setMapCoordinates(null);
              onCoordinatesChange?.(null);
            }}
            rows={3}
            className={`mt-2 resize-none leading-6 ${inputClassName}`}
            placeholder={streetPlaceholder}
          />
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-wait disabled:opacity-60"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <MapPin className="h-4 w-4 text-red-600" aria-hidden />
          )}
          {isLocating ? locatingLabel : useCurrentLocationLabel}
        </button>
        {locationError ? (
          <p className="text-xs font-medium leading-5 text-red-600" role="alert">
            {locationError}
          </p>
        ) : null}
        {mapsApiKey ? null : (
          <p className="text-xs leading-5 text-amber-700">{mapsUnavailableLabel}</p>
        )}
        <label className="block">
          <span className="text-sm font-black text-slate-900">{roomLabel}</span>
          <input
            value={roomDetail}
            onChange={(event) => onRoomDetailChange(event.target.value)}
            type="text"
            className={`mt-2 ${inputClassName}`}
            placeholder={roomPlaceholder}
          />
        </label>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        {addressSearchLoadingLabel}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div>
        <span className="flex items-center gap-2 text-sm font-black text-slate-900">
          <MapPin className="h-4 w-4 text-red-600" aria-hidden />
          {streetLabel}
        </span>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              id="delivery-address-search"
              name="deliveryAddress"
              value={streetAddress}
              onChange={(event) => {
                autocompleteRequestRef.current += 1;
                reverseGeocodeRequestRef.current += 1;
                setIsResolvingPin(false);
                setMapCoordinates(null);
                onCoordinatesChange?.(null);
                onStreetAddressChange(event.target.value);
                setLocationError(null);
                setIsSuggestionsOpen(true);
              }}
              type="search"
              role="combobox"
              autoComplete="off"
              aria-label={streetLabel}
              aria-describedby="delivery-address-search-hint"
              aria-autocomplete="list"
              aria-controls="delivery-address-suggestions"
              aria-expanded={isSuggestionsOpen}
              onFocus={() => {
                if (placePredictions.length > 0) {
                  setIsSuggestionsOpen(true);
                }
              }}
              onBlur={() => setIsSuggestionsOpen(false)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  if (
                    !isSuggestionsOpen ||
                    placePredictions.length === 0
                  ) {
                    return;
                  }
                  event.preventDefault();
                  setActivePredictionIndex((current) =>
                    Math.min(current + 1, placePredictions.length - 1),
                  );
                } else if (event.key === "ArrowUp") {
                  if (
                    !isSuggestionsOpen ||
                    placePredictions.length === 0
                  ) {
                    return;
                  }
                  event.preventDefault();
                  setActivePredictionIndex((current) =>
                    Math.max(current - 1, 0),
                  );
                } else if (event.key === "Enter") {
                  const prediction =
                    placePredictions[
                      activePredictionIndex >= 0
                        ? activePredictionIndex
                        : 0
                    ];
                  if (prediction) {
                    event.preventDefault();
                    void handlePlaceSelection(prediction);
                  } else if (streetAddress.trim().length >= 3) {
                    event.preventDefault();
                    void handleTypedAddressSearch();
                  }
                } else if (event.key === "Escape") {
                  setIsSuggestionsOpen(false);
                }
              }}
              className={`${inputClassName} pl-10 pr-10`}
              placeholder={streetPlaceholder}
            />
            {isSearchingPlaces ? (
              <Loader2
                className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 animate-spin text-violet-600"
                aria-hidden
              />
            ) : null}
            {isSuggestionsOpen && placePredictions.length > 0 ? (
              <ul
                id="delivery-address-suggestions"
                role="listbox"
                className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15"
              >
                {placePredictions.map((prediction, index) => (
                  <li
                    key={prediction.placeId}
                    role="option"
                    aria-selected={index === activePredictionIndex}
                  >
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => void handlePlaceSelection(prediction)}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                        index === activePredictionIndex
                          ? "bg-violet-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <MapPin
                        className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-slate-900">
                          {prediction.mainText?.text ??
                            prediction.text.text}
                        </span>
                        {prediction.secondaryText?.text ? (
                          <span className="mt-0.5 block truncate text-xs text-slate-500">
                            {prediction.secondaryText.text}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-bold leading-snug text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:py-2"
          >
            {isLocating ? locatingLabel : useCurrentLocationLabel}
          </button>
        </div>
        <p
          id="delivery-address-search-hint"
          className="mt-2 text-xs leading-5 text-slate-500"
        >
          {searchHintLabel}
        </p>
        {mapCoordinates ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            {locationSelectedLabel}
          </p>
        ) : null}
        {mapCoordinates ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
            <GoogleMap
              center={{
                lat: mapCoordinates.latitude,
                lng: mapCoordinates.longitude,
              }}
              zoom={18}
              options={DELIVERY_MAP_OPTIONS}
              mapContainerClassName="h-64 w-full sm:h-72"
            >
              <MarkerF
                position={{
                  lat: mapCoordinates.latitude,
                  lng: mapCoordinates.longitude,
                }}
                draggable
                onDragEnd={handleMarkerDragEnd}
                title={markerTitleLabel}
              />
            </GoogleMap>
            <div className="flex items-start gap-2 border-t border-slate-200 bg-white px-3 py-2.5">
              {isResolvingPin ? (
                <Loader2
                  className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-violet-600"
                  aria-hidden
                />
              ) : (
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                  aria-hidden
                />
              )}
              <p className="text-xs font-medium leading-5 text-slate-600">
                {isResolvingPin
                  ? updatingAddressLabel
                  : dragPinHintLabel}
              </p>
            </div>
          </div>
        ) : null}
        {locationError ? (
          <p className="mt-2 text-xs font-medium leading-5 text-red-600" role="alert">
            {locationError}
          </p>
        ) : null}
      </div>

      <label className="block">
        <span className="text-sm font-black text-slate-900">{roomLabel}</span>
        <input
          value={roomDetail}
          onChange={(event) => onRoomDetailChange(event.target.value)}
          type="text"
          className={`mt-2 ${inputClassName}`}
          placeholder={roomPlaceholder}
        />
      </label>
    </div>
  );
}
