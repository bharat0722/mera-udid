import { addDays, DEMO_NOW, toIso } from "../core/clock";
import { requiredDocumentsFor } from "../core/precheck";
import { resetEventIds } from "../core/transitions";
import type {
  Application,
  CaseDocument,
  CaseEvent,
  DocType,
  ReasonCodeKey,
  StageKey
} from "../core/types";
import { STAGE_DEFINITIONS } from "../core/stages";
import { DISABILITY_TYPES } from "./disabilityTypes";

/**
 * Synthetic dataset generator.
 *
 * A generator rather than a fixture file, for two reasons. A fixture large enough to
 * make a district dashboard mean anything would be unreadable, and a generator can
 * plant specific defects on purpose and describe them — which is what the reconciliation
 * handoff needs.
 *
 * Everything here is invented. The people do not exist: given names and surnames are
 * combined at random from common name components, ages and districts are drawn from
 * distributions, and every phone number uses a leading-zero pattern that cannot be a
 * real Indian mobile number. No Aadhaar-format identifier, no real medical detail and
 * no real person's record appears anywhere in this project.
 *
 * The generator is seeded, so the same dataset appears on every run and the demo and
 * the tests describe the same world.
 */

/** mulberry32 — small, fast, and identical across engines. */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const GIVEN_NAMES = [
  "Asha", "Ravi", "Meena", "Sunita", "Rakesh", "Kavita", "Deepak", "Pooja",
  "Manoj", "Rekha", "Sanjay", "Anita", "Vinod", "Geeta", "Arun", "Shalini",
  "Ramesh", "Nisha", "Prakash", "Lata", "Suresh", "Rani", "Ajay", "Bhavna",
  "Mukesh", "Seema", "Dinesh", "Usha", "Naresh", "Jyoti", "Anil", "Sarita",
  "Vijay", "Kamla", "Rohit", "Preeti", "Gopal", "Neelam", "Harish", "Sudha"
];

const SURNAMES = [
  "Verma", "Yadav", "Patel", "Sharma", "Chouhan", "Rathore", "Jain", "Gupta",
  "Solanki", "Bhilala", "Ahirwar", "Tiwari", "Dubey", "Malviya", "Sahu", "Nagar",
  "Kushwaha", "Lodhi", "Rajput", "Prajapati"
];

export interface DistrictProfile {
  name: string;
  state: string;
  /** Relative share of the caseload. */
  weight: number;
  /** How congested this district is — multiplies the dwell times. */
  pressure: number;
}

/**
 * Madhya Pradesh districts, chosen because the strongest published evidence on waiting
 * times — a 253-day state average — is from Madhya Pradesh.
 */
export const DISTRICTS: DistrictProfile[] = [
  { name: "Bhopal", state: "Madhya Pradesh", weight: 24, pressure: 1.0 },
  { name: "Indore", state: "Madhya Pradesh", weight: 26, pressure: 1.15 },
  { name: "Jabalpur", state: "Madhya Pradesh", weight: 17, pressure: 1.45 },
  { name: "Gwalior", state: "Madhya Pradesh", weight: 15, pressure: 1.25 },
  { name: "Rewa", state: "Madhya Pradesh", weight: 10, pressure: 1.7 },
  { name: "Sagar", state: "Madhya Pradesh", weight: 8, pressure: 1.35 }
];

/** Where cases sit today. Most in progress, a minority finished, a tail in trouble. */
const OUTCOME_WEIGHTS: Array<{ stage: StageKey; weight: number }> = [
  { stage: "SUBMITTED", weight: 4 },
  { stage: "DOC_VERIFICATION", weight: 20 },
  { stage: "BOARD_SCHEDULED", weight: 26 },
  { stage: "BOARD_ASSESSED", weight: 5 },
  { stage: "CERTIFICATE_ISSUED", weight: 6 },
  { stage: "CARD_GENERATED", weight: 22 },
  { stage: "RETURNED_FOR_DOCUMENT", weight: 9 },
  { stage: "REJECTED", weight: 5 },
  { stage: "WITHDRAWN", weight: 2 },
  { stage: "DUPLICATE_MERGED", weight: 1 }
];

const RETURN_REASONS: ReasonCodeKey[] = [
  "DOC_ILLEGIBLE",
  "DOC_MISSING_MEDICAL",
  "DOC_NAME_MISMATCH",
  "DOC_EXPIRED",
  "ASSESSMENT_INCOMPLETE"
];

