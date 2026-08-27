import type { Application, CaseEvent, StageKey } from "./types";
import { DEMO_NOW } from "./clock";
import { isReasonCodeKey } from "./reasonCodes";
import { ALL_STAGE_KEYS, ALLOWED_TRANSITIONS, isStageKey } from "./stages";

/**
 * RECONCILIATION ENGINE — reserved for implementation by Codex.
 *
 * ---------------------------------------------------------------------------
 * DO NOT IMPLEMENT THIS FILE. It is the reserved component described in
 * CODEX-HANDOFF.md. Everything else in src/core is built; this is not, and the
 * handoff is only real if it stays that way.
 * ---------------------------------------------------------------------------
 *
 * Purpose: guarantee that every application is in exactly one modelled stage, and that
 * the stage counts always sum to total applications received. In the real UDID system,
 * a written reply in the Rajya Sabha reported 1,15,63,288 applications received since
 * 2021, against 87,62,115 cards generated, 8,24,951 rejected and 9,63,606 pending —
 * 1,05,50,672 accounted for, leaving 10,12,616 applications in no column at all. This
 * engine makes that state unreachable.
 *
 * ## Interface contract
 *
 * `reconcile(applications, events, options?) => ReconciliationReport`
 *
 * Pure. No I/O, no clock reads beyond `options.asOf`, no mutation of either argument.
 * Given the same inputs it must return the same report, because the report is evidence
 * and evidence that changes between runs is worthless.
 *
 * ### Inputs
 * - `applications` — every application the system has ever received, including ones
 *   whose event log is broken or empty. The caller does not pre-filter.
 * - `events` — the complete, unsorted event log across all applications. Events for
 *   applications that are not in `applications` may appear; they are themselves an
 *   anomaly (type `EVENT_WITHOUT_APPLICATION`) and must be reported, not dropped.
 * - `options.asOf` — the instant the report is generated. Defaults to the pinned demo
 *   clock in `./clock`.
 *
 * ### Output invariants — all six must hold on every returned report
 * 1. `totalReceived === applications.length`.
 * 2. `countsByStage` has a key for **every** StageKey in `ALL_STAGE_KEYS`, even when
 *    the count is zero. A missing key is a hidden column, which is the original defect.
 * 3. `totalAccounted === sum(values(countsByStage))`.
 * 4. `gap === totalReceived - totalAccounted`, and `isBalanced === (gap === 0)`.
 * 5. Every application appears exactly once across `countsByStage` and `orphans`
 *    combined — never in both, never in neither.
 * 6. `orphans` and `anomalies` are sorted by `applicationId` so two runs diff cleanly.
 *
 * ### Required detections
 * - `NO_STAGE_EVENTS` — an application with no stage events at all.
 * - `UNKNOWN_STAGE` — the latest event points at a stage key this system does not model.
 * - `CONTRADICTORY_HISTORY` — the log places the application in two active stages at
 *   once (for example two stage events sharing the newest timestamp with different
 *   `toStage` values).
 * - `MISSING_REASON_CODE` — a transition into RETURNED_FOR_DOCUMENT or REJECTED with
 *   no reason code, or with a code not in the catalogue.
 * - `UNREACHABLE_TRANSITION` — a transition to a stage that cannot legally follow the
 *   previous one, per `ALLOWED_TRANSITIONS` in ./stages.
 * - `EVENT_WITHOUT_APPLICATION` — events referencing an applicationId with no record.
 * - `ARITHMETIC_MISMATCH` — any residual difference between received and accounted for.
 *
 * ### Required behaviour
 * The report must never silently omit an application. If it cannot be classified, it
 * appears in `orphans` with a stated `detectedProblem`. Absence of evidence is never
 * treated as evidence of absence: an application with no events is *not* "probably
 * submitted", it is an orphan, and it is named.
 *
 * An application may be both counted and anomalous — an anomaly describes a defect in
 * the history, an orphan describes an application that cannot be placed at all. Only
 * orphans are excluded from `countsByStage`.
 *
 * See CODEX-HANDOFF.md for how to run the specification suite, and
 * src/tests/reconciliation.test.ts for the executable definition of "done".
 */

export type OrphanProblem =
  | "NO_STAGE_EVENTS"
  | "UNKNOWN_STAGE"
  | "CONTRADICTORY_HISTORY";

export type AnomalyType =
  | "MISSING_REASON_CODE"
  | "UNREACHABLE_TRANSITION"
  | "EVENT_WITHOUT_APPLICATION"
  | "CONTRADICTORY_HISTORY"
  | "ARITHMETIC_MISMATCH";

export interface ReconciliationOrphan {
  applicationId: string;
  /** The most recent event on the application, or null when there are none. */
  lastKnownEvent: CaseEvent | null;
  detectedProblem: OrphanProblem;
  /** One plain sentence a non-technical reader can act on. */
  detail: string;
}

export interface ReconciliationAnomaly {
  applicationId: string;
  type: AnomalyType;
  detail: string;
  /** The event that carries the defect, where a single event is responsible. */
  event: CaseEvent | null;
}

export interface ReconciliationReport {
  totalReceived: number;
  /** Every StageKey present, including zeroes. */
  countsByStage: Record<StageKey, number>;
  totalAccounted: number;
  /** totalReceived - totalAccounted. MUST be 0 in a healthy system. */
  gap: number;
  isBalanced: boolean;
  orphans: ReconciliationOrphan[];
  anomalies: ReconciliationAnomaly[];
  /** ISO 8601. */
  generatedAt: string;
}

