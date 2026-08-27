import { formatDate } from "../core/clock";
import type { CaseView } from "../core/projections";
import { useI18n } from "../i18n/I18nContext";
import { BreachChip, StageChip } from "./StageChip";

/**
 * The status card.
 *
 * The hierarchy is the whole point, so it is worth naming: *who has your file* is the
 * largest thing on the card, because that is the promise in the headline. *How long
 * they have had it* is the second, as a number big enough to read at a glance with its
 * proposed target beside it. District, ID and last-updated are quiet metadata.
 *
 * The rejected version of this — four equal-weight items in a definition list — was
 * the defect in the first build of this screen.
 */
export function StatusHeadline({ view }: { view: CaseView }) {
  const { t, locale } = useI18n();
  const definition = view.stageDefinition;
  const owner = locale === "hi" ? definition.ownerLabelHindi : definition.ownerLabel;

  return (
    <section className="status-headline" aria-labelledby="case-holder">
      <div className="status-headline__top stack-2">
        <div className="tag-row">
          <StageChip stage={view.currentStage} large />
          {view.isBreached && <BreachChip days={view.daysInStage} target={view.slaDays} />}
        </div>
        <p className="holder__label" id="case-holder-label">
          {t.track.holderLabel}
        </p>
        <p className="holder" id="case-holder">
          {owner}
        </p>
      </div>

      {!definition.isTerminal && (
        <div className={`clock${view.isBreached ? " clock--breached" : ""}`}>
          <span className="clock__value">{view.daysInStage}</span>
          <span>
            <span className="small">
              <strong>{t.common.dayInStage}</strong>
            </span>
            <br />
            <span className="clock__target">
              {t.common.proposedTarget}: {view.slaDays} {t.common.days} ·{" "}
              {view.isBreached ? t.track.breached : t.track.withinTarget}
            </span>
          </span>
        </div>
      )}

      <dl className="meta-list">
        <div>
          <dt>{t.common.applicationId}</dt>
          <dd className="numeric">{view.application.applicationId}</dd>
        </div>
        <div>
          <dt>{t.common.district}</dt>
          <dd>{view.application.applicant.district}</dd>
        </div>
        <div>
          <dt>{t.track.submittedOn}</dt>
          <dd>{formatDate(view.application.createdAt, locale)}</dd>
        </div>
        <div>
          <dt>{t.track.totalDays}</dt>
          <dd className="numeric">{view.totalDaysSinceSubmission}</dd>
        </div>
      </dl>
    </section>
  );
}
