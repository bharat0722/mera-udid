import { useMemo, useState } from "react";
import { transition } from "../core/caseStore";
import { DEMO_NOW, addDays, formatDate, toIso } from "../core/clock";
import type { CaseView } from "../core/projections";
import {
  REASON_CODES,
  REJECT_REASON_CODES,
  RETURN_REASON_CODES
} from "../core/reasonCodes";
import { ALLOWED_TRANSITIONS, STAGE_DEFINITIONS } from "../core/stages";
import { TransitionError } from "../core/transitions";
import type { ReasonCodeKey, StageKey } from "../core/types";
import { DISTRICTS } from "../data/generator";
import { useAllCaseViews, useEscalatedIds } from "../lib/useCases";
import { Link } from "../lib/router";
import { TableScroll } from "../ui/TableScroll";
import { AlertIcon, ArrowRightIcon, CheckIcon, CrossIcon, EscalateIcon } from "../ui/Icons";
import { BreachChip, StageChip } from "../ui/StageChip";

/**
 * The officer console.
 *
 * Two things this screen has to prove, and they are the reason it exists at all.
 *
 * First, the queue is honest: it is sorted by how long people have been waiting, it
 * shows the breach against the proposed target, and it can be filtered down to exactly
 * the cases that have run over.
 *
 * Second, and more important: the officer cannot return or reject a case without
 * naming a structured reason. Not "should not" — cannot. The reason picker gates the
 * button, and underneath it the state machine refuses the write regardless. The
 * "show me" control below proves the second half, by attempting the write the UI
 * normally prevents and printing what comes back.
 *
 * English only for now: this is an internal tool, and untranslated Hindi that nobody
 * has checked would be worse than none. Recorded in PENDING.md.
 */

const PAGE_SIZE = 25;

const ACTION_LABELS: Partial<Record<StageKey, string>> = {
  DOC_VERIFICATION: "Pick up for document checking",
  BOARD_SCHEDULED: "Book the medical board",
  BOARD_ASSESSED: "Record the assessment",
  CERTIFICATE_ISSUED: "Issue the certificate",
  CARD_GENERATED: "Generate the card"
};

const ACTOR_FOR_STAGE: Record<string, { role: "SW_OFFICER" | "MEDICAL_BOARD" | "SYSTEM"; id: string }> = {
  DOC_VERIFICATION: { role: "SW_OFFICER", id: "SWO-CONSOLE" },
  BOARD_SCHEDULED: { role: "SW_OFFICER", id: "SWO-CONSOLE" },
  BOARD_ASSESSED: { role: "MEDICAL_BOARD", id: "MB-CONSOLE" },
  CERTIFICATE_ISSUED: { role: "SW_OFFICER", id: "SWO-CONSOLE" },
  CARD_GENERATED: { role: "SYSTEM", id: "mera-udid" }
};

