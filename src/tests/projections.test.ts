import { describe, expect, it } from "vitest";
import { addDays, DEMO_NOW, formatIndianNumber, toIso } from "../core/clock";
import {
  buildTimeline,
  daysInCurrentStage,
  deriveCurrentStage,
  isSlaBreached,
  projectCase
} from "../core/projections";
import { queueAnchorAt, queuePosition } from "../core/queue";
import { runPrecheck } from "../core/precheck";
import { generateDataset } from "../data/generator";
import type { Application, CaseEvent, StageKey } from "../core/types";

function application(id: string, createdDaysAgo: number): Application {
  return {
    applicationId: id,
    applicant: {
      name: "Test Person",
      age: 34,
      gender: "female",
      district: "Bhopal",
      state: "Madhya Pradesh",
      disabilityType: "LOCOMOTOR",
      contactPhone: "+91 00000 00001"
    },
    documents: [],
    createdAt: toIso(addDays(DEMO_NOW, -createdDaysAgo)),
    identityMethod: "DOCUMENT_ONLY",
    assistedBy: null
  };
}

function stageEvent(
  id: string,
  toStage: StageKey,
  fromStage: StageKey | null,
  daysAgo: number,
  reasonCode: CaseEvent["reasonCode"] = null
): CaseEvent {
  return {
    eventId: `${id}-${toStage}-${daysAgo}`,
    applicationId: id,
    timestamp: toIso(addDays(DEMO_NOW, -daysAgo)),
    type: reasonCode ? "RETURNED" : "STAGE_ENTERED",
    fromStage,
    toStage,
    actorRole: "SW_OFFICER",
    actorId: "SWO-TEST",
    reasonCode,
    note: null,
    payload: null
  };
}

describe("projections", () => {
  it("derives the current stage from the newest stage event", () => {
    const events = [
      stageEvent("A", "SUBMITTED", null, 30),
      stageEvent("A", "DOC_VERIFICATION", "SUBMITTED", 29),
      stageEvent("A", "BOARD_SCHEDULED", "DOC_VERIFICATION", 20)
    ];

    expect(deriveCurrentStage(events)).toBe("BOARD_SCHEDULED");
    expect(daysInCurrentStage(events)).toBe(20);
  });

  it("refuses to guess a stage when the log cannot say", () => {
    expect(deriveCurrentStage([])).toBeNull();
    expect(projectCase(application("B", 10), [])).toBeNull();
  });

  it("flags a breach only once the stage runs past its target", () => {
    const within = [
      stageEvent("C", "SUBMITTED", null, 25),
      stageEvent("C", "BOARD_SCHEDULED", "DOC_VERIFICATION", 20)
    ];
    const over = [
      stageEvent("D", "SUBMITTED", null, 90),
      stageEvent("D", "BOARD_SCHEDULED", "DOC_VERIFICATION", 60)
    ];

    expect(isSlaBreached(within)).toBe(false);
    expect(isSlaBreached(over)).toBe(true);
  });

  it("does not run a breach clock on a finished case", () => {
    const events = [
      stageEvent("E", "SUBMITTED", null, 400),
      stageEvent("E", "CARD_GENERATED", "CERTIFICATE_ISSUED", 300)
    ];
    expect(isSlaBreached(events)).toBe(false);
  });

  it("shows the whole road in the stepper, not only the part travelled", () => {
    const events = [
      stageEvent("F", "SUBMITTED", null, 12),
      stageEvent("F", "DOC_VERIFICATION", "SUBMITTED", 11)
    ];
    const steps = buildTimeline(events);

    expect(steps).toHaveLength(6);
    expect(steps[0].state).toBe("done");
    expect(steps[1].state).toBe("current");
    expect(steps[2].state).toBe("upcoming");
    expect(steps.every((step) => step.key !== undefined)).toBe(true);
  });

  it("splices an exception stage into the stepper where it happened", () => {
    const events = [
      stageEvent("G", "SUBMITTED", null, 20),
      stageEvent("G", "DOC_VERIFICATION", "SUBMITTED", 19),
      stageEvent("G", "RETURNED_FOR_DOCUMENT", "DOC_VERIFICATION", 3, "DOC_ILLEGIBLE")
    ];
    const steps = buildTimeline(events);

    expect(steps).toHaveLength(7);
    const blocked = steps.find((step) => step.key === "RETURNED_FOR_DOCUMENT");
    expect(blocked?.state).toBe("blocked");
    expect(steps[steps.length - 1].key).toBe("CARD_GENERATED");
  });

  it("carries the reason, the fix and the queue promise onto the case view", () => {
    const app = application("H", 20);
    const events = [
      stageEvent("H", "SUBMITTED", null, 20),
      stageEvent("H", "DOC_VERIFICATION", "SUBMITTED", 19),
      stageEvent("H", "RETURNED_FOR_DOCUMENT", "DOC_VERIFICATION", 2, "DOC_ILLEGIBLE")
    ];
    const view = projectCase(app, events);

    expect(view?.activeReason?.code).toBe("DOC_ILLEGIBLE");
    expect(view?.queuePositionPreserved).toBe(true);
    expect(view?.nextStep?.text).toContain("clearer");
  });

  it("does not preserve a queue place when the applicant missed the board", () => {
    const app = application("I", 60);
    const events = [
      stageEvent("I", "SUBMITTED", null, 60),
      stageEvent("I", "DOC_VERIFICATION", "SUBMITTED", 59),
      stageEvent("I", "BOARD_SCHEDULED", "DOC_VERIFICATION", 40),
      stageEvent("I", "REJECTED", "BOARD_SCHEDULED", 5, "BOARD_NO_SHOW")
    ];
    const view = projectCase(app, events);

    expect(view?.queuePositionPreserved).toBe(false);
    expect(view?.appealDeadline).not.toBeNull();
  });
});