const OFFICER_IDS = ["SWO-BHO-01", "SWO-IND-04", "SWO-JBP-02", "SWO-GWL-03", "SWO-REW-01", "SWO-SAG-02"];
const BOARD_IDS = ["MB-BHO-A", "MB-IND-B", "MB-JBP-A", "MB-GWL-A", "MB-REW-A", "MB-SAG-A"];

export type PlantedDefectKind =
  | "NO_STAGE_EVENTS"
  | "UNKNOWN_STAGE"
  | "CONTRADICTORY_HISTORY"
  | "MISSING_REASON_CODE"
  | "UNREACHABLE_TRANSITION"
  | "EVENT_WITHOUT_APPLICATION";

export interface PlantedDefect {
  applicationId: string;
  kind: PlantedDefectKind;
  description: string;
}

export interface GeneratedDataset {
  applications: Application[];
  events: CaseEvent[];
  /** Every defect deliberately planted, so the reconciliation demo is reproducible. */
  plantedDefects: PlantedDefect[];
}

function pickWeighted<T extends { weight: number }>(rng: () => number, items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rng() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)];
}

/**
 * How long a case actually sits in a stage. Roughly half clear inside the proposed
 * target; the rest run over, with a long tail. That tail is the point — a dashboard
 * that renders a wall of green would misrepresent what the published figures describe.
 */
function dwellDays(stage: StageKey, pressure: number, rng: () => number): number {
  const target = STAGE_DEFINITIONS[stage].slaDays || 1;
  const roll = rng();
  let multiplier: number;
  if (roll < 0.52) {
    multiplier = 0.2 + rng() * 0.8;
  } else if (roll < 0.84) {
    multiplier = 1 + rng() * 2;
  } else {
    multiplier = 3 + rng() * 11;
  }
  return Math.max(1, Math.round(target * multiplier * pressure));
}

interface JourneyStep {
  stage: StageKey;
  reasonCode?: ReasonCodeKey;
  payload?: Record<string, unknown>;
  actorRole: CaseEvent["actorRole"];
  actorId: string;
}

function buildPath(
  finalStage: StageKey,
  officerId: string,
  boardId: string,
  rng: () => number
): JourneyStep[] {
  const officer: Pick<JourneyStep, "actorRole" | "actorId"> = {
    actorRole: "SW_OFFICER",
    actorId: officerId
  };
  const board: Pick<JourneyStep, "actorRole" | "actorId"> = {
    actorRole: "MEDICAL_BOARD",
    actorId: boardId
  };
  const system: Pick<JourneyStep, "actorRole" | "actorId"> = {
    actorRole: "SYSTEM",
    actorId: "mera-udid"
  };
  const applicant: Pick<JourneyStep, "actorRole" | "actorId"> = {
    actorRole: "APPLICANT",
    actorId: "self"
  };

  const steps: JourneyStep[] = [
    { stage: "SUBMITTED", actorRole: "APPLICANT", actorId: "self" }
  ];

  if (finalStage === "SUBMITTED") return steps;

  steps.push({ stage: "DOC_VERIFICATION", ...system });

  // About one case in six is returned once early on and then resubmitted, which is
  // what the resubmission loop looks like when it is working properly.
  if (
    rng() < 0.16 &&
    finalStage !== "RETURNED_FOR_DOCUMENT" &&
    finalStage !== "DOC_VERIFICATION" &&
    finalStage !== "WITHDRAWN" &&
    finalStage !== "DUPLICATE_MERGED"
  ) {
    steps.push({
      stage: "RETURNED_FOR_DOCUMENT",
      reasonCode: pick(rng, RETURN_REASONS.slice(0, 4)),
      ...officer
    });
    steps.push({ stage: "DOC_VERIFICATION", ...applicant });
  }

  switch (finalStage) {
    case "DOC_VERIFICATION":
      return steps;
    case "RETURNED_FOR_DOCUMENT":
      steps.push({
        stage: "RETURNED_FOR_DOCUMENT",
        reasonCode: pick(rng, RETURN_REASONS),
        ...officer
      });
      return steps;
    case "WITHDRAWN":
      steps.push({ stage: "WITHDRAWN", ...applicant });
      return steps;
    case "DUPLICATE_MERGED":
      steps.push({
        stage: "DUPLICATE_MERGED",
        payload: { mergedInto: "UDID-DEMO-1024" },
        ...officer
      });
      return steps;
    case "REJECTED": {
      // A rejection can happen at the desk or at the board; both are represented.
      if (rng() < 0.5) {
        steps.push({
          stage: "REJECTED",
          reasonCode: "DUPLICATE_APPLICATION",
          ...officer
        });
      } else {
        steps.push({ stage: "BOARD_SCHEDULED", ...officer });
        steps.push({ stage: "REJECTED", reasonCode: "BOARD_NO_SHOW", ...board });
      }
      return steps;
    }
    default:
      break;
  }

  steps.push({ stage: "BOARD_SCHEDULED", ...officer });
  if (finalStage === "BOARD_SCHEDULED") return steps;

  steps.push({ stage: "BOARD_ASSESSED", ...board });
  if (finalStage === "BOARD_ASSESSED") return steps;

  steps.push({ stage: "CERTIFICATE_ISSUED", ...officer });
  if (finalStage === "CERTIFICATE_ISSUED") return steps;

  steps.push({ stage: "CARD_GENERATED", ...system });
  return steps;
}