function ActionPanel({ view }: { view: CaseView }) {
  const [reason, setReason] = useState<ReasonCodeKey | "">("");
  const [percentage, setPercentage] = useState("35");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null
  );

  const allowed = ALLOWED_TRANSITIONS[view.currentStage];
  const advanceTargets = allowed.filter(
    (stage) => stage in ACTION_LABELS && stage !== "RETURNED_FOR_DOCUMENT"
  );
  const canReturn = allowed.includes("RETURNED_FOR_DOCUMENT");
  const canReject = allowed.includes("REJECTED");

  const applicationId = view.application.applicationId;
  const timestamp = toIso(DEMO_NOW);

  const advance = (toStage: StageKey) => {
    const actor = ACTOR_FOR_STAGE[toStage] ?? { role: "SW_OFFICER" as const, id: "SWO-CONSOLE" };
    const payload: Record<string, unknown> = {};
    if (toStage === "BOARD_SCHEDULED") {
      payload.appointmentDate = toIso(addDays(DEMO_NOW, 12));
    }
    if (toStage === "BOARD_ASSESSED") {
      payload.assessedPercentage = Number(percentage);
    }
    try {
      transition({
        applicationId,
        toStage,
        actorRole: actor.role,
        actorId: actor.id,
        payload: Object.keys(payload).length > 0 ? payload : null,
        timestamp
      });
      setMessage({ kind: "ok", text: `Moved to ${STAGE_DEFINITIONS[toStage].label}.` });
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const sendBack = (toStage: "RETURNED_FOR_DOCUMENT" | "REJECTED") => {
    if (reason === "") return;
    try {
      transition({
        applicationId,
        toStage,
        actorRole: view.currentStage === "BOARD_SCHEDULED" ? "MEDICAL_BOARD" : "SW_OFFICER",
        actorId: view.currentStage === "BOARD_SCHEDULED" ? "MB-CONSOLE" : "SWO-CONSOLE",
        reasonCode: reason,
        timestamp
      });
      setMessage({
        kind: "ok",
        text: `Recorded as ${STAGE_DEFINITIONS[toStage].label}, reason ${reason}.`
      });
      setReason("");
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof Error ? error.message : String(error)
      });
    }
  };

  /** Attempts the write the UI normally prevents, so the refusal is visible. */
  const attemptWithoutReason = () => {
    try {
      transition({
        applicationId,
        toStage: "RETURNED_FOR_DOCUMENT",
        actorRole: "SW_OFFICER",
        actorId: "SWO-CONSOLE",
        timestamp
      });
      setMessage({
        kind: "error",
        text: "The write went through. That is a bug — it should have been refused."
      });
    } catch (error) {
      setMessage({
        kind: "ok",
        text:
          error instanceof TransitionError
            ? `Refused by the state machine — ${error.code}: ${error.message}`
            : String(error)
      });
    }
  };

  const reasonOptions =
    canReturn || canReject
      ? Array.from(new Set([...RETURN_REASON_CODES, ...REJECT_REASON_CODES]))
      : [];

  return (
    <div className="card stack-5">
      <div className="row row--between">
        <h2 className="card__title">
          Act on {applicationId}
          <br />
          <span className="small muted">{view.application.applicant.name}</span>
        </h2>
        <StageChip stage={view.currentStage} />
      </div>

      {message && (
        <div
          className={`callout ${message.kind === "ok" ? "callout--success" : "callout--danger"}`}
          role="status"
        >
          <p className="callout__title">
            {message.kind === "ok" ? <CheckIcon size={18} /> : <CrossIcon size={18} />}
            {message.kind === "ok" ? "Recorded" : "Refused"}
          </p>
          <p className="small">{message.text}</p>
        </div>
      )}

      {advanceTargets.length === 0 && !canReturn && !canReject && (
        <p className="muted">
          This case is with{" "}
          {view.stageDefinition.ownerRole === "APPLICANT" ? "the applicant" : "no desk"} —
          there is nothing for an officer to do here.
        </p>
      )}

      {view.currentStage === "BOARD_SCHEDULED" && (
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="field__label" htmlFor="assessed-percentage">
            Assessed disability percentage
          </label>
          <span className="field__hint" id="assessed-hint">
            There is no 40% threshold anywhere in this system. A Karnataka Health
            Commissioner circular of 31 July 2024 had to order hospitals to stop refusing
            cards below 40%, because the RPwD Act imposes no such condition. A case
            assessed below 40 proceeds to certificate issue exactly like any other.
          </span>
          <input
            id="assessed-percentage"
            className="input"
            inputMode="numeric"
            value={percentage}
            aria-describedby="assessed-hint"
            onChange={(event) => setPercentage(event.target.value)}
          />
        </div>
      )}

      {advanceTargets.length > 0 && (
        <div className="row">
          {advanceTargets.map((stage) => (
            <button
              key={stage}
              type="button"
              className="btn btn--primary btn--small"
              onClick={() => advance(stage)}
            >
              {ACTION_LABELS[stage]}
              <ArrowRightIcon size={16} />
            </button>
          ))}
        </div>
      )}

      {(canReturn || canReject) && (
        <fieldset style={{ marginBottom: 0 }}>
          <legend>Send it back or refuse it</legend>
          <p className="field__hint">
            A structured reason code is required. Both buttons stay disabled until one is
            chosen, and the state machine refuses the write even if they do not.
          </p>

          <div className="field" style={{ maxWidth: "none" }}>
            <label className="field__label" htmlFor="reason-code">
              Reason code
            </label>
            <select
              id="reason-code"
              className="select"
              value={reason}
              onChange={(event) => setReason(event.target.value as ReasonCodeKey | "")}
            >
              <option value="">— choose a reason —</option>
              {reasonOptions.map((code) => (
                <option key={code} value={code}>
                  {code} — {REASON_CODES[code].plainEnglish}
                </option>
              ))}
            </select>
          </div>

          {reason !== "" && (
            <div className="callout callout--info">
              <p className="small">
                <strong>The applicant will see:</strong> {REASON_CODES[reason].plainEnglish}
              </p>
              <p className="small">
                <strong>Their one action:</strong> {REASON_CODES[reason].fixAction}
              </p>
              <p className="small">
                <strong>Queue position:</strong>{" "}
                {REASON_CODES[reason].preservesQueuePosition
                  ? "protected — the fault is administrative"
                  : "not preserved — recorded as an applicant-side failure"}
              </p>
            </div>
          )}

          <div className="row" style={{ marginTop: "var(--space-4)" }}>
            {canReturn && (
              <button
                type="button"
                className="btn btn--quiet btn--small"
                disabled={reason === "" || !RETURN_REASON_CODES.includes(reason as ReasonCodeKey)}
                onClick={() => sendBack("RETURNED_FOR_DOCUMENT")}
              >
                Return to the applicant
              </button>
            )}
            {canReject && (
              <button
                type="button"
                className="btn btn--danger btn--small"
                disabled={reason === "" || !REJECT_REASON_CODES.includes(reason as ReasonCodeKey)}
                onClick={() => sendBack("REJECTED")}
              >
                Reject the application
              </button>
            )}
            {canReturn && (
              <button
                type="button"
                className="btn btn--quiet btn--small"
                onClick={attemptWithoutReason}
              >
                Try returning it with no reason
              </button>
            )}
          </div>
        </fieldset>
      )}

      <Link to={`/track/${applicationId}`} className="btn btn--secondary btn--small">
        See what the applicant sees
        <ArrowRightIcon size={16} />
      </Link>
    </div>
  );
}

