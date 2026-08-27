import { useMemo } from "react";
import { daysBetween } from "../core/clock";
import {
  BOARD_SCHEDULES,
  SCHEDULE_BY_DISTRICT,
  weeklyCapacity,
  type BoardSchedule
} from "../core/boardSchedule";
import { enteredStageAt } from "../core/projections";
import { queueAnchorAt } from "../core/queue";
import { useAllCaseViews } from "./useCases";

/**
 * Board queues, derived from the same event log as everything else.
 *
 * Nothing here is stored. The queue is "who is currently in BOARD_SCHEDULED in this
 * district, in the order they arrived", and the order is the queue anchor — so an
 * applicant whose place was protected after an administrative return keeps it here too,
 * rather than silently losing it at the one stage where losing it costs the most.
 */

export interface DistrictBoardStats {
  schedule: BoardSchedule;
  /** People waiting for this board right now. */
  queueDepth: number;
  /** People still at document checking who will join this queue next. */
  upstream: number;
  /** Weekly capacity if the board sits exactly as published. */
  capacity: number;
  /** Median days already waited by the people currently in the queue. */
  medianWaitingDays: number;
  /**
   * Median days actually taken at the board by cases that got through it. This is the
   * number to hold the published cadence against: if the calendar says four weeks and
   * this says thirty, the board is not sitting as published, and now that is visible.
   */
  medianClearedDays: number;
  /** How many cases the cleared median is computed from. */
  clearedCount: number;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function useBoardStats(): DistrictBoardStats[] {
  const views = useAllCaseViews();

  return useMemo(() => {
    return BOARD_SCHEDULES.map((schedule) => {
      const inDistrict = views.filter(
        (view) => view.application.applicant.district === schedule.district
      );

      const waiting = inDistrict.filter((view) => view.currentStage === "BOARD_SCHEDULED");
      const upstream = inDistrict.filter(
        (view) => view.currentStage === "DOC_VERIFICATION"
      );

      const cleared = inDistrict
        .map((view) => {
          const arrived = enteredStageAt(view.events, "BOARD_SCHEDULED");
          const assessed = enteredStageAt(view.events, "BOARD_ASSESSED");
          if (!arrived || !assessed) return null;
          return daysBetween(arrived, new Date(assessed));
        })
        .filter((value): value is number => value !== null);

      return {
        schedule,
        queueDepth: waiting.length,
        upstream: upstream.length,
        capacity: weeklyCapacity(schedule),
        medianWaitingDays: median(waiting.map((view) => view.daysInStage)),
        medianClearedDays: median(cleared),
        clearedCount: cleared.length
      };
    });
  }, [views]);
}

export interface BoardPlace {
  schedule: BoardSchedule;
  /** One-based place in the district's board queue. */
  position: number;
  queueDepth: number;
}

/**
 * Where one application sits in its district's board queue. Returns null when the
 * district has no published board, which is itself worth saying out loud rather than
 * hiding behind a blank space.
 */
export function useBoardPlace(applicationId: string | null): BoardPlace | null {
  const views = useAllCaseViews();

  return useMemo(() => {
    if (!applicationId) return null;
    const self = views.find(
      (view) => view.application.applicationId === applicationId
    );
    if (!self) return null;

    const schedule = SCHEDULE_BY_DISTRICT.get(self.application.applicant.district);
    if (!schedule) return null;

    const queue = views
      .filter(
        (view) =>
          view.application.applicant.district === schedule.district &&
          view.currentStage === "BOARD_SCHEDULED"
      )
      .map((view) => ({
        applicationId: view.application.applicationId,
        anchorAt: queueAnchorAt(view.application, view.events)
      }))
      .sort(
        (a, b) =>
          a.anchorAt.localeCompare(b.anchorAt) ||
          a.applicationId.localeCompare(b.applicationId)
      );

    const index = queue.findIndex((entry) => entry.applicationId === applicationId);

    return {
      schedule,
      // A case not yet at the board joins the back of the queue.
      position: index === -1 ? queue.length + 1 : index + 1,
      queueDepth: queue.length
    };
  }, [views, applicationId]);
}