let sequence = 0;
function eventId(applicationId: string): string {
  sequence += 1;
  return `${applicationId}-SEED-${String(sequence).padStart(6, "0")}`;
}

function documentsFor(
  disabilityKey: string,
  createdAt: string,
  rng: () => number,
  omit: DocType | null
): CaseDocument[] {
  return requiredDocumentsFor(disabilityKey)
    .filter((docType) => docType !== omit)
    .map((docType) => ({
      docType,
      filename: `${docType.toLowerCase()}-${Math.floor(rng() * 9000 + 1000)}.pdf`,
      uploadedAt: createdAt,
      status: "PROVIDED" as const
    }));
}

function makeApplicant(rng: () => number, district: DistrictProfile) {
  const disability = pick(rng, DISABILITY_TYPES);
  const genderRoll = rng();
  return {
    applicant: {
      name: `${pick(rng, GIVEN_NAMES)} ${pick(rng, SURNAMES)}`,
      age: 4 + Math.floor(rng() * 68),
      gender: (genderRoll < 0.46 ? "female" : genderRoll < 0.99 ? "male" : "other") as
        | "female"
        | "male"
        | "other",
      district: district.name,
      state: district.state,
      disabilityType: disability.key,
      // Leading zeros: not a dialable Indian mobile number, by construction.
      contactPhone: `+91 00000 ${String(Math.floor(rng() * 100000)).padStart(5, "0")}`
    },
    disabilityKey: disability.key
  };
}

interface BuiltCase {
  application: Application;
  events: CaseEvent[];
}

