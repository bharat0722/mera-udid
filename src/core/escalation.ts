import { addDays, daysBetween, DEMO_NOW } from "./clock";
import type { Application, CaseEvent } from "./types";

/**
 * Statutory deadlines, and what a citizen can do when one passes.
 *
 * This is the piece that gives the clock teeth. Until now the interface could tell you
 * your application was 211 days old and then offer you nothing — which is a more
 * articulate version of the same helplessness.
 *
 * ## What is actually law, and what is ours
 *
 * VERIFIED, and load-bearing: the Rights of Persons with Disabilities Rules, 2017,
 * rule 18, set a time limit for the certifying authority to issue a disability
 * certificate. The RPwD (Amendment) Rules, 2024 — notified 16 October 2024, in force
 * from 18 October 2024 — set that limit at **three months**. So there already is a
 * legal deadline. The service simply never counts it, never shows it, and never acts
 * on it. That is the gap this module closes.
 *
 * VERIFIED, and used as a model: the Madhya Pradesh Lok Sewaon Ke Pradan Ki Guarantee
 * Adhiniyam, 2010 sets up the escalation ladder used here. Section 3 has the state
 * notify, per service, a Designated Officer, a First Appeal Officer and a Second
 * Appellate Authority. Section 6 gives an applicant 30 days from the expiry of the
 * time limit to file a first appeal, and 60 days from that decision to file a second.
 * Section 7 provides a penalty on the officer of Rs 250 per day of delay, capped at
 * Rs 5,000, with compensation to the applicant not exceeding the penalty imposed.
 *
 * NOT VERIFIED, and therefore never asserted as fact anywhere in this interface:
 * whether a disability certificate is a *notified service* under the MP Act, and what
 * day count would be notified against it if it is. The state's service list could not
 * be retrieved. So the ladder below is presented as this prototype's proposal, modelled
 * on the Act's structure — not as a claim that a specific penalty is owed to a specific
 * applicant. The UI says which is which, because getting that wrong would be telling a
 * disabled citizen they are owed money they may not be owed.
 */

/**
 * Three months, as the RPwD Rules require. Counted from the date of application, which
 * is the only date the applicant can be sure of.
 */
export const RPWD_CERTIFICATE_LIMIT_DAYS = 90;

export const RPWD_CITATION =
  "Rights of Persons with Disabilities Rules, 2017, rule 18, as amended by the RPwD (Amendment) Rules, 2024 (in force 18 October 2024).";

export const MP_ACT_CITATION =
  "Structure modelled on the Madhya Pradesh Lok Sewaon Ke Pradan Ki Guarantee Adhiniyam, 2010, sections 3, 6 and 7.";

/** Days an applicant has to file a first appeal once the limit passes (MP Act, s.6). */
export const FIRST_APPEAL_WINDOW_DAYS = 30;
/** Days to escalate again after a first-appeal decision (MP Act, s.6). */
export const SECOND_APPEAL_WINDOW_DAYS = 60;

export type EscalationTier = "FIRST_APPEAL" | "SECOND_APPEAL";

export interface EscalationTierDefinition {
  tier: EscalationTier;
  /** Who the case goes to. */
  authority: string;
  authorityHindi: string;
  /** Days the applicant has to raise it, per the Act this is modelled on. */
  windowDays: number;
}

export const ESCALATION_TIERS: Record<EscalationTier, EscalationTierDefinition> = {
  FIRST_APPEAL: {
    tier: "FIRST_APPEAL",
    authority: "First Appeal Officer, District Collectorate",
    authorityHindi: "प्रथम अपील अधिकारी, जिला कलेक्ट्रेट",
    windowDays: FIRST_APPEAL_WINDOW_DAYS
  },
  SECOND_APPEAL: {
    tier: "SECOND_APPEAL",
    authority: "Second Appellate Authority, State Commissioner for Persons with Disabilities",
    authorityHindi: "द्वितीय अपीलीय प्राधिकारी, राज्य विकलांगजन आयुक्त",
    windowDays: SECOND_APPEAL_WINDOW_DAYS
  }
};

/** The date by which the certificate should have been issued. */
export function statutoryDeadline(application: Application): Date {
  return addDays(new Date(application.createdAt), RPWD_CERTIFICATE_LIMIT_DAYS);
}

export interface StatutoryStatus {
  deadline: Date;
  /** Days remaining before the limit. Negative once it has passed. */
  daysRemaining: number;
  daysOverdue: number;
  isOverdue: boolean;
  /** True once the case is inside the last two weeks of the limit. */
  isCloseToLimit: boolean;
}

export function statutoryStatus(
  application: Application,
  asOf: Date = DEMO_NOW
): StatutoryStatus {
  const deadline = statutoryDeadline(application);
  const elapsed = daysBetween(application.createdAt, asOf);
  const daysRemaining = RPWD_CERTIFICATE_LIMIT_DAYS - elapsed;

  return {
    deadline,
    daysRemaining,
    daysOverdue: Math.max(0, -daysRemaining),
    isOverdue: daysRemaining < 0,
    isCloseToLimit: daysRemaining >= 0 && daysRemaining <= 14
  };
}

export interface EscalationRecord {
  tier: EscalationTier;
  raisedAt: string;
  /** What the applicant said, where they said anything. */
  note: string | null;
}

/** Every escalation on a case, oldest first. */
export function escalationsOf(events: CaseEvent[]): EscalationRecord[] {
  return events
    .filter((event) => event.type === "ESCALATED")
    .slice()
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((event) => ({
      tier: (event.payload?.tier as EscalationTier) ?? "FIRST_APPEAL",
      raisedAt: event.timestamp,
      note: event.note
    }));
}

/** The tier a further escalation would go to, or null when the ladder is exhausted. */
export function nextTier(events: CaseEvent[]): EscalationTier | null {
  const raised = escalationsOf(events).map((record) => record.tier);
  if (!raised.includes("FIRST_APPEAL")) return "FIRST_APPEAL";
  if (!raised.includes("SECOND_APPEAL")) return "SECOND_APPEAL";
  return null;
}

/**
 * Whether the applicant can escalate right now.
 *
 * Deliberately permissive on one point: a case that is *not* past the statutory limit
 * can still be escalated if its current stage has blown its own target. Waiting for the
 * full three months before anyone will listen is precisely the delay being complained
 * about.
 */
export function canEscalate(
  application: Application,
  events: CaseEvent[],
  stageIsBreached: boolean,
  isTerminal: boolean,
  asOf: Date = DEMO_NOW
): boolean {
  if (isTerminal) return false;
  if (nextTier(events) === null) return false;
  return statutoryStatus(application, asOf).isOverdue || stageIsBreached;
}
