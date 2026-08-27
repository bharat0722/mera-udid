import type { StageDefinition, StageKey } from "./types";

/**
 * The stage catalogue and the transition graph.
 *
 * Every SLA target below is *proposed by this prototype*. The real UDID service
 * publishes no processing-time targets — the government's own parliamentary answers
 * describe medical board scheduling as depending on "the availability of doctors",
 * with no published throughput. The UI must always label these as proposed.
 */

export const STAGE_DEFINITIONS: Record<StageKey, StageDefinition> = {
  SUBMITTED: {
    key: "SUBMITTED",
    label: "Application submitted",
    labelHindi: "आवेदन जमा हुआ",
    ownerRole: "SYSTEM",
    ownerLabel: "Mera UDID system",
    ownerLabelHindi: "मेरा UDID प्रणाली",
    slaDays: 1,
    isTerminal: false,
    meaning: "Your application has been received and given an ID.",
    meaningHindi: "आपका आवेदन मिल गया है और उसे एक आईडी दी गई है।"
  },
  DOC_VERIFICATION: {
    key: "DOC_VERIFICATION",
    label: "Documents being checked",
    labelHindi: "दस्तावेज़ जाँचे जा रहे हैं",
    ownerRole: "SW_OFFICER",
    ownerLabel: "District Social Welfare Office",
    ownerLabelHindi: "जिला समाज कल्याण कार्यालय",
    slaDays: 7,
    isTerminal: false,
    meaning: "An officer is checking that your documents are complete and readable.",
    meaningHindi: "एक अधिकारी जाँच रहा है कि आपके दस्तावेज़ पूरे और पढ़ने योग्य हैं।"
  },
  BOARD_SCHEDULED: {
    key: "BOARD_SCHEDULED",
    label: "Medical board appointment scheduled",
    labelHindi: "मेडिकल बोर्ड की तारीख तय",
    ownerRole: "MEDICAL_BOARD",
    ownerLabel: "District Hospital Medical Board",
    ownerLabelHindi: "जिला अस्पताल मेडिकल बोर्ड",
    slaDays: 21,
    isTerminal: false,
    meaning: "You have an appointment date with the doctors who will assess you.",
    meaningHindi: "आपको उन डॉक्टरों से मिलने की तारीख मिल गई है जो आकलन करेंगे।"
  },
  BOARD_ASSESSED: {
    key: "BOARD_ASSESSED",
    label: "Assessment recorded",
    labelHindi: "आकलन दर्ज हुआ",
    ownerRole: "MEDICAL_BOARD",
    ownerLabel: "District Hospital Medical Board",
    ownerLabelHindi: "जिला अस्पताल मेडिकल बोर्ड",
    slaDays: 1,
    isTerminal: false,
    meaning: "The board has seen you and written down its assessment.",
    meaningHindi: "बोर्ड ने आपको देख लिया है और अपना आकलन दर्ज कर दिया है।"
  },
  CERTIFICATE_ISSUED: {
    key: "CERTIFICATE_ISSUED",
    label: "Certificate issued",
    labelHindi: "प्रमाणपत्र जारी",
    ownerRole: "SW_OFFICER",
    ownerLabel: "District Social Welfare Office",
    ownerLabelHindi: "जिला समाज कल्याण कार्यालय",
    slaDays: 7,
    isTerminal: false,
    meaning: "Your disability certificate has been issued.",
    meaningHindi: "आपका विकलांगता प्रमाणपत्र जारी हो गया है।"
  },
  CARD_GENERATED: {
    key: "CARD_GENERATED",
    label: "UDID card generated",
    labelHindi: "UDID कार्ड बन गया",
    ownerRole: "SYSTEM",
    ownerLabel: "Mera UDID system",
    ownerLabelHindi: "मेरा UDID प्रणाली",
    slaDays: 3,
    isTerminal: true,
    meaning: "Your card exists and can be used.",
    meaningHindi: "आपका कार्ड बन चुका है और इस्तेमाल किया जा सकता है।"
  },
  RETURNED_FOR_DOCUMENT: {
    key: "RETURNED_FOR_DOCUMENT",
    label: "Waiting for you to fix something",
    labelHindi: "आपके सुधार का इंतज़ार",
    ownerRole: "APPLICANT",
    ownerLabel: "You",
    ownerLabelHindi: "आप",
    slaDays: 14,
    isTerminal: false,
    meaning: "Something specific needs fixing. The exact problem is named below.",
    meaningHindi: "कुछ ठीक करना है। नीचे साफ़ लिखा है कि क्या।"
  },
  REJECTED: {
    key: "REJECTED",
    label: "Application rejected",
    labelHindi: "आवेदन अस्वीकार",
    ownerRole: "SW_OFFICER",
    ownerLabel: "District Social Welfare Office",
    ownerLabelHindi: "जिला समाज कल्याण कार्यालय",
    slaDays: 90,
    isTerminal: true,
    meaning: "The application was refused. You may appeal within 90 days.",
    meaningHindi: "आवेदन अस्वीकार हुआ। आप 90 दिन के भीतर अपील कर सकते हैं।"
  },
  WITHDRAWN: {
    key: "WITHDRAWN",
    label: "Withdrawn by applicant",
    labelHindi: "आवेदक ने वापस लिया",
    ownerRole: "APPLICANT",
    ownerLabel: "You",
    ownerLabelHindi: "आप",
    slaDays: 0,
    isTerminal: true,
    meaning: "You withdrew this application.",
    meaningHindi: "आपने यह आवेदन वापस ले लिया।"
  },
  DUPLICATE_MERGED: {
    key: "DUPLICATE_MERGED",
    label: "Merged into another application",
    labelHindi: "दूसरे आवेदन में मिलाया गया",
    ownerRole: "SW_OFFICER",
    ownerLabel: "District Social Welfare Office",
    ownerLabelHindi: "जिला समाज कल्याण कार्यालय",
    slaDays: 0,
    isTerminal: true,
    meaning: "This is the same person as another application, which continues instead.",
    meaningHindi: "यह किसी अन्य आवेदन के समान व्यक्ति है; वही आवेदन आगे बढ़ रहा है।"
  }
};

