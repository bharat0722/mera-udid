/**
 * The clock.
 *
 * "Now" is pinned to a fixed instant rather than read from the machine. Two reasons:
 * the seeded dataset is generated backwards from it, so a pinned clock makes the demo
 * and the tests reproducible on any day; and every SLA breach shown in the UI stays
 * exactly as described in the walkthrough instead of drifting.
 *
 * Change DEMO_NOW and the whole dataset shifts with it — nothing else needs editing.
 */

/** 23 August 2026, 09:00 India Standard Time. */
export const DEMO_NOW = new Date("2026-08-23T03:30:00.000Z");

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function now(): Date {
  return DEMO_NOW;
}

export function toIso(date: Date): string {
  return date.toISOString();
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Whole days from `from` to `to`, floored, never negative. */
export function daysBetween(from: Date | string, to: Date | string = DEMO_NOW): number {
  const start = typeof from === "string" ? new Date(from) : from;
  const end = typeof to === "string" ? new Date(to) : to;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY));
}

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const HI_MONTHS = [
  "जनवरी",
  "फ़रवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर"
];

/**
 * Dates are formatted by hand rather than through Intl so that the output is identical
 * in the browser, in jsdom and in CI, whatever locale data happens to be installed.
 */
export function formatDate(value: Date | string, locale: "en" | "hi" = "en"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const day = String(date.getUTCDate()).padStart(2, "0");
  const months = locale === "hi" ? HI_MONTHS : EN_MONTHS;
  return `${day} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** Indian digit grouping: 1,15,63,288 rather than 11,563,288. */
export function formatIndianNumber(value: number): string {
  const negative = value < 0;
  const digits = String(Math.abs(Math.trunc(value)));
  if (digits.length <= 3) return negative ? `-${digits}` : digits;
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}${grouped},${last3}`;
}
