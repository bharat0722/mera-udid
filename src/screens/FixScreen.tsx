import { useState } from "react";
import { DEMO_NOW, toIso } from "../core/clock";
import { replaceDocument, transition } from "../core/caseStore";
import { DOC_LABELS } from "../core/precheck";
import { useI18n } from "../i18n/I18nContext";
import { Link } from "../lib/router";
import { useCase } from "../lib/useCases";
import { AlertIcon, ArrowRightIcon, CheckIcon } from "../ui/Icons";
import type { StageKey } from "../core/types";

/**
 * Fix and resubmit.
 *
 * One problem, one action, nothing re-entered. The applicant already gave this office
 * their name, their district and their documents; asking again would be the system
 * making its own mistake somebody else's work.
 */
export function FixScreen({ applicationId }: { applicationId: string }) {
  const { t, locale } = useI18n();
  const view = useCase(applicationId);
  const [attached, setAttached] = useState(false);
  // Holds the outcome rather than a flag: once the case has moved back to the office
  // it is no longer "returned", so the confirmation cannot be derived from the case
  // any more and has to be remembered here.
  const [done, setDone] = useState<{ queueKept: boolean } | null>(null);

  if (!view) {
    return (
      <div className="column section--tight stack">
        <h1>{t.fix.title}</h1>
        <p>{t.track.notFound}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="column section--tight stack-5">
        <h1>{t.fix.doneTitle}</h1>
        <div className="callout callout--success stack">
          <p className="callout__title">
            <CheckIcon size={18} />
            {t.fix.doneBody}
          </p>
          <p>
            <strong>{done.queueKept ? t.fix.queueKept : t.fix.queueMoved}</strong>
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

  if (view.currentStage !== "RETURNED_FOR_DOCUMENT" || !view.activeReason) {
    return (
      <div className="column section--tight stack">
        <h1>{t.fix.title}</h1>
        <div className="callout callout--info">
          <p>{t.fix.nothingToFix}</p>
        </div>
        <p>
          <Link to={`/track/${applicationId}`} className="btn btn--secondary">
            {t.fix.backToCase}
          </Link>
        </p>
      </div>
    );
  }

  const reason = view.activeReason;
  const faultDoc = reason.documentAtFault;
  // The case goes back to whichever desk sent it, which the return event recorded.
  const returnTo = (view.activeReasonEvent?.fromStage ?? "DOC_VERIFICATION") as StageKey;

  const resubmit = () => {
    const timestamp = toIso(DEMO_NOW);
    if (faultDoc) {
      replaceDocument(applicationId, faultDoc, `${faultDoc.toLowerCase()}-v2.pdf`, timestamp);
    }
    transition({
      applicationId,
      toStage: returnTo,
      actorRole: "APPLICANT",
      actorId: "self",
      type: "RESUBMITTED",
      note: `Resubmitted after ${reason.code}.`,
      timestamp
    });
    setDone({ queueKept: reason.preservesQueuePosition });
  };

  return (
    <div className="column section--tight stack-5">
      <div className="stack">
        <h1>{t.fix.title}</h1>
        <p className="lede">{t.fix.lede}</p>
        <p className="small muted numeric">{applicationId}</p>
      </div>

      <section className="callout callout--attention stack" aria-labelledby="problem-title">
        <p className="callout__title" id="problem-title">
          <AlertIcon size={18} />
          {t.fix.problemTitle}
        </p>
        <p>
          <strong>{locale === "hi" ? reason.plainHindi : reason.plainEnglish}</strong>
        </p>
        {faultDoc && (
          <p className="small">
            {t.track.documentAtFault}:{" "}
            <strong>{locale === "hi" ? DOC_LABELS[faultDoc].hi : DOC_LABELS[faultDoc].en}</strong>
          </p>
        )}
        <p>{locale === "hi" ? reason.fixActionHindi : reason.fixAction}</p>
      </section>

      <div className="card stack">
        <label className={`choice${attached ? " choice--selected" : ""}`}>
          <input
            type="checkbox"
            checked={attached}
            onChange={() => setAttached((current) => !current)}
          />
          <span className="choice__text">
            <span className="choice__title">
              {t.fix.replaceLabel}
              {faultDoc
                ? ` — ${locale === "hi" ? DOC_LABELS[faultDoc].hi : DOC_LABELS[faultDoc].en}`
                : ""}
            </span>
            <span className="choice__note">{t.fix.replaceHint}</span>
          </span>
        </label>

        <div
          className={`callout ${
            reason.preservesQueuePosition ? "callout--success" : "callout--attention"
          }`}
        >
          <p className="callout__title">
            {reason.preservesQueuePosition ? t.track.queueProtected : t.track.queueLost}
          </p>
          <p className="small">
            {reason.preservesQueuePosition
              ? t.track.queueProtectedWhy
              : t.track.queueLostWhy}
          </p>
        </div>

        <div className="row">
          <button
            type="button"
            className="btn btn--primary"
            onClick={resubmit}
            disabled={!attached}
          >
            {t.fix.submit}
            <ArrowRightIcon size={18} />
          </button>
          <Link to={`/track/${applicationId}`} className="btn btn--quiet">
            {t.common.cancel}
          </Link>
        </div>
      </div>
    </div>
  );
}
