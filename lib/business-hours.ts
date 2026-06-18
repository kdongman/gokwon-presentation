export const LIVE_DELIVERY_OPEN_HOUR_KST = 11;
export const LIVE_DELIVERY_CLOSE_HOUR_KST = 1;

export const LIVE_DELIVERY_HOURS_NOTICE =
  "Notice: We are currently outside of our live delivery hours. (Operating Hours: 11:00 AM - 01:00 AM KST) / 현재 실시간 배달 운영 시간이 아닙니다. (운영 시간: 11:00 ~ 01:00 KST)";

export function getKstHour(date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      hour12: false,
    }).format(date),
  );
}

/** Live delivery runs 11:00 KST through 01:00 KST the next day (closed 01:00–11:00). */
export function isOpenForLiveDeliveryKst(date = new Date()) {
  const hour = getKstHour(date);
  return (
    hour >= LIVE_DELIVERY_OPEN_HOUR_KST ||
    hour < LIVE_DELIVERY_CLOSE_HOUR_KST
  );
}

export function getKstDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function getFoodOrderScheduleKst(date = new Date()) {
  const isPreOrder = !isOpenForLiveDeliveryKst(date);
  const kstDate = getKstDateString(date);

  if (!isPreOrder) {
    return {
      bookingDate: kstDate,
      bookingTime: "ASAP",
      isPreOrder: false,
    };
  }

  const [year, month, day] = kstDate.split("-").map(Number);
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));

  return {
    bookingDate: tomorrow.toISOString().slice(0, 10),
    bookingTime: "Tomorrow evening",
    isPreOrder: true,
  };
}