export interface ReconcileOptions {
  asOf?: Date;
}

export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

/**
 * Reserved for Codex. See the contract above and CODEX-HANDOFF.md.
 */
export function reconcile(
  applications: ReadonlyArray<Application>,
  events: ReadonlyArray<CaseEvent>,
  options: ReconcileOptions = {}
): ReconciliationReport {
  const countsByStage = Object.fromEntries(
    ALL_STAGE_KEYS.map((stage) => [stage, 0])
  ) as Record<StageKey, number>;
  const registeredIds = new Set(applications.map((application) => application.applicationId));
  const eventsByApplication = new Map<string, CaseEvent[]>();
  const orphans: ReconciliationOrphan[] = [];
  const anomalies: ReconciliationAnomaly[] = [];

  for (const event of events) {
    const applicationEvents = eventsByApplication.get(event.applicationId);
    if (applicationEvents === undefined) {
      eventsByApplication.set(event.applicationId, [event]);
    } else {
      applicationEvents.push(event);
    }

    if (!registeredIds.has(event.applicationId)) {
      anomalies.push({
        applicationId: event.applicationId,
        type: "EVENT_WITHOUT_APPLICATION",
        detail: "This event refers to an application that is not in the register.",
        event
      });
    }
  }

  for (const application of applications) {
    const applicationEvents = sortEvents(eventsByApplication.get(application.applicationId) ?? []);
    const moves = applicationEvents.filter((event) => event.toStage !== null);
    const lastKnownEvent = applicationEvents.at(-1) ?? null;
    let orphan: ReconciliationOrphan | null = null;

    if (moves.length === 0) {
      orphan = {
        applicationId: application.applicationId,
        lastKnownEvent,
        detectedProblem: "NO_STAGE_EVENTS",
        detail: "No stage-changing event is recorded for this application."
      };
    } else {
      const latestMove = moves.at(-1)!;
      const latestMoves = moves.filter((event) => event.timestamp === latestMove.timestamp);
      const latestStages = new Set(latestMoves.map((event) => event.toStage));

      if (latestStages.size > 1) {
        orphan = {
          applicationId: application.applicationId,
          lastKnownEvent,
          detectedProblem: "CONTRADICTORY_HISTORY",
          detail: "The newest stage events place this application in more than one stage."
        };
      } else if (!isStageKey(latestMove.toStage)) {
        orphan = {
          applicationId: application.applicationId,
          lastKnownEvent,
          detectedProblem: "UNKNOWN_STAGE",
          detail: "The newest stage event names a stage this system does not model."
        };
      } else {
        countsByStage[latestMove.toStage] += 1;
      }
    }

    if (orphan !== null) {
      orphans.push(orphan);
      continue;
    }

    for (const event of moves) {
      if (!isStageKey(event.toStage)) continue;

      if (requiresReason(event) && !isReasonCodeKey(event.reasonCode)) {
        anomalies.push({
          applicationId: application.applicationId,
          type: "MISSING_REASON_CODE",
          detail: "This return or rejection has no valid reason code.",
          event
        });
      }

      if (!isAllowedTransition(event)) {
        anomalies.push({
          applicationId: application.applicationId,
          type: "UNREACHABLE_TRANSITION",
          detail: "This stage transition is not permitted by the stage graph.",
          event
        });
      }
    }
  }

  orphans.sort((left, right) => left.applicationId.localeCompare(right.applicationId));
  anomalies.sort(compareAnomalies);

  const totalReceived = applications.length;
  const totalAccounted = ALL_STAGE_KEYS.reduce(
    (total, stage) => total + countsByStage[stage],
    0
  );
  const gap = totalReceived - totalAccounted;

  return {
    totalReceived,
    countsByStage,
    totalAccounted,
    gap,
    isBalanced: gap === 0,
    orphans,
    anomalies,
    generatedAt: (options.asOf ?? DEMO_NOW).toISOString()
  };
}

/**
 * Convenience wrapper for the admin dashboard: true when the report balances.
 * Reserved for Codex alongside reconcile().
 */
export function isReconciled(
  applications: ReadonlyArray<Application>,
  events: ReadonlyArray<CaseEvent>
): boolean {
  return reconcile(applications, events).isBalanced;
}

/** Sort a copy so caller-owned event arrays remain untouched. */
function sortEvents(events: ReadonlyArray<CaseEvent>): CaseEvent[] {
  return [...events].sort(
    (left, right) =>
      left.timestamp.localeCompare(right.timestamp) || left.eventId.localeCompare(right.eventId)
  );
}

function requiresReason(event: CaseEvent): boolean {
  return event.toStage === "RETURNED_FOR_DOCUMENT" || event.toStage === "REJECTED";
}

function isAllowedTransition(event: CaseEvent): boolean {
  if (event.toStage === null || !isStageKey(event.toStage)) return true;
  if (event.fromStage === null) return event.toStage === "SUBMITTED";
  return isStageKey(event.fromStage) && ALLOWED_TRANSITIONS[event.fromStage].includes(event.toStage);
}

function compareAnomalies(
  left: ReconciliationAnomaly,
  right: ReconciliationAnomaly
): number {
  return (
    left.applicationId.localeCompare(right.applicationId) ||
    left.type.localeCompare(right.type) ||
    (left.event?.timestamp ?? "").localeCompare(right.event?.timestamp ?? "") ||
    (left.event?.eventId ?? "").localeCompare(right.event?.eventId ?? "")
  );
}