describe("queue position", () => {
  it("keeps the original place when the fault was administrative", () => {
    const app = application("J", 40);
    const events = [
      stageEvent("J", "SUBMITTED", null, 40),
      stageEvent("J", "DOC_VERIFICATION", "SUBMITTED", 39),
      stageEvent("J", "RETURNED_FOR_DOCUMENT", "DOC_VERIFICATION", 10, "DOC_ILLEGIBLE"),
      stageEvent("J", "DOC_VERIFICATION", "RETURNED_FOR_DOCUMENT", 2)
    ];

    expect(queueAnchorAt(app, events)).toBe(app.createdAt);
  });

  it("moves the place to the back when the applicant missed the appointment", () => {
    const app = application("K", 40);
    const resubmittedAt = toIso(addDays(DEMO_NOW, -2));
    const events = [
      stageEvent("K", "SUBMITTED", null, 40),
      stageEvent("K", "DOC_VERIFICATION", "SUBMITTED", 39),
      stageEvent("K", "BOARD_SCHEDULED", "DOC_VERIFICATION", 20),
      stageEvent("K", "RETURNED_FOR_DOCUMENT", "BOARD_SCHEDULED", 10, "BOARD_NO_SHOW"),
      stageEvent("K", "BOARD_SCHEDULED", "RETURNED_FOR_DOCUMENT", 2)
    ];

    expect(queueAnchorAt(app, events)).toBe(resubmittedAt);
  });

  it("numbers a place from one, among the same desk in the same district", () => {
    const entries = [
      { applicationId: "X1", district: "Bhopal", stage: "DOC_VERIFICATION" as StageKey, anchorAt: "2026-06-01T00:00:00.000Z" },
      { applicationId: "X2", district: "Bhopal", stage: "DOC_VERIFICATION" as StageKey, anchorAt: "2026-06-03T00:00:00.000Z" },
      { applicationId: "X3", district: "Indore", stage: "DOC_VERIFICATION" as StageKey, anchorAt: "2026-05-01T00:00:00.000Z" }
    ];

    expect(queuePosition(entries[1], entries)).toEqual({ position: 2, total: 2 });
    expect(queuePosition(entries[2], entries)).toEqual({ position: 1, total: 1 });
  });
});

