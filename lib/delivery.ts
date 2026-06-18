export const DELIVERY_TYPES = ["HAN_RIVER", "ACCOMMODATION"] as const;

export type DeliveryType = (typeof DELIVERY_TYPES)[number];

export const HAN_RIVER_DELIVERY_ZONES = [
  "Yeouido Hangang Park",
  "Banpo Hangang Park",
  "Ttukseom Hangang Park",
  "Jamsil Hangang Park",
  "Mangwon Hangang Park",
] as const;

export type HanRiverDeliveryZone = (typeof HAN_RIVER_DELIVERY_ZONES)[number];

export type DeliveryAddress =
  | {
      type: "HAN_RIVER";
      zone: HanRiverDeliveryZone;
    }
  | {
      type: "ACCOMMODATION";
      accommodationName: string;
      roomNumber?: string;
      noteToRider: string;
    };

export function isDeliveryType(value: unknown): value is DeliveryType {
  return DELIVERY_TYPES.includes(value as DeliveryType);
}

export function isHanRiverDeliveryZone(
  value: unknown,
): value is HanRiverDeliveryZone {
  return HAN_RIVER_DELIVERY_ZONES.includes(value as HanRiverDeliveryZone);
}
