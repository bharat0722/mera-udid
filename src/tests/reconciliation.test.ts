import { describe, expect, it } from "vitest";
import { DEMO_NOW } from "../core/clock";
import { ALL_STAGE_KEYS } from "../core/stages";
import { isReconciled, reconcile } from "../core/reconciliation";
import { generateDataset } from "../data/generator";
import type { Application, CaseEvent } from "../core/types";

/**
 * SPECIFICATION SUITE FOR THE RESERVED RECONCILIATION ENGINE.
 *
 * ---------------------------------------------------------------------------
 * THIS SUITE IS EXPECTED TO FAIL until Codex implements src/core/reconciliation.ts.
 * Every failure here should read "NotImplementedError: reconcile() is reserved…".
 * A failure with any other message means the suite itself has broken and must be
 * fixed — the tests describe correct behaviour, they do not merely assert absence.
 *
 * Run the rest of the project's tests with `pnpm test:built`, which excludes this file.
 * Run this suite on its own with `pnpm test:spec`.
 * ---------------------------------------------------------------------------
 *
 * The contract these tests encode lives in the header of src/core/reconciliation.ts,
 * and the handoff brief is CODEX-HANDOFF.md.
 */

const dataset = generateDataset({ count: 300 });

/** The planted-defect cases, by the id prefixes the generator uses. */
const ORPHAN_PREFIX = "UDID-ORPH-";
const ANOMALY_PREFIX = "UDID-ANOM-";
const GHOST_ID = "UDID-GHOST-6000";

const plantedOrphanIds = dataset.applications
  .map((application) => application.applicationId)
  .filter((id) => id.startsWith(ORPHAN_PREFIX))
  .sort();

/** A dataset with no planted defects at all — the healthy system. */
function healthyDataset(): { applications: Application[]; events: CaseEvent[] } {
  const isPlanted = (id: string) =>
    id.startsWith(ORPHAN_PREFIX) || id.startsWith(ANOMALY_PREFIX) || id === GHOST_ID;

  return {
    applications: dataset.applications.filter(
      (application) => !isPlanted(application.applicationId)
    ),
    events: dataset.events.filter((event) => !isPlanted(event.applicationId))
  };
}

describe("reconcile — report shape", () => {
  it("counts every application it was given as received", () => {
    const healthy = healthyDataset();
    const report = reconcile(healthy.applications, healthy.events);

    expect(report.totalReceived).toBe(healthy.applications.length);
  });

  it("includes every modelled stage as a key, including the zeroes", () => {
    const healthy = healthyDataset();
    const report = reconcile(healthy.applications, healthy.events);

    for (const stage of ALL_STAGE_KEYS) {
      expect(report.countsByStage).toHaveProperty(stage);
      expect(typeof report.countsByStage[stage]).toBe("number");
    }
    expect(Object.keys(report.countsByStage).sort()).toEqual([...ALL_STAGE_KEYS].sort());
  });

  it("makes totalAccounted the sum of the stage counts, and nothing else", () => {
    const healthy = healthyDataset();
    const report = reconcile(healthy.applications, healthy.events);

    const sum = Object.values(report.countsByStage).reduce((total, n) => total + n, 0);
    expect(report.totalAccounted).toBe(sum);
  });

  it("defines the gap as received minus accounted", () => {
    const report = reconcile(dataset.applications, dataset.events);

    expect(report.gap).toBe(report.totalReceived - report.totalAccounted);
    expect(report.isBalanced).toBe(report.gap === 0);
  });

  it("stamps the report with the instant it was generated", () => {
    const healthy = healthyDataset();
    const report = reconcile(healthy.applications, healthy.events, { asOf: DEMO_NOW });

    expect(report.generatedAt).toBe(DEMO_NOW.toISOString());
  });
});

describe("reconcile — a healthy system balances", () => {
  it("reports a gap of zero when every application is placeable", () => {
    const healthy = healthyDataset();
    const report = reconcile(healthy.applications, healthy.events);

    expect(report.gap).toBe(0);
    expect(report.isBalanced).toBe(true);
    expect(report.orphans).toEqual([]);
  });

  it("finds no anomalies in a log that only the state machine wrote", () => {
    const healthy = healthyDataset();
    const report = reconcile(healthy.applications, healthy.events);

    expect(report.anomalies).toEqual([]);
  });

  it("balances trivially on an empty system", () => {
    const report = reconcile([], []);

    expect(report.totalReceived).toBe(0);
    expect(report.totalAccounted).toBe(0);
    expect(report.gap).toBe(0);
    expect(report.isBalanced).toBe(true);
  });
});