describe("document pre-check", () => {
  it("passes when everything the category needs is attached", () => {
    const result = runPrecheck("HEARING_IMPAIRMENT", [
      "IDENTITY_PROOF",
      "ADDRESS_PROOF",
      "PHOTOGRAPH",
      "MEDICAL_CERTIFICATE",
      "AUDIOMETRY_REPORT"
    ]);

    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("names exactly what is missing, and why it is on the list", () => {
    const result = runPrecheck("HEARING_IMPAIRMENT", [
      "IDENTITY_PROOF",
      "ADDRESS_PROOF",
      "PHOTOGRAPH"
    ]);

    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(["MEDICAL_CERTIFICATE", "AUDIOMETRY_REPORT"]);
    const audiometry = result.items.find((item) => item.docType === "AUDIOMETRY_REPORT");
    expect(audiometry?.why).toContain("Hearing impairment");
  });

  it("explains the non-biometric route instead of hiding it", () => {
    const result = runPrecheck(
      "LOCOMOTOR",
      ["IDENTITY_PROOF", "ADDRESS_PROOF", "PHOTOGRAPH", "MEDICAL_CERTIFICATE", "SPECIALIST_REPORT"],
      "OFFICER_ATTESTED"
    );

    expect(result.ok).toBe(true);
    expect(result.advisories[0].text).toContain("fingerprints");
  });
});

describe("seeded dataset", () => {
  const dataset = generateDataset({ count: 400 });

  it("generates the demo narratives the walkthrough depends on", () => {
    const byId = new Map(dataset.applications.map((app) => [app.applicationId, app]));
    const eventsFor = (id: string) =>
      dataset.events.filter((event) => event.applicationId === id);

    const healthy = projectCase(byId.get("UDID-DEMO-1024")!, eventsFor("UDID-DEMO-1024"));
    expect(healthy?.currentStage).toBe("BOARD_SCHEDULED");
    expect(healthy?.isBreached).toBe(false);

    const returned = projectCase(byId.get("UDID-DEMO-2048")!, eventsFor("UDID-DEMO-2048"));
    expect(returned?.currentStage).toBe("RETURNED_FOR_DOCUMENT");
    expect(returned?.activeReason?.preservesQueuePosition).toBe(true);

    const breached = projectCase(byId.get("UDID-DEMO-4096")!, eventsFor("UDID-DEMO-4096"));
    expect(breached?.isBreached).toBe(true);
    expect(breached?.daysInStage).toBe(211);

    const done = projectCase(byId.get("UDID-DEMO-8192")!, eventsFor("UDID-DEMO-8192"));
    expect(done?.currentStage).toBe("CARD_GENERATED");
  });

  it("is deterministic, so the demo and the tests describe the same world", () => {
    const again = generateDataset({ count: 400 });
    expect(again.applications.length).toBe(dataset.applications.length);
    expect(again.events.length).toBe(dataset.events.length);
    expect(again.applications[50].applicant.name).toBe(
      dataset.applications[50].applicant.name
    );
  });

  it("plants the defects the reconciliation engine has to find", () => {
    const kinds = dataset.plantedDefects.map((defect) => defect.kind);
    expect(kinds).toContain("NO_STAGE_EVENTS");
    expect(kinds).toContain("UNKNOWN_STAGE");
    expect(kinds).toContain("CONTRADICTORY_HISTORY");
    expect(kinds).toContain("MISSING_REASON_CODE");
    expect(kinds).toContain("UNREACHABLE_TRANSITION");
    expect(kinds).toContain("EVENT_WITHOUT_APPLICATION");
  });

  it("shows genuine pressure rather than a wall of green", () => {
    const breachedCount = dataset.applications.filter((app) => {
      const events = dataset.events.filter((e) => e.applicationId === app.applicationId);
      return isSlaBreached(events);
    }).length;

    expect(breachedCount).toBeGreaterThan(dataset.applications.length * 0.1);
  });

  it("uses only phone numbers that cannot dial a real person", () => {
    for (const app of dataset.applications) {
      expect(app.applicant.contactPhone.startsWith("+91 00000 ")).toBe(true);
    }
  });
});

describe("number formatting", () => {
  it("groups digits the Indian way", () => {
    expect(formatIndianNumber(11563288)).toBe("1,15,63,288");
    expect(formatIndianNumber(1012616)).toBe("10,12,616");
    expect(formatIndianNumber(963606)).toBe("9,63,606");
    expect(formatIndianNumber(842)).toBe("842");
  });
});
