import { describe, expect, it } from "vitest";
import { addDays, DEMO_NOW, toIso } from "../core/clock";
import {
  canEscalate,
  escalationsOf,
  ESCALATION_TIERS,
  nextTier,
  RPWD_CERTIFICATE_LIMIT_DAYS,
  statutoryDeadline,
  statutoryStatus
} from "../core/escalation";
import type { Application, CaseEvent } from "../core/types";

/**
 * The statutory clock decides whether a citizen has a grievance, so its arithmetic is
 * pinned here. Getting it wrong in either direction is harmful: too early and we send
 * someone to complain with no standing, too late and we leave them waiting past a
 * deadline the law already gave them.
 */

function application(daysAgo: number): Application {
  return {
    applicationId: "UDID-TEST-ESC",
    applicant: {
      name: "Test Person",
      age: 30,
      gender: "female",
      district: "Bhopal",
      state: "Madhya Pradesh",
      disabilityType: "LOCOMOTOR",
      contactPhone: "+91 00000 00001"
    },
    documents: [],
    createdAt: toIso(addDays(DEMO_NOW, -daysAgo)),
    identityMethod: "DOCUMENT_ONLY",
    assistedBy: null
  };
}

function escalationEvent(tier: string, daysAgo: number): CaseEvent {
  return {
    eventId: `esc-${tier}-${daysAgo}`,
    applicationId: "UDID-TEST-ESC",
    timestamp: toIso(addDays(DEMO_NOW, -daysAgo)),
    type: "ESCALATED",
    fromStage: null,
    toStage: null,
    actorRole: "APPLICANT",
    actorId: "self",
    reasonCode: null,
    note: null,
    payload: { tier }
  };
}

describe("the statutory time limit", () => {
  it("is the three months the RPwD Rules give, counted from the application date", () => {
    expect(RPWD_CERTIFICATE_LIMIT_DAYS).toBe(90);
    const app = application(0);
    expect(statutoryDeadline(app).toISOString()).toBe(
      addDays(new Date(app.createdAt), 90).toISOString()
    );
  });

  it("counts down while the case is inside the limit", () => {
    const status = statutoryStatus(application(30));
    expect(status.isOverdue).toBe(false);
    expect(status.daysRemaining).toBe(60);
    expect(status.daysOverdue).toBe(0);
  });

  it("warns in the last two weeks, without calling it overdue", () => {
    expect(statutoryStatus(application(80)).isCloseToLimit).toBe(true);
    expect(statutoryStatus(application(80)).isOverdue).toBe(false);
    expect(statutoryStatus(application(60)).isCloseToLimit).toBe(false);
  });

  it("does not call a case overdue on the very day the limit falls", () => {
    const onTheDay = statutoryStatus(application(90));
    expect(onTheDay.daysRemaining).toBe(0);
    expect(onTheDay.isOverdue).toBe(false);
  });

  it("counts the days past the limit once it has gone", () => {
    // The seeded 211-day case is the one this exists for.
    const status = statutoryStatus(application(211));
    expect(status.isOverdue).toBe(true);
    expect(status.daysOverdue).toBe(121);
  });
});

describe("the escalation ladder", () => {
  it("starts at the first appeal and then goes to the second", () => {
    expect(nextTier([])).toBe("FIRST_APPEAL");
    expect(nextTier([escalationEvent("FIRST_APPEAL", 5)])).toBe("SECOND_APPEAL");
  });

  it("runs out rather than looping forever", () => {
    const both = [escalationEvent("FIRST_APPEAL", 20), escalationEvent("SECOND_APPEAL", 5)];
    expect(nextTier(both)).toBeNull();
  });

  it("carries the windows the Act gives — 30 days, then 60", () => {
    expect(ESCALATION_TIERS.FIRST_APPEAL.windowDays).toBe(30);
    expect(ESCALATION_TIERS.SECOND_APPEAL.windowDays).toBe(60);
  });

  it("lists what has already been raised, oldest first", () => {
    const raised = escalationsOf([
      escalationEvent("SECOND_APPEAL", 5),
      escalationEvent("FIRST_APPEAL", 30)
    ]);
    expect(raised.map((r) => r.tier)).toEqual(["FIRST_APPEAL", "SECOND_APPEAL"]);
  });
});

describe("when a citizen may escalate", () => {
  it("may once the statutory limit has passed", () => {
    expect(canEscalate(application(120), [], false, false)).toBe(true);
  });

  it("may as soon as the current stage blows its own target, without waiting 90 days", () => {
    // Making someone wait out the full three months before anyone will listen is the
    // delay being complained about.
    expect(canEscalate(application(20), [], true, false)).toBe(true);
  });

  it("may not while everything is still on time", () => {
    expect(canEscalate(application(20), [], false, false)).toBe(false);
  });

  it("may not on a finished case", () => {
    expect(canEscalate(application(400), [], true, true)).toBe(false);
  });

  it("may not once both levels have been used", () => {
    const both = [escalationEvent("FIRST_APPEAL", 40), escalationEvent("SECOND_APPEAL", 10)];
    expect(canEscalate(application(400), both, true, false)).toBe(false);
  });
});
