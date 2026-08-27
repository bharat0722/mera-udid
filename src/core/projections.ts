import { daysBetween, DEMO_NOW } from "./clock";
import { getReasonCode, isReasonCodeKey } from "./reasonCodes";
import {
  ACTIVE_STAGE_ORDER,
  getStage,
  isStageKey,
  STAGE_DEFINITIONS
} from "./stages";
import type {
  Application,
  CaseEvent,
  ReasonCode,
  StageDefinition,
  StageKey
} from "./types";

/**
 * Projections: everything the screens need, derived from the event log.
 *
 * Nothing in this file mutates anything. If a screen wants to know where a case is,
 * how long it has been there or who is holding it, it asks here — it never reads a
 * stored status column, because there isn't one.
 */

export type StepState = "done" | "current" | "upcoming" | "blocked" | "rejected";

export interface TimelineStep {
  key: StageKey;
  state: StepState;
  /** ISO 8601, or null for a stage the case has not reached. */
  enteredAt: string | null;
}

export interface NextStep {
  text: string;
  textHindi: string;
  /** ISO 8601 where a concrete date exists. */
  date: string | null;
}

export interface CaseView {
  application: Application;
  events: CaseEvent[];
  currentStage: StageKey;
  stageDefinition: StageDefinition;
  enteredCurrentStageAt: string;
  daysInStage: number;
  slaDays: number;
  isBreached: boolean;
  daysOverTarget: number;
  totalDaysSinceSubmission: number;
  /** Set while the case sits in RETURNED_FOR_DOCUMENT or REJECTED. */
  activeReason: ReasonCode | null;
  activeReasonEvent: CaseEvent | null;
  /** null when no reason is active. */
  queuePositionPreserved: boolean | null;
  nextStep: NextStep | null;
  steps: TimelineStep[];
  /** ISO 8601 — 90 days from rejection, under RPwD Act 2016 s.59. */
  appealDeadline: string | null;
  hasAppealed: boolean;
  isComplete: boolean;
}

