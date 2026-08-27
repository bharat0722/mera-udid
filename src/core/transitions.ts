import { isReasonCodeKey } from "./reasonCodes";
import { canTransition, isStageKey, requiresReasonCode } from "./stages";
import type {
  ActorRole,
  CaseEvent,
  CaseEventType,
  ReasonCodeKey,
  StageKey
} from "./types";

/**
 * Transition rules.
 *
 * This is where the central promise of the project is enforced. A return or a
 * rejection without a structured reason code is not discouraged here — it is refused.
 * The officer console cannot submit one, and neither can anything else: every write
 * into the case store goes through buildTransitionEvent.
 */

export type TransitionErrorCode =
  | "UNKNOWN_STAGE"
  | "ILLEGAL_TRANSITION"
  | "REASON_CODE_REQUIRED"
  | "REASON_CODE_NOT_ALLOWED"
  | "UNKNOWN_REASON_CODE"
  | "MERGE_TARGET_REQUIRED";

export class TransitionError extends Error {
  readonly code: TransitionErrorCode;

  constructor(code: TransitionErrorCode, message: string) {
    super(message);
    this.name = "TransitionError";
    this.code = code;
  }
}

export interface TransitionRequest {
  applicationId: string;
  /** The stage the case is moving into. There is no such thing as moving to nowhere. */
  toStage: StageKey;
  actorRole: ActorRole;
  actorId: string;
  type?: CaseEventType;
  reasonCode?: ReasonCodeKey | null;
  note?: string | null;
  payload?: Record<string, unknown> | null;
  /** ISO 8601. Defaults to the caller's supplied clock reading. */
  timestamp: string;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; code: TransitionErrorCode; message: string };

/** Which event type a move into a given stage produces. */
export function eventTypeForStage(toStage: StageKey): CaseEventType {
  switch (toStage) {
    case "RETURNED_FOR_DOCUMENT":
      return "RETURNED";
    case "REJECTED":
      return "REJECTED";
    case "WITHDRAWN":
      return "WITHDRAWN";
    case "DUPLICATE_MERGED":
      return "MERGED";
    default:
      return "STAGE_ENTERED";
  }
}

export function validateTransition(
  currentStage: StageKey | null,
  request: TransitionRequest
): ValidationResult {
  if (!isStageKey(request.toStage)) {
    return {
      ok: false,
      code: "UNKNOWN_STAGE",
      message: `"${String(request.toStage)}" is not a stage this system models.`
    };
  }

  if (!canTransition(currentStage, request.toStage)) {
    return {
      ok: false,
      code: "ILLEGAL_TRANSITION",
      message:
        currentStage === null
          ? `A new application must start in SUBMITTED, not ${request.toStage}.`
          : `${request.toStage} cannot follow ${currentStage}.`
    };
  }

  const needsReason = requiresReasonCode(request.toStage);
  const reason = request.reasonCode ?? null;

  if (needsReason && reason === null) {
    return {
      ok: false,
      code: "REASON_CODE_REQUIRED",
      message: `Moving a case to ${request.toStage} requires a structured reason code.`
    };
  }

  if (reason !== null && !isReasonCodeKey(reason)) {
    return {
      ok: false,
      code: "UNKNOWN_REASON_CODE",
      message: `"${String(reason)}" is not a reason code in the catalogue.`
    };
  }

  if (!needsReason && reason !== null) {
    return {
      ok: false,
      code: "REASON_CODE_NOT_ALLOWED",
      message: `A move to ${request.toStage} must not carry a reason code.`
    };
  }

  if (request.toStage === "DUPLICATE_MERGED") {
    const survivor = request.payload?.mergedInto;
    if (typeof survivor !== "string" || survivor.length === 0) {
      return {
        ok: false,
        code: "MERGE_TARGET_REQUIRED",
        message: "A merge must name the application that survives."
      };
    }
  }

  return { ok: true };
}

let eventCounter = 0;

/** Deterministic enough for a demo, unique enough for a Map key. */
export function nextEventId(applicationId: string): string {
  eventCounter += 1;
  return `${applicationId}-EV-${String(eventCounter).padStart(5, "0")}`;
}

/** Reset the counter so seeded data and tests produce stable ids. */
export function resetEventIds(): void {
  eventCounter = 0;
}

/**
 * Builds the event for a transition, or throws. There is no way to construct a stage
 * change that skips validation, which is what makes the rule structural rather than
 * a convention the next contributor might forget.
 */
export function buildTransitionEvent(
  currentStage: StageKey | null,
  request: TransitionRequest
): CaseEvent {
  const result = validateTransition(currentStage, request);
  if (!result.ok) {
    throw new TransitionError(result.code, result.message);
  }

  return {
    eventId: nextEventId(request.applicationId),
    applicationId: request.applicationId,
    timestamp: request.timestamp,
    type: request.type ?? eventTypeForStage(request.toStage),
    fromStage: currentStage,
    toStage: request.toStage,
    actorRole: request.actorRole,
    actorId: request.actorId,
    reasonCode: request.reasonCode ?? null,
    note: request.note ?? null,
    payload: request.payload ?? null
  };
}

export interface AnnotationRequest {
  applicationId: string;
  type: Extract<
    CaseEventType,
    | "DOCUMENT_ADDED"
    | "ASSESSMENT_RECORDED"
    | "APPEAL_LODGED"
    | "ESCALATED"
    | "NOTE_ADDED"
  >;
  actorRole: ActorRole;
  actorId: string;
  note?: string | null;
  payload?: Record<string, unknown> | null;
  timestamp: string;
}

/**
 * An event that records something without moving the case: a document arriving, an
 * assessment being written down, an appeal being lodged.
 */
export function buildAnnotationEvent(request: AnnotationRequest): CaseEvent {
  return {
    eventId: nextEventId(request.applicationId),
    applicationId: request.applicationId,
    timestamp: request.timestamp,
    type: request.type,
    fromStage: null,
    toStage: null,
    actorRole: request.actorRole,
    actorId: request.actorId,
    reasonCode: null,
    note: request.note ?? null,
    payload: request.payload ?? null
  };
}

/**
 * A Karnataka Health Commissioner circular of 31 July 2024 had to order hospitals to
 * stop refusing cards to people assessed below 40% disability, because the RPwD Act
 * imposes no such condition. There is deliberately no percentage threshold anywhere in
 * this codebase; this function exists so that the absence is explicit and testable.
 */
export function assessmentBlocksCertificate(_assessedPercentage: number): boolean {
  return false;
}
