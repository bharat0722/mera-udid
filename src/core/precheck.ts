import {
  COMMON_DOCUMENTS,
  DISABILITY_TYPES_BY_KEY
} from "../data/disabilityTypes";
import type { DocType, IdentityMethod } from "./types";

/**
 * The document pre-check.
 *
 * This exists to kill the resubmission loop. Today an applicant finds out that a paper
 * was missing months after submitting — a return arrives, if it arrives at all, with no
 * explanation of what to fix. Checking the same rules *before* submission costs nothing
 * and removes an entire category of months-long delay.
 *
 * It is rules-based, deterministic and explainable on purpose. No document reading, no
 * model, no guessing: a fixed list per disability category, compared against what has
 * been attached. Every result can be traced to one line of this file, which is what
 * makes it safe to show a citizen as a promise.
 */

export const DOC_LABELS: Record<DocType, { en: string; hi: string }> = {
  IDENTITY_PROOF: { en: "Identity proof", hi: "पहचान प्रमाण" },
  ADDRESS_PROOF: { en: "Address proof", hi: "पता प्रमाण" },
  PHOTOGRAPH: { en: "Recent photograph", hi: "हाल की फ़ोटो" },
  MEDICAL_CERTIFICATE: { en: "Medical certificate", hi: "मेडिकल प्रमाणपत्र" },
  SPECIALIST_REPORT: { en: "Specialist report", hi: "विशेषज्ञ रिपोर्ट" },
  AUDIOMETRY_REPORT: { en: "Audiometry report", hi: "श्रवण जाँच रिपोर्ट" },
  VISION_ASSESSMENT: { en: "Vision assessment", hi: "दृष्टि जाँच रिपोर्ट" },
  PSYCH_ASSESSMENT: { en: "Psychological assessment", hi: "मनोवैज्ञानिक आकलन" },
  OLD_CERTIFICATE: { en: "Earlier disability certificate", hi: "पुराना विकलांगता प्रमाणपत्र" }
};

export interface PrecheckItem {
  docType: DocType;
  label: string;
  labelHindi: string;
  present: boolean;
  /** Why this document is on the list for this applicant. */
  why: string;
  whyHindi: string;
}

export interface PrecheckResult {
  ok: boolean;
  items: PrecheckItem[];
  missing: DocType[];
  /** Notes that are not blocking, such as the non-biometric identity route. */
  advisories: Array<{ text: string; textHindi: string }>;
}

/** The full document list for one disability category. */
export function requiredDocumentsFor(disabilityTypeKey: string): DocType[] {
  const type = DISABILITY_TYPES_BY_KEY.get(disabilityTypeKey);
  const extras = type ? type.extraDocuments : [];
  return [...COMMON_DOCUMENTS, ...extras];
}

export function runPrecheck(
  disabilityTypeKey: string,
  providedDocuments: DocType[],
  identityMethod: IdentityMethod = "DOCUMENT_ONLY"
): PrecheckResult {
  const type = DISABILITY_TYPES_BY_KEY.get(disabilityTypeKey);
  const required = requiredDocumentsFor(disabilityTypeKey);
  const provided = new Set(providedDocuments);

  const items: PrecheckItem[] = required.map((docType) => {
    const isCommon = COMMON_DOCUMENTS.includes(docType);
    return {
      docType,
      label: DOC_LABELS[docType].en,
      labelHindi: DOC_LABELS[docType].hi,
      present: provided.has(docType),
      why: isCommon
        ? "Needed for every application."
        : `Needed because you selected ${type ? type.label : disabilityTypeKey}.`,
      whyHindi: isCommon
        ? "हर आवेदन के लिए ज़रूरी।"
        : `आपने ${type ? type.labelHindi : disabilityTypeKey} चुना है, इसलिए ज़रूरी।`
    };
  });

  const missing = items.filter((item) => !item.present).map((item) => item.docType);

  const advisories: Array<{ text: string; textHindi: string }> = [];
  if (identityMethod !== "FINGERPRINT") {
    advisories.push({
      text: "You have chosen not to give fingerprints. That is allowed here, and your identity documents will be checked by an officer instead.",
      textHindi:
        "आपने फ़िंगरप्रिंट न देने का विकल्प चुना है। यह यहाँ स्वीकार्य है; अधिकारी आपके पहचान दस्तावेज़ जाँचेंगे।"
    });
  }

  return { ok: missing.length === 0, items, missing, advisories };
}