/** Events that move the case, oldest first. */
export function stageEvents(events: CaseEvent[]): CaseEvent[] {
  return events
    .filter((event) => event.toStage !== null)
    .slice()
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function sortedEvents(events: CaseEvent[]): CaseEvent[] {
  return events.slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/**
 * Where the case is now. Returns null when the log cannot say — no stage events at
 * all, or a latest event pointing at a stage this system does not model. Returning
 * null rather than guessing is deliberate: an unclassifiable case must surface in the
 * reconciliation report, not be quietly rounded to the nearest plausible stage.
 */
export function deriveCurrentStage(events: CaseEvent[]): StageKey | null {
  const moves = stageEvents(events);
  if (moves.length === 0) return null;
  const latest = moves[moves.length - 1].toStage;
  if (!isStageKey(latest)) return null;
  return latest;
}

export function enteredStageAt(events: CaseEvent[], stage: StageKey): string | null {
  const moves = stageEvents(events);
  for (let i = moves.length - 1; i >= 0; i -= 1) {
    if (moves[i].toStage === stage) return moves[i].timestamp;
  }
  return null;
}

export function daysInCurrentStage(events: CaseEvent[], asOf: Date = DEMO_NOW): number {
  const stage = deriveCurrentStage(events);
  if (stage === null) return 0;
  const entered = enteredStageAt(events, stage);
  return entered === null ? 0 : daysBetween(entered, asOf);
}

export function isSlaBreached(events: CaseEvent[], asOf: Date = DEMO_NOW): boolean {
  const stage = deriveCurrentStage(events);
  if (stage === null) return false;
  const definition = getStage(stage);
  if (definition.isTerminal) return false;
  return daysInCurrentStage(events, asOf) > definition.slaDays;
}

/**
 * The vertical stepper model.
 *
 * The six happy-path stages are always shown, so the applicant can see the whole road
 * rather than only the bit they have travelled. When the case is in an exception stage
 * the exception is spliced in at the point it happened, and the stages beyond it stay
 * visible as "not started".
 */
export function buildTimeline(events: CaseEvent[]): TimelineStep[] {
  const current = deriveCurrentStage(events);
  const reachedIndex = ACTIVE_STAGE_ORDER.reduce((furthest, key, index) => {
    return enteredStageAt(events, key) !== null ? index : furthest;
  }, -1);

  const currentIndexOnPath = current === null ? -1 : ACTIVE_STAGE_ORDER.indexOf(current);

  const steps: TimelineStep[] = ACTIVE_STAGE_ORDER.map((key, index) => {
    const enteredAt = enteredStageAt(events, key);
    let state: StepState = "upcoming";
    if (index === currentIndexOnPath) {
      // The final stage is an arrival, not a wait, so it reads as done.
      state = key === "CARD_GENERATED" ? "done" : "current";
    } else if (enteredAt !== null && index <= reachedIndex) {
      state = "done";
    }
    return { key, state, enteredAt };
  });

  if (current === null || currentIndexOnPath >= 0) return steps;

  // An exception stage: splice it in immediately after the furthest stage reached.
  const exceptionStep: TimelineStep = {
    key: current,
    state: current === "REJECTED" ? "rejected" : "blocked",
    enteredAt: enteredStageAt(events, current)
  };
  const insertAt = reachedIndex + 1;
  const withException = steps.slice();
  withException.splice(insertAt, 0, exceptionStep);
  return withException;
}

function findActiveReasonEvent(events: CaseEvent[]): CaseEvent | null {
  const moves = stageEvents(events);
  const latest = moves[moves.length - 1];
  if (!latest) return null;
  if (latest.toStage !== "RETURNED_FOR_DOCUMENT" && latest.toStage !== "REJECTED") {
    return null;
  }
  return latest;
}

function deriveNextStep(
  stage: StageKey,
  events: CaseEvent[],
  reason: ReasonCode | null
): NextStep | null {
  const moves = stageEvents(events);
  const latest = moves[moves.length - 1];

  switch (stage) {
    case "SUBMITTED":
      return {
        text: "The district office will pick up your file for document checking.",
        textHindi: "जिला कार्यालय आपकी फ़ाइल दस्तावेज़ जाँच के लिए उठाएगा।",
        date: null
      };
    case "DOC_VERIFICATION":
      return {
        text: "An officer will confirm your documents, then book your medical board date.",
        textHindi: "अधिकारी दस्तावेज़ जाँचकर आपकी मेडिकल बोर्ड तारीख तय करेगा।",
        date: null
      };
    case "BOARD_SCHEDULED": {
      const appointment = latest?.payload?.appointmentDate;
      return {
        text: "Attend the medical board appointment. Carry the originals of every document.",
        textHindi: "मेडिकल बोर्ड की तारीख पर पहुँचें। सभी दस्तावेज़ों के मूल साथ लाएँ।",
        date: typeof appointment === "string" ? appointment : null
      };
    }
    case "BOARD_ASSESSED":
      return {
        text: "The district office will turn the assessment into your certificate.",
        textHindi: "जिला कार्यालय आकलन को आपके प्रमाणपत्र में बदलेगा।",
        date: null
      };
    case "CERTIFICATE_ISSUED":
      return {
        text: "Your card is being generated. Nothing is needed from you.",
        textHindi: "आपका कार्ड बन रहा है। आपको कुछ नहीं करना है।",
        date: null
      };
    case "CARD_GENERATED":
      return null;
    case "RETURNED_FOR_DOCUMENT":
      return reason
        ? { text: reason.fixAction, textHindi: reason.fixActionHindi, date: null }
        : null;
    case "REJECTED":
      return reason && reason.isAppealable
        ? {
            text: "You can appeal this decision within 90 days.",
            textHindi: "आप इस निर्णय के विरुद्ध 90 दिन में अपील कर सकते हैं।",
            date: null
          }
        : null;
    default:
      return null;
  }
}

/**
 * The full view model for one case. Returns null when the event log cannot place the
 * application in a modelled stage — the caller must handle that case honestly rather
 * than showing a plausible-looking status.
 */
export function projectCase(
  application: Application,
  events: CaseEvent[],
  asOf: Date = DEMO_NOW
): CaseView | null {
  const currentStage = deriveCurrentStage(events);
  if (currentStage === null) return null;

  const stageDefinition = STAGE_DEFINITIONS[currentStage];
  const enteredCurrentStageAt =
    enteredStageAt(events, currentStage) ?? application.createdAt;
  const daysInStage = daysBetween(enteredCurrentStageAt, asOf);
  const slaDays = stageDefinition.slaDays;
  const isBreached = !stageDefinition.isTerminal && daysInStage > slaDays;

  const reasonEvent = findActiveReasonEvent(events);
  const reasonKey = reasonEvent?.reasonCode ?? null;
  const activeReason =
    reasonKey !== null && isReasonCodeKey(reasonKey) ? getReasonCode(reasonKey) : null;

  const appealDeadline =
    currentStage === "REJECTED" && reasonEvent
      ? new Date(
          new Date(reasonEvent.timestamp).getTime() + 90 * 24 * 60 * 60 * 1000
        ).toISOString()
      : null;

  return {
    application,
    events: sortedEvents(events),
    currentStage,
    stageDefinition,
    enteredCurrentStageAt,
    daysInStage,
    slaDays,
    isBreached,
    daysOverTarget: Math.max(0, daysInStage - slaDays),
    totalDaysSinceSubmission: daysBetween(application.createdAt, asOf),
    activeReason,
    activeReasonEvent: reasonEvent,
    queuePositionPreserved: activeReason ? activeReason.preservesQueuePosition : null,
    nextStep: deriveNextStep(currentStage, events, activeReason),
    steps: buildTimeline(events),
    appealDeadline,
    hasAppealed: events.some((event) => event.type === "APPEAL_LODGED"),
    isComplete: currentStage === "CARD_GENERATED"
  };
}