function buildCase(
  applicationId: string,
  rng: () => number,
  options: {
    district?: DistrictProfile;
    finalStage?: StageKey;
    dwellOverrides?: Partial<Record<StageKey, number>>;
    forceCurrentDwell?: number;
    reasonOverride?: ReasonCodeKey;
    assisted?: boolean;
    identityMethod?: Application["identityMethod"];
    omitDocument?: DocType | null;
    name?: string;
  } = {}
): BuiltCase {
  const district = options.district ?? pickWeighted(rng, DISTRICTS);
  const finalStage = options.finalStage ?? pickWeighted(rng, OUTCOME_WEIGHTS).stage;
  const districtIndex = DISTRICTS.indexOf(district);
  const officerId = OFFICER_IDS[districtIndex] ?? OFFICER_IDS[0];
  const boardId = BOARD_IDS[districtIndex] ?? BOARD_IDS[0];

  const steps = buildPath(finalStage, officerId, boardId, rng);
  if (options.reasonOverride) {
    const last = steps[steps.length - 1];
    if (last.reasonCode) last.reasonCode = options.reasonOverride;
  }

  // Dwell for every step except the last, plus the time spent in the current stage.
  const dwells = steps.map((step, index) => {
    const override = options.dwellOverrides?.[step.stage];
    if (index === steps.length - 1 && options.forceCurrentDwell !== undefined) {
      return options.forceCurrentDwell;
    }
    if (override !== undefined) return override;
    return dwellDays(step.stage, district.pressure, rng);
  });

  const totalDays = dwells.reduce((sum, days) => sum + days, 0);
  const createdAt = addDays(DEMO_NOW, -totalDays);

  const generated = makeApplicant(rng, district);
  const disabilityKey = generated.disabilityKey;
  const applicant = options.name
    ? { ...generated.applicant, name: options.name }
    : generated.applicant;

  const application: Application = {
    applicationId,
    applicant,
    documents: documentsFor(
      disabilityKey,
      toIso(createdAt),
      rng,
      options.omitDocument ?? null
    ),
    createdAt: toIso(createdAt),
    identityMethod: options.identityMethod ?? (rng() < 0.12 ? "OFFICER_ATTESTED" : "DOCUMENT_ONLY"),
    assistedBy: options.assisted
      ? {
          name: `${pick(rng, GIVEN_NAMES)} ${pick(rng, SURNAMES)}`,
          relationship: pick(rng, ["Daughter", "Son", "Spouse", "Neighbour", "Sister"]),
          contactPhone: "+91 00000 00000",
          consentRecordedAt: toIso(createdAt)
        }
      : null
  };

  const events: CaseEvent[] = [];
  let cursor = createdAt;
  let previousStage: StageKey | null = null;

  steps.forEach((step, index) => {
    const payload = { ...(step.payload ?? {}) };
    if (step.stage === "BOARD_SCHEDULED") {
      // The appointment sits a little after the case reaches the board queue.
      payload.appointmentDate = toIso(addDays(cursor, Math.max(2, dwells[index])));
    }
    events.push({
      eventId: eventId(applicationId),
      applicationId,
      timestamp: toIso(cursor),
      type:
        step.stage === "RETURNED_FOR_DOCUMENT"
          ? "RETURNED"
          : step.stage === "REJECTED"
            ? "REJECTED"
            : step.stage === "WITHDRAWN"
              ? "WITHDRAWN"
              : step.stage === "DUPLICATE_MERGED"
                ? "MERGED"
                : previousStage === "RETURNED_FOR_DOCUMENT"
                  ? "RESUBMITTED"
                  : "STAGE_ENTERED",
      fromStage: previousStage,
      toStage: step.stage,
      actorRole: step.actorRole,
      actorId: step.actorId,
      reasonCode: step.reasonCode ?? null,
      note: null,
      payload: Object.keys(payload).length > 0 ? payload : null
    });
    previousStage = step.stage;
    cursor = addDays(cursor, dwells[index]);
  });

  // Some people already fought back. A minority of cases that ran well past the
  // three-month statutory limit carry a first appeal, so the officer queue and the
  // oversight dashboard show real escalation pressure rather than a clean slate.
  const totalElapsed = dwells.reduce((sum, days) => sum + days, 0);
  const stillOpen = !STAGE_DEFINITIONS[steps[steps.length - 1].stage].isTerminal;
  if (stillOpen && totalElapsed > 120 && rng() < 0.22) {
    const raisedAt = addDays(DEMO_NOW, -Math.max(1, Math.floor(rng() * 30)));
    events.push({
      eventId: eventId(applicationId),
      applicationId,
      timestamp: toIso(raisedAt),
      type: "ESCALATED",
      fromStage: null,
      toStage: null,
      actorRole: "APPLICANT",
      actorId: "self",
      reasonCode: null,
      note: null,
      payload: { tier: "FIRST_APPEAL", authority: "First Appeal Officer, District Collectorate" }
    });
  }

  return { application, events };
}

/**
 * The three narrative demo cases named in the brief, plus a completed one so the end
 * of the journey can be shown without waiting for the officer console.
 */
