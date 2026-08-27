import { addDays, DEMO_NOW, MS_PER_DAY } from "./clock";

/**
 * The medical board calendar.
 *
 * This is the bottleneck. Nobody gets a card without passing through a district board,
 * and asked in Parliament how often those boards meet, the minister's answer was that
 * it depends on "the requirements of state governments and hospitals and the
 * availability of doctors". In other words: the single scarcest resource in the whole
 * system is unscheduled. Nobody publishes when a board sits, how many people it can
 * see, or how long the queue is — so nobody can be held to any of it.
 *
 * An airline knows exactly how many seats it has. A district board should too. Given
 * sitting days and a capacity per sitting, an expected date falls straight out of the
 * queue depth — which turns "you are 47th" into "your date is 14 October".
 *
 * Every schedule below is this prototype's proposal over synthetic data. The real
 * service publishes no calendar at all, which is the point.
 */

export interface BoardSchedule {
  district: string;
  boardId: string;
  venue: string;
  /** Days the board sits. 0 = Sunday … 6 = Saturday. */
  sittingDays: number[];
  /** People this board can assess in one sitting. */
  slotsPerSitting: number;
}

/**
 * Maharashtra told its district hospitals to reserve at least two days a week for
 * disability certificate verification. It is the only published cadence benchmark this
 * research found anywhere, so it is what districts are measured against here.
 */
export const RESERVED_DAYS_BENCHMARK = 2;

export const BOARD_SCHEDULES: BoardSchedule[] = [
  {
    district: "Bhopal",
    boardId: "MB-BHO-A",
    venue: "District Hospital, Bhopal",
    sittingDays: [2, 4],
    slotsPerSitting: 12
  },
  {
    district: "Indore",
    boardId: "MB-IND-B",
    venue: "District Hospital, Indore",
    sittingDays: [1, 3, 5],
    slotsPerSitting: 10
  },
  {
    district: "Jabalpur",
    boardId: "MB-JBP-A",
    venue: "District Hospital, Jabalpur",
    sittingDays: [2],
    slotsPerSitting: 8
  },
  {
    district: "Gwalior",
    boardId: "MB-GWL-A",
    venue: "District Hospital, Gwalior",
    sittingDays: [3],
    slotsPerSitting: 10
  },
  {
    district: "Rewa",
    boardId: "MB-REW-A",
    venue: "District Hospital, Rewa",
    sittingDays: [4],
    slotsPerSitting: 6
  },
  {
    district: "Sagar",
    boardId: "MB-SAG-A",
    venue: "District Hospital, Sagar",
    sittingDays: [1],
    slotsPerSitting: 8
  }
];

export const SCHEDULE_BY_DISTRICT = new Map(
  BOARD_SCHEDULES.map((schedule) => [schedule.district, schedule])
);

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export const DAY_NAMES_HINDI = [
  "रविवार",
  "सोमवार",
  "मंगलवार",
  "बुधवार",
  "गुरुवार",
  "शुक्रवार",
  "शनिवार"
];

export function sittingDayNames(
  schedule: BoardSchedule,
  locale: "en" | "hi" = "en"
): string[] {
  const names = locale === "hi" ? DAY_NAMES_HINDI : DAY_NAMES;
  return schedule.sittingDays.map((day) => names[day]);
}

/** People this board can see in a week, if it sits as published. */
export function weeklyCapacity(schedule: BoardSchedule): number {
  return schedule.sittingDays.length * schedule.slotsPerSitting;
}

/** True when the board sits less often than the one published benchmark we have. */
export function belowBenchmark(schedule: BoardSchedule): boolean {
  return schedule.sittingDays.length < RESERVED_DAYS_BENCHMARK;
}

/**
 * The next `count` dates this board sits, starting the day after `from`. Capped at two
 * years of searching — a board that does not sit inside two years is a different
 * problem, and the caller is told rather than left with a silently short list.
 */
export function nextSittings(
  schedule: BoardSchedule,
  from: Date = DEMO_NOW,
  count = 6
): Date[] {
  if (schedule.sittingDays.length === 0) return [];
  const dates: Date[] = [];
  let cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
  );
  cursor = addDays(cursor, 1);

  for (let day = 0; day < 730 && dates.length < count; day += 1) {
    if (schedule.sittingDays.includes(cursor.getUTCDay())) {
      dates.push(new Date(cursor));
    }
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export interface BoardForecast {
  /** One-based place in this district's board queue. */
  position: number;
  /** How many people are waiting for this board in total. */
  queueDepth: number;
  /** The sitting this person would be seen at, if the board sits as published. */
  expectedDate: Date | null;
  /** Sittings that have to happen first. */
  sittingsAhead: number;
  /** Whole weeks of backlog at the published rate. */
  backlogWeeks: number;
  /** True when the queue cannot be cleared inside the two-year search window. */
  beyondHorizon: boolean;
}

/**
 * When this person would be seen, if the board sits exactly as published.
 *
 * Deliberately a forecast and not a promise: it is arithmetic on a published cadence,
 * and the board page says so. An expected date that turns out wrong is still infinitely
 * more useful than no date at all, because a wrong date can be challenged.
 */
export function forecast(
  schedule: BoardSchedule,
  position: number,
  queueDepth: number,
  from: Date = DEMO_NOW
): BoardForecast {
  const capacity = weeklyCapacity(schedule);
  const backlogWeeks = capacity > 0 ? Math.ceil(queueDepth / capacity) : 0;

  if (position <= 0 || schedule.slotsPerSitting <= 0) {
    return {
      position,
      queueDepth,
      expectedDate: null,
      sittingsAhead: 0,
      backlogWeeks,
      beyondHorizon: false
    };
  }

  const sittingsAhead = Math.ceil(position / schedule.slotsPerSitting);
  const sittings = nextSittings(schedule, from, sittingsAhead);
  const expectedDate = sittings[sittingsAhead - 1] ?? null;

  return {
    position,
    queueDepth,
    expectedDate,
    sittingsAhead,
    backlogWeeks,
    beyondHorizon: expectedDate === null
  };
}

/** Days from now until a forecast date. */
export function daysUntil(date: Date, from: Date = DEMO_NOW): number {
  return Math.max(0, Math.round((date.getTime() - from.getTime()) / MS_PER_DAY));
}
