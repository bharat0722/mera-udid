import { describe, expect, it } from "vitest";
import {
  BOARD_SCHEDULES,
  belowBenchmark,
  forecast,
  nextSittings,
  RESERVED_DAYS_BENCHMARK,
  SCHEDULE_BY_DISTRICT,
  weeklyCapacity
} from "../core/boardSchedule";
import { DEMO_NOW } from "../core/clock";

/**
 * The board calendar is the piece that turns "you are 47th" into "your date is the
 * 14th". These tests pin the arithmetic, because a wrong date shown confidently to a
 * disabled applicant who then travels to a hospital is a worse outcome than no date.
 */

const bhopal = SCHEDULE_BY_DISTRICT.get("Bhopal")!;
const jabalpur = SCHEDULE_BY_DISTRICT.get("Jabalpur")!;

describe("board schedule", () => {
  it("only ever offers dates the board actually sits on", () => {
    for (const schedule of BOARD_SCHEDULES) {
      for (const date of nextSittings(schedule, DEMO_NOW, 10)) {
        expect(schedule.sittingDays).toContain(date.getUTCDay());
      }
    }
  });

  it("never offers a date in the past", () => {
    for (const date of nextSittings(bhopal, DEMO_NOW, 6)) {
      expect(date.getTime()).toBeGreaterThan(DEMO_NOW.getTime());
    }
  });

  it("returns sittings in order, with no repeats", () => {
    const dates = nextSittings(bhopal, DEMO_NOW, 8).map((d) => d.getTime());
    expect(dates).toEqual([...dates].sort((a, b) => a - b));
    expect(new Set(dates).size).toBe(dates.length);
  });

  it("computes weekly capacity from sitting days and slots", () => {
    // Bhopal sits twice a week, twelve people a sitting.
    expect(weeklyCapacity(bhopal)).toBe(24);
    expect(weeklyCapacity(jabalpur)).toBe(8);
  });

  it("flags a district that sits less often than the published benchmark", () => {
    expect(RESERVED_DAYS_BENCHMARK).toBe(2);
    expect(belowBenchmark(bhopal)).toBe(false);
    expect(belowBenchmark(jabalpur)).toBe(true);
  });
});

describe("board forecast", () => {
  it("puts the first person in the queue at the very next sitting", () => {
    const result = forecast(bhopal, 1, 50);
    const [firstSitting] = nextSittings(bhopal, DEMO_NOW, 1);

    expect(result.sittingsAhead).toBe(1);
    expect(result.expectedDate?.toISOString()).toBe(firstSitting.toISOString());
  });

  it("fills a sitting completely before moving to the next one", () => {
    // Twelve slots a sitting: places 1-12 land on the first, 13 on the second.
    expect(forecast(bhopal, 12, 50).sittingsAhead).toBe(1);
    expect(forecast(bhopal, 13, 50).sittingsAhead).toBe(2);
    expect(forecast(bhopal, 25, 50).sittingsAhead).toBe(3);
  });

  it("gives a later date to a district that sits less often", () => {
    const fast = forecast(bhopal, 40, 40).expectedDate!;
    const slow = forecast(jabalpur, 40, 40).expectedDate!;

    expect(slow.getTime()).toBeGreaterThan(fast.getTime());
  });

  it("reports the backlog in whole weeks at the published rate", () => {
    // 48 waiting against 24 a week is two weeks.
    expect(forecast(bhopal, 1, 48).backlogWeeks).toBe(2);
    // 48 waiting against 8 a week is six.
    expect(forecast(jabalpur, 1, 48).backlogWeeks).toBe(6);
  });

  it("says so rather than guessing when the queue cannot clear in two years", () => {
    // Far beyond anything two years of sittings can absorb.
    const result = forecast(jabalpur, 100000, 100000);

    expect(result.expectedDate).toBeNull();
    expect(result.beyondHorizon).toBe(true);
  });

  it("does not invent a date for someone who is not in a queue", () => {
    expect(forecast(bhopal, 0, 0).expectedDate).toBeNull();
  });
});