describe("reconcile — the planted orphans", () => {
  it("catches an application with an empty event log", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const noEvents = report.orphans.filter(
      (orphan) => orphan.detectedProblem === "NO_STAGE_EVENTS"
    );

    expect(noEvents).toHaveLength(4);
    for (const orphan of noEvents) {
      expect(orphan.applicationId.startsWith(ORPHAN_PREFIX)).toBe(true);
      expect(orphan.lastKnownEvent).toBeNull();
      expect(orphan.detail.length).toBeGreaterThan(0);
    }
  });

  it("catches an application whose latest event names a stage it does not model", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const unknown = report.orphans.filter(
      (orphan) => orphan.detectedProblem === "UNKNOWN_STAGE"
    );

    expect(unknown).toHaveLength(2);
    expect(unknown[0].lastKnownEvent?.toStage).toBe("TRANSFERRED_TO_STATE_PORTAL");
  });

  it("catches an application the log places in two stages at once", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const contradictory = report.orphans.filter(
      (orphan) => orphan.detectedProblem === "CONTRADICTORY_HISTORY"
    );

    expect(contradictory).toHaveLength(2);
  });

  it("names every planted orphan and nothing else", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const found = report.orphans.map((orphan) => orphan.applicationId).sort();

    expect(found).toEqual(plantedOrphanIds);
  });

  it("leaves a gap exactly the size of the orphan list", () => {
    const report = reconcile(dataset.applications, dataset.events);

    expect(report.gap).toBe(report.orphans.length);
    expect(report.isBalanced).toBe(false);
  });
});

describe("reconcile — the planted anomalies", () => {
  it("catches a return recorded without a reason code", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const missing = report.anomalies.filter(
      (anomaly) => anomaly.type === "MISSING_REASON_CODE"
    );

    expect(missing).toHaveLength(2);
    expect(missing[0].event?.toStage).toBe("RETURNED_FOR_DOCUMENT");
    expect(missing[0].event?.reasonCode).toBeNull();
  });

  it("catches a transition to a stage that cannot follow the previous one", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const unreachable = report.anomalies.filter(
      (anomaly) => anomaly.type === "UNREACHABLE_TRANSITION"
    );

    expect(unreachable).toHaveLength(2);
    expect(unreachable[0].event?.fromStage).toBe("SUBMITTED");
    expect(unreachable[0].event?.toStage).toBe("CERTIFICATE_ISSUED");
  });

  it("catches events belonging to an application that is not in the register", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const ghosts = report.anomalies.filter(
      (anomaly) => anomaly.type === "EVENT_WITHOUT_APPLICATION"
    );

    expect(ghosts.length).toBeGreaterThanOrEqual(1);
    expect(ghosts[0].applicationId).toBe(GHOST_ID);
  });

  it("still counts an anomalous application — a bad history is not a missing case", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const anomalousIds = new Set(
      report.anomalies
        .filter((anomaly) => anomaly.applicationId.startsWith(ANOMALY_PREFIX))
        .map((anomaly) => anomaly.applicationId)
    );
    const orphanIds = new Set(report.orphans.map((orphan) => orphan.applicationId));

    for (const id of anomalousIds) {
      expect(orphanIds.has(id)).toBe(false);
    }
  });
});

describe("reconcile — invariants that must never break", () => {
  it("places every application exactly once, in a stage or in the orphan list", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const counted = Object.values(report.countsByStage).reduce((total, n) => total + n, 0);

    expect(counted + report.orphans.length).toBe(dataset.applications.length);
  });

  it("never silently omits an application", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const orphanIds = new Set(report.orphans.map((orphan) => orphan.applicationId));

    // Anything not in the orphan list must have contributed to a stage count, so the
    // two totals together have to cover the whole register.
    expect(report.totalAccounted).toBe(dataset.applications.length - orphanIds.size);
  });

  it("sorts orphans and anomalies by application id so two runs diff cleanly", () => {
    const report = reconcile(dataset.applications, dataset.events);
    const orphanIds = report.orphans.map((orphan) => orphan.applicationId);
    const anomalyIds = report.anomalies.map((anomaly) => anomaly.applicationId);

    expect(orphanIds).toEqual([...orphanIds].sort());
    expect(anomalyIds).toEqual([...anomalyIds].sort());
  });

  it("is pure — it does not touch the arrays it was handed", () => {
    const applications = dataset.applications.slice();
    const events = dataset.events.slice();
    const applicationsBefore = JSON.stringify(applications);
    const eventsBefore = JSON.stringify(events);

    reconcile(applications, events);

    expect(JSON.stringify(applications)).toBe(applicationsBefore);
    expect(JSON.stringify(events)).toBe(eventsBefore);
  });

  it("is deterministic — the same inputs give the same report", () => {
    const first = reconcile(dataset.applications, dataset.events, { asOf: DEMO_NOW });
    const second = reconcile(dataset.applications, dataset.events, { asOf: DEMO_NOW });

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it("does not care what order the events arrive in", () => {
    const shuffled = dataset.events.slice().reverse();
    const inOrder = reconcile(dataset.applications, dataset.events, { asOf: DEMO_NOW });
    const reversed = reconcile(dataset.applications, shuffled, { asOf: DEMO_NOW });

    expect(reversed.countsByStage).toEqual(inOrder.countsByStage);
    expect(reversed.orphans.map((o) => o.applicationId)).toEqual(
      inOrder.orphans.map((o) => o.applicationId)
    );
  });
});

describe("isReconciled", () => {
  it("is true for a healthy system", () => {
    const healthy = healthyDataset();
    expect(isReconciled(healthy.applications, healthy.events)).toBe(true);
  });

  it("is false the moment one application falls out of the stage graph", () => {
    expect(isReconciled(dataset.applications, dataset.events)).toBe(false);
  });
});
