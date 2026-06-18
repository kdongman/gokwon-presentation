export const NOTIFICATION_TYPES = [
  "ORDER_PLACED",
  "OUT_FOR_DELIVERY",
  "TEST",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

type NotificationTemplate = {
  subject: string;
  text: string;
};

const TEMPLATES: Record<NotificationType, NotificationTemplate> = {
  ORDER_PLACED: {
    subject: "GoKwon Concierge: Your order has been placed",
    text: "Hello from GoKwon. Your personal concierge has placed your order with a highly rated local restaurant near you. We are now coordinating delivery and will keep you updated every step of the way.",
  },
  OUT_FOR_DELIVERY: {
    subject: "GoKwon Concierge: Your food is arriving shortly",
    text: "Your food is on the way and should arrive shortly. Please be ready at the location you provided, such as your hotel lobby or Han River meeting point. Your GoKwon concierge will contact you if anything changes.",
  },
  TEST: {
    subject: "GoKwon concierge email test",
    text: "Hello from GoKwon. Your private concierge email updates are connected and ready.",
  },
};

export function isNotificationType(value: unknown): value is NotificationType {
  return NOTIFICATION_TYPES.includes(value as NotificationType);
}

export function getNotificationTemplate(type: NotificationType) {
  return TEMPLATES[type];
}

export const DEFAULT_ORDER_PLACED_MESSAGE = TEMPLATES.ORDER_PLACED.text;