export function OfficerScreen() {
  const views = useAllCaseViews();
  const escalated = useEscalatedIds();
  const [stageFilter, setStageFilter] = useState<StageKey | "ALL">("ALL");
  const [districtFilter, setDistrictFilter] = useState<string>("ALL");
  const [breachedOnly, setBreachedOnly] = useState(false);
  const [escalatedOnly, setEscalatedOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>("UDID-DEMO-1024");

  const filtered = useMemo(() => {
    return views
      .filter((view) => !view.stageDefinition.isTerminal)
      .filter((view) => stageFilter === "ALL" || view.currentStage === stageFilter)
      .filter(
        (view) =>
          districtFilter === "ALL" || view.application.applicant.district === districtFilter
      )
      .filter((view) => !breachedOnly || view.isBreached)
      .filter(
        (view) => !escalatedOnly || escalated.has(view.application.applicationId)
      )
      // An escalated case has a citizen actively waiting on an answer from a higher
      // authority, so it goes above an equally-late case that nobody has raised.
      .sort((a, b) => {
        const aEsc = escalated.has(a.application.applicationId) ? 1 : 0;
        const bEsc = escalated.has(b.application.applicationId) ? 1 : 0;
        if (aEsc !== bEsc) return bEsc - aEsc;
        return b.daysInStage - a.daysInStage;
      });
  }, [views, stageFilter, districtFilter, breachedOnly, escalatedOnly, escalated]);

  const page = filtered.slice(0, PAGE_SIZE);
  const selected = views.find((view) => view.application.applicationId === selectedId) ?? null;
  const breachedCount = filtered.filter((view) => view.isBreached).length;

  return (
    <div className="container section--tight stack-6 officer-console">
      <div className="officer-console__head stack">
        <p className="eyebrow">District service operations</p>
        <h1>Officer console</h1>
        <p className="lede">
          The district social welfare desk and the medical board, working the same case
          store the citizen sees. Every action here appears on the applicant's timeline
          within the same page load.
        </p>
      </div>

      <div className="grid-3 officer-console__metrics">
        <div className="stat">
          <span className="stat__value">{filtered.length}</span>
          <span className="stat__label">Open cases matching these filters</span>
        </div>
        <div className="stat stat--danger">
          <span className="stat__value">{breachedCount}</span>
          <span className="stat__label">Past the proposed target</span>
        </div>
        <div className="stat stat--danger">
          <span className="stat__value">
            {filtered.filter((view) => escalated.has(view.application.applicationId)).length}
          </span>
          <span className="stat__label">Escalated to a higher authority</span>
        </div>
        <div className="stat">
          <span className="stat__value">
            {filtered.length > 0
              ? Math.round(
                  filtered.reduce((sum, view) => sum + view.daysInStage, 0) / filtered.length
                )
              : 0}
          </span>
          <span className="stat__label">Average days at the current desk</span>
        </div>
      </div>

      <div className="card row officer-console__filters" role="group" aria-label="Queue filters">
        <div className="field" style={{ marginBottom: 0, maxWidth: "16rem" }}>
          <label className="field__label" htmlFor="stage-filter">
            Stage
          </label>
          <select
            id="stage-filter"
            className="select"
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value as StageKey | "ALL")}
          >
            <option value="ALL">All open stages</option>
            {Object.values(STAGE_DEFINITIONS)
              .filter((stage) => !stage.isTerminal)
              .map((stage) => (
                <option key={stage.key} value={stage.key}>
                  {stage.label}
                </option>
              ))}
          </select>
        </div>

        <div className="field" style={{ marginBottom: 0, maxWidth: "14rem" }}>
          <label className="field__label" htmlFor="district-filter">
            District
          </label>
          <select
            id="district-filter"
            className="select"
            value={districtFilter}
            onChange={(event) => setDistrictFilter(event.target.value)}
          >
            <option value="ALL">All districts</option>
            {DISTRICTS.map((district) => (
              <option key={district.name} value={district.name}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <label className={`choice${breachedOnly ? " choice--selected" : ""}`} style={{ maxWidth: "18rem" }}>
          <input
            type="checkbox"
            checked={breachedOnly}
            onChange={() => setBreachedOnly((current) => !current)}
          />
          <span className="choice__text">
            <span className="choice__title">Only cases past the target</span>
          </span>
        </label>

        <label className={`choice${escalatedOnly ? " choice--selected" : ""}`} style={{ maxWidth: "18rem" }}>
          <input
            type="checkbox"
            checked={escalatedOnly}
            onChange={() => setEscalatedOnly((current) => !current)}
          />
          <span className="choice__text">
            <span className="choice__title">Only escalated cases</span>
          </span>
        </label>
      </div>

      {selected && <div className="officer-console__action"><ActionPanel view={selected} /></div>}

      <section className="card card--flush officer-console__queue" aria-labelledby="queue-title">
        <div className="card__header">
          <h2 className="card__title" id="queue-title">
            Queue
          </h2>
          <span className="small muted">
            Showing {page.length} of {filtered.length} — longest wait first
          </span>
        </div>
        <TableScroll label="Case queue">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Application</th>
                <th scope="col">Applicant</th>
                <th scope="col">District</th>
                <th scope="col">Stage</th>
                <th scope="col">Days at desk</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {page.map((view) => (
                <tr key={view.application.applicationId}>
                  <td className="numeric">{view.application.applicationId}</td>
                  <td>{view.application.applicant.name}</td>
                  <td>{view.application.applicant.district}</td>
                  <td>
                    <StageChip stage={view.currentStage} />
                    {escalated.has(view.application.applicationId) && (
                      <>
                        <br />
                        <span className="chip chip--danger" style={{ marginTop: "var(--space-1)" }}>
                          <EscalateIcon size={14} />
                          Escalated
                        </span>
                      </>
                    )}
                  </td>
                  <td className="numeric">
                    <strong>{view.daysInStage}</strong> / {view.slaDays}
                    {view.isBreached && (
                      <>
                        <br />
                        <BreachChip days={view.daysInStage} target={view.slaDays} />
                      </>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--secondary btn--small"
                      onClick={() => setSelectedId(view.application.applicationId)}
                      aria-label={`Act on ${view.application.applicationId}`}
                    >
                      Act on this case
                    </button>
                  </td>
                </tr>
              ))}
              {page.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <span className="row">
                      <AlertIcon size={18} />
                      No open cases match these filters.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableScroll>
        <div className="card__body">
          <p className="small muted">
            The queue is capped at {PAGE_SIZE} rows on screen so the page stays fast on a
            low-end phone. The counts above are over the whole filtered set, not the
            visible page. Cases with a broken event log do not appear here at all — they
            have no stage to queue in, and they surface in the oversight reconciliation
            report instead. Today is {formatDate(DEMO_NOW)} in this prototype.
          </p>
        </div>
      </section>
    </div>
  );
}
