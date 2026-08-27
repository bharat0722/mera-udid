import { beforeEach, describe, expect, it } from "vitest";
import { DEMO_NOW, addDays, toIso } from "../core/clock";
import {
  assessmentBlocksCertificate,
  buildTransitionEvent,
  resetEventIds,
  TransitionError,
  validateTransition
} from "../core/transitions";
import { ALLOWED_TRANSITIONS, canTransition, TOTAL_SLA_DAYS } from "../core/stages";
import { REASON_CODES } from "../core/reasonCodes";
import type { StageKey } from "../core/types";

const baseRequest = {
  applicationId: "UDID-TEST-0001",
  actorRole: "SW_OFFICER" as const,
  actorId: "SWO-TEST-01",
  timestamp: toIso(DEMO_NOW)
};

describe("state machine", () => {
  beforeEach(() => {
    resetEventIds();
  });

  it("starts every application in SUBMITTED and nowhere else", () => {
    expect(canTransition(null, "SUBMITTED")).toBe(true);
    expect(canTransition(null, "DOC_VERIFICATION")).toBe(false);
    expect(canTransition(null, "CARD_GENERATED")).toBe(false);
  });

  it("refuses a return that carries no reason code", () => {
    const result = validateTransition("DOC_VERIFICATION", {
      ...baseRequest,
      toStage: "RETURNED_FOR_DOCUMENT"
    });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.code).toBe("REASON_CODE_REQUIRED");
  });

  it("refuses a rejection that carries no reason code", () => {
    expect(() =>
      buildTransitionEvent("BOARD_ASSESSED", {
        ...baseRequest,
        toStage: "REJECTED"
      })
    ).toThrow(TransitionError);
  });

  it("accepts a return that names a code from the catalogue", () => {
    const event = buildTransitionEvent("DOC_VERIFICATION", {
      ...baseRequest,
      toStage: "RETURNED_FOR_DOCUMENT",
      reasonCode: "DOC_ILLEGIBLE"
    });

    expect(event.type).toBe("RETURNED");
    expect(event.reasonCode).toBe("DOC_ILLEGIBLE");
    expect(event.fromStage).toBe("DOC_VERIFICATION");
  });

  it("refuses a reason code that is not in the catalogue", () => {
    const result = validateTransition("DOC_VERIFICATION", {
      ...baseRequest,
      toStage: "RETURNED_FOR_DOCUMENT",
      // deliberately not a catalogue key
      reasonCode: "OFFICER_DID_NOT_LIKE_IT" as never
    });

    expect(result.ok === false && result.code).toBe("UNKNOWN_REASON_CODE");
  });

  it("refuses a reason code on a stage that must not have one", () => {
    const result = validateTransition("DOC_VERIFICATION", {
      ...baseRequest,
      toStage: "BOARD_SCHEDULED",
      reasonCode: "DOC_ILLEGIBLE"
    });

    expect(result.ok === false && result.code).toBe("REASON_CODE_NOT_ALLOWED");
  });

  it("refuses a jump that the transition graph does not allow", () => {
    const result = validateTransition("SUBMITTED", {
      ...baseRequest,
      toStage: "CERTIFICATE_ISSUED"
    });

    expect(result.ok === false && result.code).toBe("ILLEGAL_TRANSITION");
  });

  it("refuses a merge that does not name the surviving application", () => {
    const result = validateTransition("DOC_VERIFICATION", {
      ...baseRequest,
      toStage: "DUPLICATE_MERGED"
    });

    expect(result.ok === false && result.code).toBe("MERGE_TARGET_REQUIRED");
  });

  it("lets a returned case go back to the desk that returned it", () => {
    expect(canTransition("RETURNED_FOR_DOCUMENT", "DOC_VERIFICATION")).toBe(true);
    expect(canTransition("RETURNED_FOR_DOCUMENT", "BOARD_SCHEDULED")).toBe(true);
  });

  it("treats terminal stages as terminal", () => {
    const terminal: StageKey[] = ["CARD_GENERATED", "REJECTED", "WITHDRAWN", "DUPLICATE_MERGED"];
    for (const stage of terminal) {
      expect(ALLOWED_TRANSITIONS[stage]).toEqual([]);
    }
  });

  it("records an actor and a timestamp on every transition", () => {
    const event = buildTransitionEvent("BOARD_SCHEDULED", {
      ...baseRequest,
      actorRole: "MEDICAL_BOARD",
      actorId: "MB-BHO-A",
      toStage: "BOARD_ASSESSED",
      timestamp: toIso(addDays(DEMO_NOW, -1))
    });

    expect(event.actorRole).toBe("MEDICAL_BOARD");
    expect(event.actorId).toBe("MB-BHO-A");
    expect(event.timestamp).toBe(toIso(addDays(DEMO_NOW, -1)));
  });

  it("never blocks a certificate on an assessed percentage below 40", () => {
    // A Karnataka circular of 31 July 2024 had to order hospitals to stop doing this.
    for (const percentage of [0, 10, 25, 39, 39.9, 40, 75, 100]) {
      expect(assessmentBlocksCertificate(percentage)).toBe(false);
    }
    expect(canTransition("BOARD_ASSESSED", "CERTIFICATE_ISSUED")).toBe(true);
  });

  it("proposes a 40-day total against the 253-day Madhya Pradesh average", () => {
    expect(TOTAL_SLA_DAYS).toBe(40);
  });

  it("gives every reason code a plain-language sentence and a fix action", () => {
    for (const code of Object.values(REASON_CODES)) {
      expect(code.plainEnglish.length).toBeGreaterThan(10);
      expect(code.plainHindi.length).toBeGreaterThan(5);
      expect(code.fixAction.length).toBeGreaterThan(10);
      expect(code.fixActionHindi.length).toBeGreaterThan(5);
    }
  });
});
