import { useState } from "react";
import { annotate } from "../core/caseStore";
import { DEMO_NOW, formatDate, toIso } from "../core/clock";
import {
  canEscalate,
  ESCALATION_TIERS,
  escalationsOf,
  MP_ACT_CITATION,
  nextTier,
  RPWD_CITATION,
  statutoryStatus
} from "../core/escalation";
import { useI18n } from "../i18n/I18nContext";
import { Link } from "../lib/router";
import { useCase } from "../lib/useCases";
import { AlertIcon, ArrowRightIcon, CheckIcon, EscalateIcon } from "../ui/Icons";

/**
 * Raising a delay.
 *
 * The screen that closes the loop the rest of the product opens. Everywhere else we
 * tell a citizen how long they have waited and who is holding the file; without this
 * that is just a better-worded shrug.
 *
 * Two things it is careful not to do. It does not claim the applicant is owed a
 * penalty — whether a disability certificate is a notified service under the state
 * guarantee Act could not be verified, and telling a disabled person they are owed
 * money they may not be owed would be worse than saying nothing. And it does not move
 * the case: escalation records accountability, it does not conjure a doctor.
 */
export function EscalateScreen({ applicationId }: { applicationId: string }) {
  const { t, locale, fill } = useI18n();
  const view = useCase(applicationId);
  const [note, setNote] = useState("");
  const [done, setDone] = useState<{ authority: string } | null>(null);

  if (!view) {
    return (
      <div className="column section--tight stack">
        <h1>{t.escalate.raiseTitle}</h1>
        <p>{t.track.notFound}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="column section--tight stack-5">
        <h1>{t.escalate.doneTitle}</h1>
        <div className="callout callout--success stack">
          <p className="callout__title">
            <CheckIcon size={18} />
            {t.escalate.doneBody}
          </p>
          <p>
            <strong>
              {t.escalate.goesTo}: {done.authority}
            </strong>
          </p>
        </div>
        <p className="small muted">{t.escalate.notTransmitted}</p>
        <p>
          <Link to={`/track/${applicationId}`} className="btn btn--primary">
            {t.escalate.backToCase}
            <ArrowRightIcon size={18} />
          </Link>
        </p>
      </div>
    );
  }

  const statutory = statutoryStatus(view.application);
  const already = escalationsOf(view.events);
  const tier = nextTier(view.events);
  const allowed = canEscalate(
    view.application,
    view.events,
    view.isBreached,
    view.stageDefinition.isTerminal
  );

  const raise = () => {
    if (!tier) return;
    const definition = ESCALATION_TIERS[tier];
    annotate({
      applicationId,
      type: "ESCALATED",
      actorRole: "APPLICANT",
      actorId: "self",
      note: note.trim() === "" ? null : note.trim(),
      payload: {
        tier,
        authority: definition.authority,
        daysOverdue: statutory.daysOverdue,
        stageAtEscalation: view.currentStage
      },
      timestamp: toIso(DEMO_NOW)
    });
    setDone({ authority: definition.authority });
  };

  return (
    <div className="column section--tight stack-6">
      <div className="stack">
        <h1>{t.escalate.raiseTitle}</h1>
        <p className="lede">{t.escalate.raiseLead}</p>
        <p className="small muted numeric">{applicationId}</p>
      </div>

      {/* The legal footing, stated once and plainly. */}
      <section
        className={`callout ${statutory.isOverdue ? "callout--danger" : "callout--info"}`}
        aria-labelledby="limit-title"
      >
        <h2 className="callout__title" id="limit-title">
          <AlertIcon size={18} />
          {t.escalate.limitTitle}
        </h2>
        <p>
          <strong>
            {statutory.isOverdue
              ? fill(t.escalate.limitOverdue, { days: statutory.daysOverdue })
              : `${t.escalate.limitWithin} ${fill(t.escalate.limitDue, {
                  date: formatDate(statutory.deadline, locale)
                })}`}
          </strong>
        </p>
        <p className="small">{t.escalate.limitBasis}</p>
        <p className="small muted">{RPWD_CITATION}</p>
      </section>

      {already.length > 0 && (
        <div className="panel">
          <div className="panel__head">
            <h2 className="panel__title">{t.track.historyTitle}</h2>
          </div>
          <div className="panel__body">
            <ul className="bullet-list">
              {already.map((record) => (
                <li key={record.raisedAt}>
                  <EscalateIcon size={16} />
                  <span className="small">
                    {fill(t.escalate.alreadyRaised, {
                      date: formatDate(record.raisedAt, locale),
                      authority:
                        locale === "hi"
                          ? ESCALATION_TIERS[record.tier].authorityHindi
                          : ESCALATION_TIERS[record.tier].authority
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!allowed || !tier ? (
        <div className="callout callout--info stack">
          <p>{tier === null ? t.escalate.exhausted : t.escalate.notYet}</p>
          <p>
            <Link to={`/track/${applicationId}`} className="btn btn--secondary">
              {t.escalate.backToCase}
            </Link>
          </p>
        </div>
      ) : (
        <div className="card stack">
          <dl className="data-list">
            <div>
              <dt>{t.escalate.goesTo}</dt>
              <dd>
                {locale === "hi"
                  ? ESCALATION_TIERS[tier].authorityHindi
                  : ESCALATION_TIERS[tier].authority}
              </dd>
            </div>
            <div>
              <dt>{t.common.when}</dt>
              <dd>
                {fill(t.escalate.windowNote, {
                  days: ESCALATION_TIERS[tier].windowDays
                })}
              </dd>
            </div>
          </dl>
          <p className="small muted">{t.escalate.notTransmitted}</p>

          <div className="field" style={{ maxWidth: "none" }}>
            <label className="field__label" htmlFor="escalation-note">
              {t.escalate.groundsLabel}
            </label>
            <span className="field__hint" id="escalation-note-hint">
              {t.escalate.groundsHint}
            </span>
            <textarea
              id="escalation-note"
              className="textarea"
              value={note}
              aria-describedby="escalation-note-hint"
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <div className="row">
            <button type="button" className="btn btn--primary" onClick={raise}>
              <EscalateIcon size={18} />
              {t.escalate.submit}
            </button>
            <Link to={`/track/${applicationId}`} className="btn btn--quiet">
              {t.escalate.cancel}
            </Link>
          </div>
        </div>
      )}

      <p className="small muted">
        {t.escalate.structureNote} {MP_ACT_CITATION}
      </p>
    </div>
  );
}
