import { useState } from "react";
import { annotate } from "../core/caseStore";
import { DEMO_NOW, daysBetween, formatDate, toIso } from "../core/clock";
import { useI18n } from "../i18n/I18nContext";
import { Link } from "../lib/router";
import { useCase } from "../lib/useCases";
import { AlertIcon, ArrowRightIcon, CheckIcon } from "../ui/Icons";

/**
 * Appeal.
 *
 * Deliberately small. Section 59 of the RPwD Act 2016 gives 90 days to appeal a
 * refusal; this screen exists to show that the loop closes — the appeal is appended to
 * the case log as an event and appears on the timeline like everything else. What
 * happens to the appeal afterwards is not modelled, and PENDING.md says so.
 */
export function AppealScreen({ applicationId }: { applicationId: string }) {
  const { t, locale, fill } = useI18n();
  const view = useCase(applicationId);
  const [grounds, setGrounds] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!view) {
    return (
      <div className="column section--tight stack">
        <h1>{t.appeal.title}</h1>
        <p>{t.track.notFound}</p>
      </div>
    );
  }

  if (view.currentStage !== "REJECTED" || !view.activeReason) {
    return (
      <div className="column section--tight stack">
        <h1>{t.appeal.title}</h1>
        <div className="callout callout--info">
          <p>{t.appeal.notRejected}</p>
        </div>
        <p>
          <Link to={`/track/${applicationId}`} className="btn btn--secondary">
            {t.fix.backToCase}
          </Link>
        </p>
      </div>
    );
  }

  const rejectedAt = view.activeReasonEvent?.timestamp ?? view.enteredCurrentStageAt;
  const daysSince = daysBetween(rejectedAt, DEMO_NOW);
  const withinWindow = daysSince <= 90;

  const submit = () => {
    if (grounds.trim().length < 10) {
      setError(t.appeal.validation);
      return;
    }
    annotate({
      applicationId,
      type: "APPEAL_LODGED",
      actorRole: "APPLICANT",
      actorId: "self",
      note: grounds.trim(),
      payload: { againstReasonCode: view.activeReason?.code ?? null },
      timestamp: toIso(DEMO_NOW)
    });
    setDone(true);
  };

  if (done || view.hasAppealed) {
    return (
      <div className="column section--tight stack-5">
        <h1>{t.appeal.doneTitle}</h1>
        <div className="callout callout--success">
          <p className="callout__title">
            <CheckIcon size={18} />
            {t.appeal.doneBody}
          </p>
        </div>
        <p>
          <Link to={`/track/${applicationId}`} className="btn btn--primary">
            {t.fix.backToCase}
            <ArrowRightIcon size={18} />
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="column section--tight stack-5">
      <div className="stack">
        <h1>{t.appeal.title}</h1>
        <p className="lede">{t.appeal.lede}</p>
        <p className="small muted numeric">{applicationId}</p>
      </div>

      <section className="callout callout--danger stack">
        <p className="callout__title">{t.appeal.reasonGiven}</p>
        <p>
          <strong>
            {locale === "hi"
              ? view.activeReason.plainHindi
              : view.activeReason.plainEnglish}
          </strong>
        </p>
        {view.appealDeadline && (
          <p className="small">
            {fill(t.track.appealDeadline, {
              date: formatDate(view.appealDeadline, locale)
            })}
          </p>
        )}
      </section>

      {!withinWindow ? (
        <div className="callout callout--attention">
          <p className="callout__title">
            <AlertIcon size={18} />
            {t.appeal.tooLate}
          </p>
        </div>
      ) : (
        <div className="card stack">
          <div className={`field${error ? " field--invalid" : ""}`} style={{ maxWidth: "none" }}>
            <label className="field__label" htmlFor="grounds">
              {t.appeal.groundsLabel}
            </label>
            <span className="field__hint" id="grounds-hint">
              {t.appeal.groundsHint}
            </span>
            {error && (
              <span className="field__error" id="grounds-error">
                <AlertIcon size={16} />
                {error}
              </span>
            )}
            <textarea
              id="grounds"
              className="textarea"
              value={grounds}
              aria-describedby={error ? "grounds-hint grounds-error" : "grounds-hint"}
              aria-invalid={error ? true : undefined}
              onChange={(event) => {
                setGrounds(event.target.value);
                setError(null);
              }}
            />
          </div>

          <div className="row">
            <button type="button" className="btn btn--primary" onClick={submit}>
              {t.appeal.submit}
              <ArrowRightIcon size={18} />
            </button>
            <Link to={`/track/${applicationId}`} className="btn btn--quiet">
              {t.common.cancel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
