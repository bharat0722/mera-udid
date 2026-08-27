import { formatDate } from "../core/clock";
import type { CaseView } from "../core/projections";
import { useI18n } from "../i18n/I18nContext";
import { Link } from "../lib/router";
import { useCaseStore } from "../lib/useCases";
import { projectCase } from "../core/projections";
import { useSession } from "../lib/useSession";
import { AlertIcon, ArrowRightIcon, CheckIcon, ClockIcon } from "../ui/Icons";
import { BreachChip, StageChip } from "../ui/StageChip";
import { SignInScreen } from "./SignInScreen";

/**
 * The applicant's own dashboard.
 *
 * This is the screen a citizen actually wants: not a search box asking them to remember
 * a seventeen-character ID, but "here is what you applied for and here is what is
 * happening to it". One line each, and the line says whether the ball is in their court
 * or somebody else's.
 */
function CaseRow({ view }: { view: CaseView }) {
  const { t, locale } = useI18n();
  const owner =
    locale === "hi"
      ? view.stageDefinition.ownerLabelHindi
      : view.stageDefinition.ownerLabel;

  const needsYou = view.stageDefinition.ownerRole === "APPLICANT";
  const finished = view.isComplete;

  const statusLine = finished
    ? t.auth.finished
    : needsYou
      ? t.auth.needsYou
      : view.isBreached
        ? t.auth.late
        : t.auth.onTrack;

  return (
    <div className="card stack-5">
      <div className="row row--between">
        <span className="small muted numeric">{view.application.applicationId}</span>
        <div className="tag-row">
          <StageChip stage={view.currentStage} />
          {view.isBreached && (
            <BreachChip days={view.daysInStage} target={view.slaDays} />
          )}
        </div>
      </div>

      <div>
        <span className="holder__label">{t.track.holderLabel}</span>
        <span className="holder">{owner}</span>
      </div>

      <p className="row" style={{ gap: "var(--space-2)" }}>
        {finished ? (
          <CheckIcon size={18} />
        ) : needsYou ? (
          <AlertIcon size={18} />
        ) : (
          <ClockIcon size={18} />
        )}
        <strong>{statusLine}</strong>
      </p>

      {!view.stageDefinition.isTerminal && (
        <p className="small muted numeric">
          {view.daysInStage} {t.common.days} · {t.common.proposedTarget}{" "}
          {view.slaDays} {t.common.days} · {t.track.submittedOn}{" "}
          {formatDate(view.application.createdAt, locale)}
        </p>
      )}

      {view.nextStep && (
        <div className="callout callout--info">
          <p className="callout__title">{t.track.nextStepTitle}</p>
          <p className="small">
            {view.nextStep.text}
            {view.nextStep.date ? ` — ${formatDate(view.nextStep.date, locale)}` : ""}
          </p>
        </div>
      )}

      <div className="row">
        <Link
          to={`/track/${view.application.applicationId}`}
          className="btn btn--primary btn--small"
        >
          {t.auth.openCase}
          <ArrowRightIcon size={16} />
        </Link>
        {needsYou && view.currentStage === "RETURNED_FOR_DOCUMENT" && (
          <Link
            to={`/fix/${view.application.applicationId}`}
            className="btn btn--secondary btn--small"
          >
            {t.track.fixAction}
          </Link>
        )}
      </div>
    </div>
  );
}

export function MyApplicationsScreen() {
  const { t } = useI18n();
  const session = useSession();
  const store = useCaseStore();

  // Not signed in: show the sign-in screen rather than an error. A judge who follows a
  // link here should land somewhere useful, not on a dead end.
  if (!session) return <SignInScreen />;

  const views = session.applicationIds
    .map((id) => {
      const application = store.applicationsById.get(id);
      if (!application) return null;
      return projectCase(application, store.eventsByApplication.get(id) ?? []);
    })
    .filter((view): view is CaseView => view !== null);

  return (
    <div className="column section--tight stack-6">
      <div className="stack">
        <h1>{t.auth.myTitle}</h1>
        <p className="lede">{t.auth.myLede}</p>
        <p className="small muted">
          {t.nav.signedInAs} <strong>{session.displayName}</strong>
        </p>
      </div>

      {views.length === 0 ? (
        <div className="card stack">
          <p>{t.auth.myEmpty}</p>
          <p>
            <Link to="/apply" className="btn btn--primary">
              {t.auth.startOne}
              <ArrowRightIcon size={18} />
            </Link>
          </p>
        </div>
      ) : (
        views.map((view) => (
          <CaseRow key={view.application.applicationId} view={view} />
        ))
      )}
    </div>
  );
}