function buildDemoCases(rng: () => number): BuiltCase[] {
  const bhopal = DISTRICTS[0];
  const indore = DISTRICTS[1];
  const jabalpur = DISTRICTS[2];

  // 1024 — healthy and in progress. Day 4 of a 21-day target.
  const healthy = buildCase("UDID-DEMO-1024", rng, {
    district: bhopal,
    finalStage: "BOARD_SCHEDULED",
    dwellOverrides: { SUBMITTED: 1, DOC_VERIFICATION: 3 },
    forceCurrentDwell: 4,
    name: "Asha Verma"
  });

  // 2048 — returned for a fixable, administrative reason. Queue place protected.
  const returned = buildCase("UDID-DEMO-2048", rng, {
    district: indore,
    finalStage: "RETURNED_FOR_DOCUMENT",
    dwellOverrides: { SUBMITTED: 1, DOC_VERIFICATION: 9 },
    forceCurrentDwell: 2,
    reasonOverride: "DOC_ILLEGIBLE",
    assisted: true,
    name: "Ravi Kushwaha"
  });

  // 4096 — long breached at the medical board: 211 days against a 21-day target.
  const breached = buildCase("UDID-DEMO-4096", rng, {
    district: jabalpur,
    finalStage: "BOARD_SCHEDULED",
    dwellOverrides: { SUBMITTED: 2, DOC_VERIFICATION: 34 },
    forceCurrentDwell: 211,
    identityMethod: "OFFICER_ATTESTED",
    name: "Meena Ahirwar"
  });

  // 8192 — the whole journey completed, so the finished state is demonstrable.
  const completed = buildCase("UDID-DEMO-8192", rng, {
    district: bhopal,
    finalStage: "CARD_GENERATED",
    dwellOverrides: {
      SUBMITTED: 1,
      DOC_VERIFICATION: 6,
      BOARD_SCHEDULED: 19,
      BOARD_ASSESSED: 1,
      CERTIFICATE_ISSUED: 5
    },
    forceCurrentDwell: 2,
    name: "Sunita Malviya"
  });

  return [healthy, returned, breached, completed];
}

/**
 * The planted defects.
 *
 * These are written as raw event objects, deliberately bypassing the state machine —
 * which is exactly how they would arise in reality: a legacy import, a direct database
 * edit, a migration that predates the rules. They are unreachable through the UI.
 *
 * Every one of them is what the reserved reconciliation engine has to catch.
 */
