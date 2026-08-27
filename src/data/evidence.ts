/**
 * Sourced facts.
 *
 * Every number this interface shows about the real world lives here, with its source
 * attached. Nothing in this file is estimated, rounded for effect, or inferred. If a
 * figure is not here, no screen may state it.
 *
 * The subtraction on the four parliamentary figures is ours; the four figures are the
 * government's own.
 */

export interface SourcedFact {
  value: number;
  label: string;
  source: string;
}

/** Written reply in the Rajya Sabha, reported 12 August 2026. */
export const PARLIAMENT_FIGURES = {
  received: 11563288,
  cardsGenerated: 8762115,
  rejected: 824951,
  pending: 963606,
  reportedOn: "12 August 2026",
  source: "Written reply in the Rajya Sabha, reported 12 August 2026 (Salar News)"
} as const;

export const ACCOUNTED_FOR =
  PARLIAMENT_FIGURES.cardsGenerated +
  PARLIAMENT_FIGURES.rejected +
  PARLIAMENT_FIGURES.pending;

export const UNACCOUNTED = PARLIAMENT_FIGURES.received - ACCOUNTED_FOR;

/** Free Press Journal, 16 August 2026, from government data for 2021 to 5 August 2026. */
export const WAIT_TIMES = {
  madhyaPradeshAverageDays: 253,
  andamanNicobarAverageDays: 635,
  lakshadweepAverageDays: 431,
  keralaAverageDays: 360,
  delhiAverageDays: 263,
  karnatakaAverageDays: 232,
  pendingOverSixMonthsNationally: 593000,
  madhyaPradeshPendingOverSixMonths: 12213,
  source: "Free Press Journal, 16 August 2026, and Salar News, 12 August 2026"
} as const;

export const QUOTES = {
  mp: {
    text:
      "More than 10 lakh applications concerning persons with disabilities simply cannot disappear between columns in Government data.",
    attribution: "Rajya Sabha MP Mansoor Ali Khan, on the written reply",
    source: "Salar News, 12 August 2026"
  },
  appReview: {
    text:
      "It has been nearly a year since I logged into the UDID app… the app provides absolutely no notification regarding the rejections, nor do the hospital staff offer any explanation.",
    attribution: "A review of the official UDID app, 2 April 2026",
    source: "Google Play listing for the official UDID app"
  },
  minister: {
    text:
      "depend on the requirements of state governments and hospitals and the availability of doctors",
    attribution:
      "Minister of State B. L. Verma, on how often district medical boards meet",
    source: "Free Press Journal, 16 August 2026"
  }
} as const;

/** Karnataka Health Commissioner's circular, 31 July 2024. */
export const KARNATAKA_CIRCULAR = {
  date: "31 July 2024",
  summary:
    "Medical authorities were denying UDID cards to people assessed below 40% disability. The circular ordered them to stop: the Act imposes no such condition.",
  source: "Deccan Herald, on the Health Commissioner's circular of 31 July 2024"
} as const;

/** Maharashtra assembly announcement, 9 December 2025. */
export const MAHARASHTRA_MANDATE = {
  effectiveFrom: "9 October 2025",
  summary:
    "Maharashtra made the UDID card required across government offices and departments, so a stuck application became total exclusion rather than an inconvenience.",
  /**
   * The only published cadence benchmark this research found anywhere: district
   * hospitals were told to reserve at least two days a week for disability certificate
   * verification. Every district board calendar in this prototype is measured against it.
   */
  reservedDaysPerWeek: 2,
  source: "NewsOnAir, 9 December 2025, and The Bridge Chronicle (Pune)"
} as const;
