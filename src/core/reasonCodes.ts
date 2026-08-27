import type { ReasonCode, ReasonCodeKey } from "./types";

/**
 * Structured reason codes.
 *
 * The defect being fixed: a return or rejection today arrives as silence or as free
 * text. A review left on the government's own UDID app in April 2026 puts it plainly —
 * the app gives "absolutely no notification regarding the rejections", and hospital
 * staff offer no explanation either.
 *
 * So every return and every rejection in this system carries one of these codes. The
 * code is the thing the officer picks; the plain-language sentence and the single fix
 * action are derived from it. An officer cannot invent a reason, and cannot leave one out.
 */

export const REASON_CODES: Record<ReasonCodeKey, ReasonCode> = {
  DOC_MISSING_MEDICAL: {
    code: "DOC_MISSING_MEDICAL",
    category: "DOCUMENT",
    plainEnglish: "The medical certificate was not attached.",
    plainHindi: "मेडिकल प्रमाणपत्र संलग्न नहीं था।",
    documentAtFault: "MEDICAL_CERTIFICATE",
    preservesQueuePosition: true,
    isAppealable: false,
    fixAction: "Attach your medical certificate and send the application back.",
    fixActionHindi: "अपना मेडिकल प्रमाणपत्र लगाकर आवेदन वापस भेजें।"
  },
  DOC_ILLEGIBLE: {
    code: "DOC_ILLEGIBLE",
    category: "DOCUMENT",
    plainEnglish: "The uploaded document could not be read clearly.",
    plainHindi: "अपलोड किया गया दस्तावेज़ साफ़ पढ़ा नहीं जा सका।",
    documentAtFault: null,
    preservesQueuePosition: true,
    isAppealable: false,
    fixAction: "Upload a clearer photo or scan of the same document.",
    fixActionHindi: "उसी दस्तावेज़ की साफ़ फ़ोटो या स्कैन अपलोड करें।"
  },
  DOC_NAME_MISMATCH: {
    code: "DOC_NAME_MISMATCH",
    category: "DOCUMENT",
    plainEnglish: "The name differs between your documents.",
    plainHindi: "आपके दस्तावेज़ों में नाम अलग-अलग है।",
    documentAtFault: null,
    preservesQueuePosition: true,
    isAppealable: false,
    fixAction: "Upload a document where the name matches, or add a name-change record.",
    fixActionHindi: "मिलते-जुलते नाम वाला दस्तावेज़ या नाम बदलने का रिकॉर्ड लगाएँ।"
  },
  DOC_EXPIRED: {
    code: "DOC_EXPIRED",
    category: "DOCUMENT",
    plainEnglish: "The document is older than this office accepts.",
    plainHindi: "यह दस्तावेज़ कार्यालय की स्वीकार्य अवधि से पुराना है।",
    documentAtFault: null,
    preservesQueuePosition: true,
    isAppealable: false,
    fixAction: "Upload a more recent version of the same document.",
    fixActionHindi: "उसी दस्तावेज़ का हाल का संस्करण अपलोड करें।"
  },
  BOARD_NO_SHOW: {
    code: "BOARD_NO_SHOW",
    category: "ATTENDANCE",
    plainEnglish: "You did not attend the medical board appointment.",
    plainHindi: "आप मेडिकल बोर्ड की तय तारीख पर नहीं पहुँचे।",
    documentAtFault: null,
    // The applicant missing an appointment is an applicant-side failure, so the
    // queue position is not preserved. This is the only document-free code where
    // that is true, and it is the one the UI must explain most carefully.
    preservesQueuePosition: false,
    isAppealable: true,
    fixAction: "Ask for a new appointment date, or appeal if you were not told in time.",
    fixActionHindi: "नई तारीख माँगें, या समय पर सूचना न मिलने पर अपील करें।"
  },
  ASSESSMENT_INCOMPLETE: {
    code: "ASSESSMENT_INCOMPLETE",
    category: "ASSESSMENT",
    plainEnglish: "The board could not complete the assessment.",
    plainHindi: "बोर्ड आकलन पूरा नहीं कर सका।",
    documentAtFault: null,
    preservesQueuePosition: true,
    isAppealable: true,
    fixAction: "The board will call you back. No action is needed from you yet.",
    fixActionHindi: "बोर्ड आपको दोबारा बुलाएगा। अभी आपको कुछ नहीं करना है।"
  },
  DUPLICATE_APPLICATION: {
    code: "DUPLICATE_APPLICATION",
    category: "DUPLICATE",
    plainEnglish: "An earlier application for the same person already exists.",
    plainHindi: "इसी व्यक्ति का पहले से एक आवेदन मौजूद है।",
    documentAtFault: null,
    preservesQueuePosition: true,
    isAppealable: true,
    fixAction: "Track the earlier application instead. Its ID is shown on this page.",
    fixActionHindi: "पहले वाले आवेदन को ट्रैक करें। उसकी आईडी इसी पेज पर दी है।"
  }
};

export const REASON_CODE_KEYS = Object.keys(REASON_CODES) as ReasonCodeKey[];

export function isReasonCodeKey(value: unknown): value is ReasonCodeKey {
  return typeof value === "string" && value in REASON_CODES;
}

export function getReasonCode(key: ReasonCodeKey): ReasonCode {
  return REASON_CODES[key];
}

/** Codes an officer may use when sending a case back to the applicant. */
export const RETURN_REASON_CODES: ReasonCodeKey[] = [
  "DOC_MISSING_MEDICAL",
  "DOC_ILLEGIBLE",
  "DOC_NAME_MISMATCH",
  "DOC_EXPIRED",
  "ASSESSMENT_INCOMPLETE"
];

/** Codes an officer may use when refusing a case outright. */
export const REJECT_REASON_CODES: ReasonCodeKey[] = [
  "BOARD_NO_SHOW",
  "DUPLICATE_APPLICATION",
  "ASSESSMENT_INCOMPLETE"
];