function buildPlantedDefects(rng: () => number): {
  cases: BuiltCase[];
  strayEvents: CaseEvent[];
  defects: PlantedDefect[];
} {
  const cases: BuiltCase[] = [];
  const strayEvents: CaseEvent[] = [];
  const defects: PlantedDefect[] = [];

  // 1. Applications with no stage events at all — the closest analogue to the real
  //    10,12,616: received, recorded, and then in no column whatsoever.
  for (let i = 0; i < 4; i += 1) {
    const id = `UDID-ORPH-${1000 + i}`;
    const built = buildCase(id, rng, { finalStage: "SUBMITTED" });
    cases.push({ application: built.application, events: [] });
    defects.push({
      applicationId: id,
      kind: "NO_STAGE_EVENTS",
      description:
        "Application record exists with an empty event log. It is in no stage at all."
    });
  }

  // 2. The latest event points at a stage this system does not model.
  for (let i = 0; i < 2; i += 1) {
    const id = `UDID-ORPH-${2000 + i}`;
    const built = buildCase(id, rng, { finalStage: "DOC_VERIFICATION" });
    const last = built.events[built.events.length - 1];
    built.events.push({
      eventId: `${id}-SEED-LEGACY`,
      applicationId: id,
      timestamp: toIso(addDays(new Date(last.timestamp), 5)),
      type: "STAGE_ENTERED",
      fromStage: "DOC_VERIFICATION",
      // A stage key from an older system that was never mapped across.
      toStage: "TRANSFERRED_TO_STATE_PORTAL" as StageKey,
      actorRole: "SYSTEM",
      actorId: "legacy-import",
      reasonCode: null,
      note: "Imported from a state portal that used its own status list.",
      payload: null
    });
    cases.push(built);
    defects.push({
      applicationId: id,
      kind: "UNKNOWN_STAGE",
      description:
        "Latest event names the stage TRANSFERRED_TO_STATE_PORTAL, which this system does not model."
    });
  }

  // 3. Two stage events sharing the newest timestamp, disagreeing about where the
  //    case is. Two offices each believing they hold the file.
  for (let i = 0; i < 2; i += 1) {
    const id = `UDID-ORPH-${3000 + i}`;
    const built = buildCase(id, rng, { finalStage: "BOARD_SCHEDULED" });
    const last = built.events[built.events.length - 1];
    built.events.push({
      eventId: `${id}-SEED-CONFLICT`,
      applicationId: id,
      timestamp: last.timestamp,
      type: "STAGE_ENTERED",
      fromStage: "DOC_VERIFICATION",
      toStage: "CERTIFICATE_ISSUED",
      actorRole: "SW_OFFICER",
      actorId: "SWO-LEGACY",
      reasonCode: null,
      note: null,
      payload: null
    });
    cases.push(built);
    defects.push({
      applicationId: id,
      kind: "CONTRADICTORY_HISTORY",
      description:
        "Two stage events share the newest timestamp and disagree: BOARD_SCHEDULED and CERTIFICATE_ISSUED."
    });
  }

  // 4. A return recorded with no reason code — the exact defect the reason-code rule
  //    exists to prevent, present here only because it bypassed the state machine.
  for (let i = 0; i < 2; i += 1) {
    const id = `UDID-ANOM-${4000 + i}`;
    const built = buildCase(id, rng, { finalStage: "DOC_VERIFICATION" });
    const last = built.events[built.events.length - 1];
    built.events.push({
      eventId: `${id}-SEED-NOREASON`,
      applicationId: id,
      timestamp: toIso(addDays(new Date(last.timestamp), 11)),
      type: "RETURNED",
      fromStage: "DOC_VERIFICATION",
      toStage: "RETURNED_FOR_DOCUMENT",
      actorRole: "SW_OFFICER",
      actorId: "SWO-LEGACY",
      reasonCode: null,
      note: null,
      payload: null
    });
    cases.push(built);
    defects.push({
      applicationId: id,
      kind: "MISSING_REASON_CODE",
      description: "Returned to the applicant with no reason code recorded."
    });
  }

  // 5. A jump that the transition graph does not permit.
  for (let i = 0; i < 2; i += 1) {
    const id = `UDID-ANOM-${5000 + i}`;
    const built = buildCase(id, rng, { finalStage: "SUBMITTED" });
    const last = built.events[built.events.length - 1];
    built.events.push({
      eventId: `${id}-SEED-JUMP`,
      applicationId: id,
      timestamp: toIso(addDays(new Date(last.timestamp), 6)),
      type: "STAGE_ENTERED",
      fromStage: "SUBMITTED",
      toStage: "CERTIFICATE_ISSUED",
      actorRole: "SW_OFFICER",
      actorId: "SWO-LEGACY",
      reasonCode: null,
      note: null,
      payload: null
    });
    cases.push(built);
    defects.push({
      applicationId: id,
      kind: "UNREACHABLE_TRANSITION",
      description:
        "Jumps straight from SUBMITTED to CERTIFICATE_ISSUED, skipping document checking and the medical board."
    });
  }

  // 6. Events referring to an application that does not exist in the register.
  const ghostId = "UDID-GHOST-6000";
  strayEvents.push({
    eventId: `${ghostId}-SEED-GHOST`,
    applicationId: ghostId,
    timestamp: toIso(addDays(DEMO_NOW, -73)),
    type: "STAGE_ENTERED",
    fromStage: null,
    toStage: "SUBMITTED",
    actorRole: "SYSTEM",
    actorId: "legacy-import",
    reasonCode: null,
    note: null,
    payload: null
  });
  defects.push({
    applicationId: ghostId,
    kind: "EVENT_WITHOUT_APPLICATION",
    description:
      "Events exist for an application ID that is not in the register at all."
  });

  return { cases, strayEvents, defects };
}

export interface GenerateOptions {
  /** How many ordinary applications to generate, on top of the demo and defect cases. */
  count?: number;
  seed?: number;
}

export function generateDataset(options: GenerateOptions = {}): GeneratedDataset {
  const count = options.count ?? 1400;
  const rng = makeRng(options.seed ?? 20260823);
  sequence = 0;
  resetEventIds();

  const applications: Application[] = [];
  const events: CaseEvent[] = [];

  for (const built of buildDemoCases(rng)) {
    applications.push(built.application);
    events.push(...built.events);
  }

  for (let i = 0; i < count; i += 1) {
    const id = `UDID-MP-${String(100000 + i)}`;
    const built = buildCase(id, rng, {
      assisted: rng() < 0.18,
      omitDocument: null
    });
    applications.push(built.application);
    events.push(...built.events);
  }

  const planted = buildPlantedDefects(rng);
  for (const built of planted.cases) {
    applications.push(built.application);
    events.push(...built.events);
  }
  events.push(...planted.strayEvents);

  return { applications, events, plantedDefects: planted.defects };
}
