import { formatDate } from "../core/clock";
import type { CaseView, StepState, TimelineStep } from "../core/projections";
import { STAGE_DEFINITIONS } from "../core/stages";
import { useI18n } from "../i18n/I18nContext";
import { AlertIcon, CheckIcon, CircleIcon, CrossIcon, DotIcon } from "./Icons";

/**
 * The stepper.
 *
 * This component is the product. The claim in the headline — that you can see who has
 * your file and how long they have had it — is either true here or it is not true
 * anywhere.
 *
 * Three rules it follows without exception:
 *  1. Every state carries an icon *and* a text label. Nothing is signalled by colour
 *     alone, because a colour-only status is invisible to a large share of the people
 *     this service exists for.
 *  2. The current step is legible from across a room: tinted row, thick left edge,
 *     larger title, and the three facts that matter inside it.
 *  3. The whole road is always shown, including the stages not yet reached. Hiding the
 *     future is how "sent" became the only state anyone ever saw.
 */

function stateLabel(state: StepState, locale: "en" | "hi"): string {
  const labels = {
    en: {
      done: "Done",
      current: "Happening now",
      upcoming: "Not started",
      blocked: "Waiting for you",
      rejected: "Rejected"
    },
    hi: {
      done: "पूरा",
      current: "अभी चल रहा है",
      upcoming: "शुरू नहीं हुआ",
      blocked: "आपके काम का इंतज़ार",
      rejected: "अस्वीकार"
    }
  };
  return labels[locale][state];
}

function StepIcon({ state }: { state: StepState }) {
  switch (state) {
    case "done":
      return <CheckIcon size={18} />;
    case "current":
      return <DotIcon size={14} />;
    case "blocked":
      return <AlertIcon size={16} />;
    case "rejected":
      return <CrossIcon size={16} />;
    default:
      return <CircleIcon size={14} />;
  }
}

interface StepperProps {
  steps: TimelineStep[];
  view: CaseView;
}

export function Stepper({ steps, view }: StepperProps) {
  const { locale, t } = useI18n();

  return (
    <ol className="stepper">
      {steps.map((step) => {
        const definition = STAGE_DEFINITIONS[step.key];
        const label = locale === "hi" ? definition.labelHindi : definition.label;
        const meaning = locale === "hi" ? definition.meaningHindi : definition.meaning;
        const owner = locale === "hi" ? definition.ownerLabelHindi : definition.ownerLabel;
        const isLive = step.state === "current" || step.state === "blocked";

        return (
          <li
            key={`${step.key}-${step.enteredAt ?? "pending"}`}
            className={`stepper__item stepper__item--${step.state}`}
          >
            <span className="stepper__node">
              <StepIcon state={step.state} />
            </span>

            <div className="stepper__body">
              <span className="stepper__title">{label}</span>
              <span className="stepper__state">
                {stateLabel(step.state, locale)}
                {step.enteredAt ? ` · ${formatDate(step.enteredAt, locale)}` : ""}
              </span>

              {(isLive || step.state === "rejected") && (
                <>
                  <p className="small" style={{ marginTop: "var(--space-2)" }}>
                    {meaning}
                  </p>

                  <dl className="stepper__detail">
                    <div>
                      <dt>{t.track.holderLabel}</dt>
                      <dd>{owner}</dd>
                    </div>
                    {!definition.isTerminal && (
                      <div>
                        <dt>{t.common.dayInStage}</dt>
                        <dd className="numeric">
                          {view.daysInStage} {t.common.days}
                          {" · "}
                          <span className="muted">
                            {t.common.proposedTarget} {view.slaDays} {t.common.days}
                          </span>
                        </dd>
                      </div>
                    )}
                    {view.nextStep && (
                      <div>
                        <dt>{t.track.nextStepTitle}</dt>
                        <dd>
                          {view.nextStep.text}
                          {view.nextStep.date
                            ? ` — ${formatDate(view.nextStep.date, locale)}`
                            : ""}
                        </dd>
                      </div>
                    )}
                  </dl>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
