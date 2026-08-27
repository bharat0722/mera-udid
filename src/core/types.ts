/**
 * Domain types for Mera UDID.
 *
 * The whole system is event-sourced. An application is a bag of facts that do not
 * change (who applied, when, with which documents); everything that *moves* — the
 * current stage, the clock, the history, the reconciliation report — is derived
 * from an append-only list of CaseEvents.
 *
 * There is deliberately no `currentStage` field on Application. If the stage were
 * stored alongside the events it could disagree with them, and "the stored column
 * disagrees with reality" is precisely the defect this project exists to remove.
 */

/** Stages an application can occupy. An application is always in exactly one. */
export type StageKey =
  // Active stages, in order.
  | "SUBMITTED"
  | "DOC_VERIFICATION"
  | "BOARD_SCHEDULED"
  | "BOARD_ASSESSED"
  | "CERTIFICATE_ISSUED"
  | "CARD_GENERATED"
  // Exception and terminal stages.
  | "RETURNED_FOR_DOCUMENT"
  | "REJECTED"
  | "WITHDRAWN"
  | "DUPLICATE_MERGED";

export type ActorRole = "APPLICANT" | "SW_OFFICER" | "MEDICAL_BOARD" | "SYSTEM";

export type CaseEventType =
  /** A stage change on the happy path. */
  | "STAGE_ENTERED"
  /** Sent back to the applicant. Requires a reason code. */
  | "RETURNED"
  /** Refused. Requires a reason code. */
  | "REJECTED"
  /** The applicant fixed what was wrong and sent it back in. */
  | "RESUBMITTED"
  /** Applicant pulled the application. */
  | "WITHDRAWN"
  /** Folded into another application, which must be named in the payload. */
  | "MERGED"
  /** A document was attached. Carries no stage change. */
  | "DOCUMENT_ADDED"
  /** The medical board recorded an assessment. Carries no stage change. */
  | "ASSESSMENT_RECORDED"
  /** An appeal under RPwD Act 2016 s.59. Carries no stage change. */
  | "APPEAL_LODGED"
  /**
   * The applicant raised the delay to a higher authority because a deadline passed.
   * Carries no stage change — escalation adds accountability, it does not move the
   * case, and pretending otherwise would be a lie the citizen could see through.
   */
  | "ESCALATED"
  /** A free-standing human note. Carries no stage change. */
  | "NOTE_ADDED";

export type ReasonCodeKey =
  | "DOC_MISSING_MEDICAL"
  | "DOC_ILLEGIBLE"
  | "DOC_NAME_MISMATCH"
  | "DOC_EXPIRED"
  | "BOARD_NO_SHOW"
  | "ASSESSMENT_INCOMPLETE"
  | "DUPLICATE_APPLICATION";

export type DocType =
  | "IDENTITY_PROOF"
  | "ADDRESS_PROOF"
  | "PHOTOGRAPH"
  | "MEDICAL_CERTIFICATE"
  | "SPECIALIST_REPORT"
  | "AUDIOMETRY_REPORT"
  | "VISION_ASSESSMENT"
  | "PSYCH_ASSESSMENT"
  | "OLD_CERTIFICATE";

export type DocumentStatus = "PROVIDED" | "AT_FAULT" | "REPLACED";

/**
 * One immutable fact appended to the case log. Events are never edited or deleted;
 * a mistake is corrected by appending a compensating event.
 */
export interface CaseEvent {
  eventId: string;
  applicationId: string;
  /** ISO 8601. */
  timestamp: string;
  type: CaseEventType;
  /** null for the first stage event and for events that do not move the case. */
  fromStage: StageKey | null;
  /** null for events that do not move the case (a note, a document, an appeal). */
  toStage: StageKey | null;
  actorRole: ActorRole;
  actorId: string;
  /** Required for RETURNED and REJECTED. null otherwise. */
  reasonCode: ReasonCodeKey | null;
  note: string | null;
  payload: Record<string, unknown> | null;
}

export interface CaseDocument {
  docType: DocType;
  filename: string;
  /** ISO 8601. */
  uploadedAt: string;
  status: DocumentStatus;
}

export interface Applicant {
  name: string;
  age: number;
  gender: "female" | "male" | "other";
  district: string;
  state: string;
  /** One of the RPwD Act 2016 specified disabilities. */
  disabilityType: string;
  /** Synthetic. Never a real number. */
  contactPhone: string;
}

/**
 * The applicant is often not the person filling the form. Rather than pretend
 * otherwise, assisted applications are recorded openly, with consent.
 */
export interface AssistedBy {
  name: string;
  relationship: string;
  /** Contact route for the authorised helper, used only when clarification is needed. */
  contactPhone: string;
  /** ISO 8601 — when the applicant gave consent for someone else to apply. */
  consentRecordedAt: string;
}

/**
 * How the applicant proves who they are. The real service's fingerprint requirement
 * is documented as excluding people with missing limbs, leprosy-related finger loss
 * and acid-attack survivors, so the non-biometric route is a first-class option here.
 */
export type IdentityMethod = "FINGERPRINT" | "OFFICER_ATTESTED" | "DOCUMENT_ONLY";

export interface Application {
  /** "UDID-DEMO-1024" format. */
  applicationId: string;
  applicant: Applicant;
  documents: CaseDocument[];
  /** ISO 8601. */
  createdAt: string;
  identityMethod: IdentityMethod;
  assistedBy: AssistedBy | null;
}

export interface StageDefinition {
  key: StageKey;
  label: string;
  labelHindi: string;
  ownerRole: ActorRole;
  /** The office or person accountable while the case sits here. */
  ownerLabel: string;
  ownerLabelHindi: string;
  /** Proposed target, in days. The real service publishes no processing-time targets. */
  slaDays: number;
  isTerminal: boolean;
  /** Short plain-language description of what happens in this stage. */
  meaning: string;
  meaningHindi: string;
}

export interface ReasonCode {
  code: ReasonCodeKey;
  category: "DOCUMENT" | "ATTENDANCE" | "ASSESSMENT" | "DUPLICATE";
  plainEnglish: string;
  plainHindi: string;
  /** Which document caused it, where one did. */
  documentAtFault: DocType | null;
  /** True when the fault is administrative and the applicant keeps their queue place. */
  preservesQueuePosition: boolean;
  isAppealable: boolean;
  /** The single thing the applicant has to do next. */
  fixAction: string;
  fixActionHindi: string;
}
