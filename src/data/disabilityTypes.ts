import type { DocType } from "../core/types";

/**
 * The 21 specified disabilities in the Schedule to the Rights of Persons with
 * Disabilities Act, 2016.
 *
 * The extra documents attached to each category are this prototype's proposal, not a
 * published national checklist — the real service does not publish one in a machine-
 * readable form, and this project does not invent facts it cannot source. The
 * pre-check UI says so on screen.
 */

export interface DisabilityType {
  key: string;
  label: string;
  labelHindi: string;
  /** Documents this category needs on top of the common four. */
  extraDocuments: DocType[];
}

export const COMMON_DOCUMENTS: DocType[] = [
  "IDENTITY_PROOF",
  "ADDRESS_PROOF",
  "PHOTOGRAPH",
  "MEDICAL_CERTIFICATE"
];

export const DISABILITY_TYPES: DisabilityType[] = [
  { key: "BLINDNESS", label: "Blindness", labelHindi: "दृष्टिहीनता", extraDocuments: ["VISION_ASSESSMENT"] },
  { key: "LOW_VISION", label: "Low vision", labelHindi: "अल्प दृष्टि", extraDocuments: ["VISION_ASSESSMENT"] },
  { key: "LEPROSY_CURED", label: "Leprosy cured person", labelHindi: "कुष्ठ रोग मुक्त व्यक्ति", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "HEARING_IMPAIRMENT", label: "Hearing impairment (deaf and hard of hearing)", labelHindi: "श्रवण बाधिता", extraDocuments: ["AUDIOMETRY_REPORT"] },
  { key: "LOCOMOTOR", label: "Locomotor disability", labelHindi: "चलन संबंधी विकलांगता", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "DWARFISM", label: "Dwarfism", labelHindi: "बौनापन", extraDocuments: [] },
  { key: "INTELLECTUAL", label: "Intellectual disability", labelHindi: "बौद्धिक विकलांगता", extraDocuments: ["PSYCH_ASSESSMENT"] },
  { key: "MENTAL_ILLNESS", label: "Mental illness", labelHindi: "मानसिक रुग्णता", extraDocuments: ["PSYCH_ASSESSMENT"] },
  { key: "AUTISM", label: "Autism spectrum disorder", labelHindi: "ऑटिज़्म स्पेक्ट्रम विकार", extraDocuments: ["PSYCH_ASSESSMENT"] },
  { key: "CEREBRAL_PALSY", label: "Cerebral palsy", labelHindi: "प्रमस्तिष्क पक्षाघात", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "MUSCULAR_DYSTROPHY", label: "Muscular dystrophy", labelHindi: "मांसपेशीय दुर्विकास", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "CHRONIC_NEUROLOGICAL", label: "Chronic neurological condition", labelHindi: "दीर्घकालिक तंत्रिका संबंधी स्थिति", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "LEARNING_DISABILITY", label: "Specific learning disability", labelHindi: "विशिष्ट अधिगम विकलांगता", extraDocuments: ["PSYCH_ASSESSMENT"] },
  { key: "MULTIPLE_SCLEROSIS", label: "Multiple sclerosis", labelHindi: "मल्टीपल स्क्लेरोसिस", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "SPEECH_LANGUAGE", label: "Speech and language disability", labelHindi: "वाणी और भाषा विकलांगता", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "THALASSEMIA", label: "Thalassemia", labelHindi: "थैलेसीमिया", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "HAEMOPHILIA", label: "Haemophilia", labelHindi: "हीमोफीलिया", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "SICKLE_CELL", label: "Sickle cell disease", labelHindi: "सिकल सेल रोग", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "MULTIPLE_DISABILITIES", label: "Multiple disabilities including deafblindness", labelHindi: "बहु-विकलांगता (मूक-बधिरता सहित)", extraDocuments: ["SPECIALIST_REPORT", "VISION_ASSESSMENT"] },
  { key: "ACID_ATTACK", label: "Acid attack survivor", labelHindi: "एसिड हमले से पीड़ित", extraDocuments: ["SPECIALIST_REPORT"] },
  { key: "PARKINSONS", label: "Parkinson's disease", labelHindi: "पार्किंसंस रोग", extraDocuments: ["SPECIALIST_REPORT"] }
];

export const DISABILITY_TYPES_BY_KEY = new Map(
  DISABILITY_TYPES.map((type) => [type.key, type])
);

export function disabilityLabel(key: string, locale: "en" | "hi" = "en"): string {
  const type = DISABILITY_TYPES_BY_KEY.get(key);
  if (!type) return key;
  return locale === "hi" ? type.labelHindi : type.label;
}
