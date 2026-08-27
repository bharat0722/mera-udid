import { useEffect, useRef, useState, type FormEvent } from "react";
import { formatDate } from "../core/clock";
import { DOC_LABELS } from "../core/precheck";
import { queueAnchorAt, queuePosition } from "../core/queue";
import { daysUntil, forecast, sittingDayNames } from "../core/boardSchedule";
import {
  canEscalate,
  escalationsOf,
  ESCALATION_TIERS,
  statutoryStatus
} from "../core/escalation";
import { useBoardPlace } from "../lib/useBoard";
import { useI18n } from "../i18n/I18nContext";
import { Link, navigate } from "../lib/router";
import {
  useCase,
  useCaseStore,
  useIsUnplaceable,
  useQueueEntries
} from "../lib/useCases";
import { disabilityLabel } from "../data/disabilityTypes";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  CrossIcon,
  EscalateIcon,
  HospitalIcon,
  SearchIcon
} from "../ui/Icons";
import { StatusHeadline } from "../ui/StatusHeadline";
import { Stepper } from "../ui/Stepper";
import type { CaseEvent } from "../core/types";
import type { CaseView } from "../core/projections";
import { STAGE_DEFINITIONS } from "../core/stages";
import { getReasonCode, isReasonCodeKey } from "../core/reasonCodes";
import { TableScroll } from "../ui/TableScroll";

const trackServiceHero = new URL("../assets/track-case-service-hero.webp", import.meta.url).href;

const EVENT_LABELS: Record<CaseEvent["type"], string> = {
  STAGE_ENTERED: "Moved to a new stage",
  RETURNED: "Sent back to the applicant",
  REJECTED: "Application rejected",
  RESUBMITTED: "Applicant resubmitted",
  WITHDRAWN: "Withdrawn by the applicant",
  MERGED: "Merged as a duplicate",
  DOCUMENT_ADDED: "Document attached",
  ASSESSMENT_RECORDED: "Assessment recorded",
  APPEAL_LODGED: "Appeal lodged",
  ESCALATED: "Delay escalated to a higher authority",
  NOTE_ADDED: "Note added"
};

const ACTOR_LABELS: Record<CaseEvent["actorRole"], string> = {
  APPLICANT: "Applicant",
  SW_OFFICER: "District Social Welfare Office",
  MEDICAL_BOARD: "District Hospital Medical Board",
  SYSTEM: "System"
};