/** The happy path, in order. Used to render the stepper. */
export const ACTIVE_STAGE_ORDER: StageKey[] = [
  "SUBMITTED",
  "DOC_VERIFICATION",
  "BOARD_SCHEDULED",
  "BOARD_ASSESSED",
  "CERTIFICATE_ISSUED",
  "CARD_GENERATED"
];

export const ALL_STAGE_KEYS: StageKey[] = Object.keys(STAGE_DEFINITIONS) as StageKey[];

/**
 * Sum of the proposed SLA targets along the happy path. Shown against the real-world
 * 253-day Madhya Pradesh average reported from parliamentary data.
 */
export const TOTAL_SLA_DAYS = ACTIVE_STAGE_ORDER.reduce(
  (total, key) => total + STAGE_DEFINITIONS[key].slaDays,
  0
);

/**
 * Which stage may follow which. A transition that is not listed here is refused by
 * the state machine — the UI cannot talk the system into an impossible move.
 */
export const ALLOWED_TRANSITIONS: Record<StageKey, StageKey[]> = {
  SUBMITTED: ["DOC_VERIFICATION", "WITHDRAWN", "DUPLICATE_MERGED"],
  DOC_VERIFICATION: [
    "BOARD_SCHEDULED",
    "RETURNED_FOR_DOCUMENT",
    "REJECTED",
    "WITHDRAWN",
    "DUPLICATE_MERGED"
  ],
  BOARD_SCHEDULED: ["BOARD_ASSESSED", "RETURNED_FOR_DOCUMENT", "REJECTED", "WITHDRAWN"],
  BOARD_ASSESSED: ["CERTIFICATE_ISSUED", "RETURNED_FOR_DOCUMENT", "REJECTED", "WITHDRAWN"],
  CERTIFICATE_ISSUED: ["CARD_GENERATED", "WITHDRAWN"],
  CARD_GENERATED: [],
  // Resubmission returns the case to whichever desk sent it back.
  RETURNED_FOR_DOCUMENT: [
    "DOC_VERIFICATION",
    "BOARD_SCHEDULED",
    "BOARD_ASSESSED",
    "WITHDRAWN"
  ],
  REJECTED: [],
  WITHDRAWN: [],
  DUPLICATE_MERGED: []
};

/** The first stage of any application. There is no null state. */
export const INITIAL_STAGE: StageKey = "SUBMITTED";

export function isStageKey(value: unknown): value is StageKey {
  return typeof value === "string" && value in STAGE_DEFINITIONS;
}

export function getStage(key: StageKey): StageDefinition {
  return STAGE_DEFINITIONS[key];
}

export function isTerminal(key: StageKey): boolean {
  return STAGE_DEFINITIONS[key].isTerminal;
}

/** True when `to` can legally follow `from`. */
export function canTransition(from: StageKey | null, to: StageKey): boolean {
  if (from === null) return to === INITIAL_STAGE;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Stages that require a structured reason code before the system will accept them. */
export const STAGES_REQUIRING_REASON: StageKey[] = ["RETURNED_FOR_DOCUMENT", "REJECTED"];

export function requiresReasonCode(to: StageKey): boolean {
  return STAGES_REQUIRING_REASON.includes(to);
}
