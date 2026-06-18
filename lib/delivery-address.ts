export type DeliveryCoordinates = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  source: "gps" | "google_place" | "map_pin";
};

export function parseDeliveryCoordinates(
  value: unknown,
): DeliveryCoordinates | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const latitude = Number(record.latitude);
  const longitude = Number(record.longitude);
  const accuracyMeters =
    record.accuracyMeters === undefined
      ? undefined
      : Number(record.accuracyMeters);
  const source =
    record.source === "google_place" || record.source === "map_pin"
      ? record.source
      : "gps";

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    latitude,
    longitude,
    ...(accuracyMeters !== undefined &&
    Number.isFinite(accuracyMeters) &&
    accuracyMeters >= 0
      ? { accuracyMeters }
      : {}),
    source,
  };
}

/** Merge Google place line + optional room / detail into one delivery string for Supabase. */
export function combineDeliveryAddress(
  streetAddress: string,
  roomDetail: string,
): string {
  const street = streetAddress.trim();
  const room = roomDetail.trim();

  if (!street) {
    return "";
  }

  if (!room) {
    return street;
  }

  return `${street}, ${room}`;
}
