import { STAGE_DEFINITIONS } from "../core/stages";
import type { StageKey } from "../core/types";
import { useI18n } from "../i18n/I18nContext";
import { AlertIcon, CheckIcon, ClockIcon, CrossIcon } from "./Icons";

/**
 * A stage chip. The variant is chosen by meaning, not by mood: an exception is amber,
 * a refusal is red, a finished case is green, everything in motion is blue. The label
 * always spells the stage out, so the colour is reinforcement rather than information.
 */

type Variant = "progress" | "done" | "attention" | "danger" | "neutral";

function variantFor(stage: StageKey): Variant {
  switch (stage) {
    case "CARD_GENERATED":
    case "CERTIFICATE_ISSUED":
      return "done";
    case "RETURNED_FOR_DOCUMENT":
      return "attention";
    case "REJECTED":
      return "danger";
    case "WITHDRAWN":
    case "DUPLICATE_MERGED":
      return "neutral";
    default:
      return "progress";
  }
}

function IconFor({ stage }: { stage: StageKey }) {
  switch (variantFor(stage)) {
    case "done":
      return <CheckIcon size={15} />;
    case "attention":
      return <AlertIcon size={15} />;
    case "danger":
      return <CrossIcon size={15} />;
    default:
      return <ClockIcon size={15} />;
  }
}

export function StageChip({ stage, large }: { stage: StageKey; large?: boolean }) {
  const { locale } = useI18n();
  const definition = STAGE_DEFINITIONS[stage];
  const label = locale === "hi" ? definition.labelHindi : definition.label;

  return (
    <span className={`chip chip--${variantFor(stage)}${large ? " chip--large" : ""}`}>
      <IconFor stage={stage} />
      {label}
    </span>
  );
}

export function BreachChip({ days, target }: { days: number; target: number }) {
  const { locale } = useI18n();
  const over = days - target;
  return (
    <span className="chip chip--danger">
      <AlertIcon size={15} />
      {locale === "hi"
        ? `लक्ष्य से ${over} दिन आगे`
        : `${over} ${over === 1 ? "day" : "days"} past target`}
    </span>
  );
}