function LookupForm({
  initialValue,
  compact = false
}: {
  initialValue: string;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const [value, setValue] = useState(initialValue);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim().toUpperCase();
    if (trimmed.length === 0) return;
    navigate(`/track/${trimmed}`);
  };

  // The compact form sits next to a case that is already on screen: same control,
  // no hint text, no card around it, so the answer stays the biggest thing.
  if (compact) {
    return (
      <form onSubmit={onSubmit} className="inline-lookup">
        <div className="field">
          <label className="field__label" htmlFor="application-id">
            {t.track.label}
          </label>
          <input
            id="application-id"
            name="application-id"
            className="input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button type="submit" className="btn btn--secondary">
          <SearchIcon size={18} />
          {t.track.button}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card">
      <div className="field" style={{ marginBottom: 0 }}>
        <label className="field__label" htmlFor="application-id">
          {t.track.label}
        </label>
        <span className="field__hint" id="application-id-hint">
          {t.track.hint}
        </span>
        <div className="field-row">
          <input
            id="application-id"
            name="application-id"
            className="input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-describedby="application-id-hint"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="btn btn--primary">
            <SearchIcon size={18} />
            {t.track.button}
          </button>
        </div>
      </div>
    </form>
  );
}

/** The landing page teaches the value of tracking before asking a person for an ID. */
function TrackingGuide() {
  const { t } = useI18n();
  const guideItems = [
    { title: t.track.needTitle, body: t.track.needBody },
    { title: t.track.seeTitle, body: t.track.seeBody },
    { title: t.track.actionTitle, body: t.track.actionBody }
  ];

  return (
    <section className="track-guide" aria-labelledby="track-guide-title">
      <header className="track-guide__intro">
        <div>
          <p className="eyebrow">{t.nav.citizenServices}</p>
          <h2 id="track-guide-title">{t.track.landingTitle}</h2>
        </div>
        <p className="lede">{t.track.landingLead}</p>
      </header>

      <div className="track-guide__journey-wrap">
        <p className="track-guide__journey-title">{t.track.journeyTitle}</p>
        <ol className="track-guide__journey">
          {guideItems.map((item, index) => (
            <li key={item.title}>
              <span className="track-guide__number" aria-hidden="true">{index + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p className="small">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="track-guide__action">
        <p><strong>{t.track.noIdTitle}</strong></p>
        <Link to="/apply" className="btn btn--secondary btn--small">
          {t.track.noIdAction}
          <ArrowRightIcon size={16} />
        </Link>
      </div>
    </section>
  );
}

function AuditTrail({ events }: { events: CaseEvent[] }) {
  const { t, locale } = useI18n();

  return (
    <section className="panel" aria-labelledby="audit-title">
      <div className="panel__head">
        <h2 className="panel__title" id="audit-title">
          {t.track.historyTitle}
        </h2>
      </div>
      <TableScroll label="Full audit trail for this case">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">{t.common.when}</th>
              <th scope="col">What happened</th>
              <th scope="col">{t.common.who}</th>
              <th scope="col">{t.common.reason}</th>
            </tr>
          </thead>
          <tbody>
            {events
              .slice()
              .reverse()
              .map((event) => {
                const reason =
                  event.reasonCode && isReasonCodeKey(event.reasonCode)
                    ? getReasonCode(event.reasonCode)
                    : null;
                return (
                  <tr key={event.eventId}>
                    <td className="numeric">{formatDate(event.timestamp, locale)}</td>
                    <td>
                      <strong>{EVENT_LABELS[event.type]}</strong>
                      {event.toStage && STAGE_DEFINITIONS[event.toStage] && (
                        <>
                          <br />
                          <span className="muted">
                            {locale === "hi"
                              ? STAGE_DEFINITIONS[event.toStage].labelHindi
                              : STAGE_DEFINITIONS[event.toStage].label}
                          </span>
                        </>
                      )}
                      {event.note && (
                        <>
                          <br />
                          <span className="muted">{event.note}</span>
                        </>
                      )}
                    </td>
                    <td>
                      {ACTOR_LABELS[event.actorRole]}
                      <br />
                      <span className="muted numeric">{event.actorId}</span>
                    </td>
                    <td>
                      {reason ? (
                        <>
                          <span className="numeric small">{reason.code}</span>
                          <br />
                          <span className="muted">
                            {locale === "hi" ? reason.plainHindi : reason.plainEnglish}
                          </span>
                        </>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </TableScroll>
      <div className="panel__body">
        <p className="small muted">{t.track.historyNote}</p>
      </div>
    </section>
  );
}

/**
 * When the board will actually see you.
 *
 * The single question the real service cannot answer. It is a forecast off a published
 * cadence rather than a promise, and it says so — but a forecast can be challenged, and
 * silence cannot.
 */
function BoardForecastPanel({ applicationId }: { applicationId: string }) {
  const { t, locale, fill } = useI18n();
  const place = useBoardPlace(applicationId);
  if (!place) return null;

  const result = forecast(place.schedule, place.position, place.queueDepth);

  return (
    <section className="card stack" aria-labelledby="board-forecast-title">
      <h2 className="card__title row" id="board-forecast-title" style={{ gap: "var(--space-2)" }}>
        <HospitalIcon size={20} />
        {t.board.yourDateTitle}
      </h2>

      {result.expectedDate ? (
        <div className="clock" style={{ borderRadius: "var(--radius-button)", border: "1px solid var(--border)" }}>
          <span className="clock__value" style={{ fontSize: "var(--text-h1)" }}>
            {formatDate(result.expectedDate, locale)}
          </span>
          <span>
            <span className="small">
              <strong>{t.board.yourExpected}</strong>
            </span>
            <br />
            <span className="clock__target">
              {fill(t.board.yourExpectedIn, { days: daysUntil(result.expectedDate) })}
            </span>
          </span>
        </div>
      ) : (
        <div className="callout callout--danger">
          <p className="callout__title">
            <AlertIcon size={18} />
            {t.board.beyondHorizon}
          </p>
        </div>
      )}

      <dl className="meta-list" style={{ padding: 0 }}>
        <div>
          <dt>{t.board.yourPosition}</dt>
          <dd className="numeric">
            {result.position} / {place.queueDepth}
          </dd>
        </div>
        <div>
          <dt>{t.board.sitsOn}</dt>
          <dd>{sittingDayNames(place.schedule, locale).join(", ")}</dd>
        </div>
        <div>
          <dt>{t.board.sittingsAhead}</dt>
          <dd className="numeric">{result.sittingsAhead}</dd>
        </div>
        <div>
          <dt>{t.board.venue}</dt>
          <dd>{place.schedule.venue}</dd>
        </div>
      </dl>

      <p className="small muted">{t.board.forecastNote}</p>

      <p>
        <Link to={`/board/${place.schedule.district}`} className="btn btn--secondary btn--small">
          {t.board.seeCalendar}
          <ArrowRightIcon size={16} />
        </Link>
      </p>
    </section>
  );
}

/**
 * The legal clock, and the thing you can do when it runs out.
 *
 * The RPwD Rules already give the certifying authority three months. Nobody counts it
 * for the applicant, so the number that decides whether they have a grievance is the
 * one number they cannot see. Here it is the second thing on the page.
 */
function StatutoryPanel({ view }: { view: CaseView }) {
  const { t, locale, fill } = useI18n();
  const statutory = statutoryStatus(view.application);
  const raised = escalationsOf(view.events);
  const allowed = canEscalate(
    view.application,
    view.events,
    view.isBreached,
    view.stageDefinition.isTerminal
  );

  if (view.isComplete) return null;

  return (
    <section
      className={`callout ${statutory.isOverdue ? "callout--danger" : "callout--info"} stack`}
      aria-labelledby="statutory-title"
    >
      <h2 className="callout__title" id="statutory-title">
        <AlertIcon size={18} />
        {t.escalate.limitTitle}
      </h2>

      <p>
        <strong>
          {statutory.isOverdue
            ? fill(t.escalate.limitOverdue, { days: statutory.daysOverdue })
            : `${fill(t.escalate.limitDue, {
                date: formatDate(statutory.deadline, locale)
              })} ${fill(t.escalate.limitRemaining, { days: statutory.daysRemaining })}`}
        </strong>
      </p>

      <p className="small">{t.escalate.limitBasis}</p>

      {raised.length > 0 && (
        <p className="small">
          <strong>
            {fill(t.escalate.alreadyRaised, {
              date: formatDate(raised[raised.length - 1].raisedAt, locale),
              authority:
                locale === "hi"
                  ? ESCALATION_TIERS[raised[raised.length - 1].tier].authorityHindi
                  : ESCALATION_TIERS[raised[raised.length - 1].tier].authority
            })}
          </strong>
        </p>
      )}

      {allowed && (
        <p>
          <Link
            to={`/escalate/${view.application.applicationId}`}
            className="btn btn--danger"
          >
            <EscalateIcon size={18} />
            {t.escalate.seeEscalation}
          </Link>
        </p>
      )}
    </section>
  );
}

export function TrackScreen({ applicationId }: { applicationId: string | null }) {
  const { t, locale, fill } = useI18n();
  const store = useCaseStore();
  const view = useCase(applicationId);
  const unplaceable = useIsUnplaceable(applicationId);
  const queueEntries = useQueueEntries();
  const liveRef = useRef<HTMLParagraphElement>(null);
  const [announcement, setAnnouncement] = useState("");

  const exists = applicationId ? store.applicationsById.has(applicationId) : false;

  useEffect(() => {
    if (!applicationId) {
      setAnnouncement("");
      return;
    }
    if (!exists) {
      setAnnouncement(t.track.notFound);
      return;
    }
    if (view) {
      const stage =
        locale === "hi" ? view.stageDefinition.labelHindi : view.stageDefinition.label;
      setAnnouncement(`${applicationId}: ${stage}. ${view.daysInStage} ${t.common.days}.`);
    } else {
      setAnnouncement(t.track.unplaceableTitle);
    }
  }, [applicationId, exists, view, locale, t]);

  const queue =
    view && !view.stageDefinition.isTerminal
      ? queuePosition(
          {
            applicationId: view.application.applicationId,
            district: view.application.applicant.district,
            stage: view.currentStage,
            anchorAt: queueAnchorAt(view.application, view.events)
          },
          queueEntries
        )
      : null;

  return (
    <>
      <div className="page-head service-page-head service-page-head--illustrated">
        <div className="container page-head__inner service-page-head__inner">
          <div>
            <p className="eyebrow">{t.nav.services}</p>
            <h1>{t.track.title}</h1>
            {!view && <p className="lede">{t.track.lede}</p>}
          </div>
          {/* Once there is an answer on screen, the search that found it becomes a
              compact control beside the title rather than a card above it. */}
          {view && <LookupForm initialValue={applicationId ?? ""} compact />}
          {!view && (
            <figure className="service-page-head__visual" aria-hidden="true">
              <img src={trackServiceHero} alt="" />
            </figure>
          )}
        </div>
      </div>

      <div className="container section--tight stack-6">
        {!view && <LookupForm initialValue={applicationId ?? "UDID-DEMO-1024"} />}

        {!applicationId && <TrackingGuide />}

        <p className="visually-hidden" aria-live="polite" ref={liveRef}>
          {announcement}
        </p>

      {applicationId && !exists && (
        <div className="callout callout--danger">
          <p className="callout__title">
            <CrossIcon size={18} />
            {t.track.notFound}
          </p>
          <p className="small">{t.track.notFoundHint}</p>
        </div>
      )}

      {applicationId && exists && unplaceable && (
        <div className="callout callout--danger stack">
          <p className="callout__title">
            <AlertIcon size={18} />
            {t.track.unplaceableTitle}
          </p>
          <p>{t.track.unplaceableBody}</p>
          <p>
            <Link to="/admin" className="btn btn--danger btn--small">
              {t.track.unplaceableAction}
              <ArrowRightIcon size={16} />
            </Link>
          </p>
        </div>
      )}

      {view && (
        <>
        <div className="case-layout">
          {/* Primary column: what is happening and what to do about it. */}
          <div className="case-main">
          {/* A person opening tracking needs their likely board date before the
              supporting status narrative. */}
          {["SUBMITTED", "DOC_VERIFICATION", "BOARD_SCHEDULED"].includes(
            view.currentStage
          ) && <BoardForecastPanel applicationId={view.application.applicationId} />}

          <StatusHeadline view={view} />

          <StatutoryPanel view={view} />

          {view.currentStage === "RETURNED_FOR_DOCUMENT" && view.activeReason && (
            <div className="callout callout--attention stack">
              <p className="callout__title">
                <AlertIcon size={18} />
                {t.track.returnedTitle}
              </p>
              <p>
                <strong>
                  {locale === "hi"
                    ? view.activeReason.plainHindi
                    : view.activeReason.plainEnglish}
                </strong>
              </p>
              {view.activeReason.documentAtFault && (
                <p className="small">
                  {t.track.documentAtFault}:{" "}
                  <strong>
                    {locale === "hi"
                      ? DOC_LABELS[view.activeReason.documentAtFault].hi
                      : DOC_LABELS[view.activeReason.documentAtFault].en}
                  </strong>
                </p>
              )}
              <p>
                {locale === "hi"
                  ? view.activeReason.fixActionHindi
                  : view.activeReason.fixAction}
              </p>
              <p>
                <Link
                  to={`/fix/${view.application.applicationId}`}
                  className="btn btn--primary"
                >
                  {t.track.fixAction}
                  <ArrowRightIcon size={18} />
                </Link>
              </p>
            </div>
          )}

          {view.currentStage === "REJECTED" && view.activeReason && (
            <div className="callout callout--danger stack">
              <p className="callout__title">
                <CrossIcon size={18} />
                {t.track.rejectedTitle}
              </p>
              <p>
                <strong>
                  {locale === "hi"
                    ? view.activeReason.plainHindi
                    : view.activeReason.plainEnglish}
                </strong>
              </p>
              <p>
                {locale === "hi"
                  ? view.activeReason.fixActionHindi
                  : view.activeReason.fixAction}
              </p>
              {view.appealDeadline && (
                <p className="small">
                  {fill(t.track.appealDeadline, {
                    date: formatDate(view.appealDeadline, locale)
                  })}
                </p>
              )}
              {view.hasAppealed ? (
                <p className="small">
                  <strong>{t.track.appealLodged}</strong>
                </p>
              ) : (
                view.activeReason.isAppealable && (
                  <p>
                    <Link
                      to={`/appeal/${view.application.applicationId}`}
                      className="btn btn--danger"
                    >
                      {t.track.appealAction}
                      <ArrowRightIcon size={18} />
                    </Link>
                  </p>
                )
              )}
            </div>
          )}

          {view.queuePositionPreserved !== null && (
            <div
              className={`callout ${
                view.queuePositionPreserved ? "callout--success" : "callout--attention"
              }`}
            >
              <p className="callout__title">
                {view.queuePositionPreserved ? t.track.queueProtected : t.track.queueLost}
              </p>
              <p className="small">
                {view.queuePositionPreserved
                  ? t.track.queueProtectedWhy
                  : t.track.queueLostWhy}
              </p>
            </div>
          )}

          {queue && queue.total > 1 && (
            <div className="card stack-2">
              <h2 className="card__title">{t.track.queueTitle}</h2>
              <p>
                {fill(t.track.queueBody, {
                  position: queue.position,
                  total: queue.total,
                  district: view.application.applicant.district
                })}
              </p>
            </div>
          )}

          <section className="card stack-5" aria-labelledby="timeline-title">
            <h2 className="card__title" id="timeline-title">
              {t.track.timelineTitle}
            </h2>
            <Stepper steps={view.steps} view={view} />
          </section>
          </div>

          {/* Supporting rail: the reference material you consult, not act on. */}
          <aside className="case-rail">
          <section className="card stack" aria-labelledby="details-title">
            <h2 className="card__title" id="details-title">
              {t.track.detailsTitle}
            </h2>
            <dl className="meta-list" style={{ padding: 0 }}>
              <div>
                <dt>{t.track.applicant}</dt>
                <dd>{view.application.applicant.name}</dd>
              </div>
              <div>
                <dt>{t.track.disability}</dt>
                <dd>{disabilityLabel(view.application.applicant.disabilityType, locale)}</dd>
              </div>
              <div>
                <dt>{t.track.identity}</dt>
                <dd>{t.apply.identityOptions[view.application.identityMethod]}</dd>
              </div>
              {view.application.assistedBy && (
                <div>
                  <dt>{t.track.assistedBy}</dt>
                  <dd>
                    {view.application.assistedBy.name} (
                    {view.application.assistedBy.relationship})
                    <br />
                    <span className="small muted">{view.application.assistedBy.contactPhone}</span>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <AuditTrail events={view.events} />

          {/* The product promise, said to the person it is a promise to. Every line
              here is something the state machine actually guarantees today — the
              reconciliation report is the backstop on top, not the claim itself. */}
          <section className="callout callout--success stack-2" aria-labelledby="assurance-title">
            <h2 className="callout__title" id="assurance-title">
              <CheckIcon size={18} />
              {t.track.assuranceTitle}
            </h2>
            <ul className="bullet-list">
              {[t.track.assuranceOne, t.track.assuranceTwo, t.track.assuranceThree, t.track.assuranceFour].map(
                (line) => (
                  <li key={line}>
                    <CheckIcon size={16} />
                    <span className="small">{line}</span>
                  </li>
                )
              )}
            </ul>
          </section>
          </aside>
        </div>
        </>
      )}
      </div>
    </>
  );
}
