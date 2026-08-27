import { useState } from "react";
import {
  belowBenchmark,
  forecast,
  nextSittings,
  sittingDayNames,
  type BoardSchedule
} from "../core/boardSchedule";
import { formatDate } from "../core/clock";
import { QUOTES } from "../data/evidence";
import { useI18n } from "../i18n/I18nContext";
import { useBoardStats, type DistrictBoardStats } from "../lib/useBoard";
import { AlertIcon, CheckIcon, HospitalIcon } from "../ui/Icons";
import { TableScroll } from "../ui/TableScroll";

const medicalBoardHero = new URL("../assets/medical-board-calendar-hero.webp", import.meta.url).href;

/**
 * A location finder must not force a person to know that this prototype's demo
 * calendars happen to be from Madhya Pradesh. The state list covers every State and
 * Union Territory; the schedule list below remains deliberately limited to evidence
 * actually published by the prototype.
 */
const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

const SCHEDULE_STATE_BY_DISTRICT: Record<string, string> = {
  Bhopal: "Madhya Pradesh",
  Indore: "Madhya Pradesh",
  Jabalpur: "Madhya Pradesh",
  Gwalior: "Madhya Pradesh",
  Rewa: "Madhya Pradesh",
  Sagar: "Madhya Pradesh"
};

/**
 * The published board calendar.
 *
 * "Treat the doctors' panel the way an airline treats seats." An airline knows how many
 * seats it has, publishes the schedule, and tells you your seat before you leave home.
 * A district board has a room, a panel and a fixed number of people it can see in a
 * day — every input an expected date needs — and publishes none of it.
 *
 * So this page publishes all of it, and then does the one thing that makes a published
 * calendar more than decoration: it holds the calendar against what actually happened.
 * If the cadence says four weeks and the finished cases took thirty, the board is not
 * sitting as published, and that gap is now a number somebody can be asked about.
 */

function BoardCard({ stats }: { stats: DistrictBoardStats }) {
  const { t, locale, fill } = useI18n();
  const { schedule } = stats;
  const sittings = nextSittings(schedule, undefined, 6);
  const joinToday = forecast(schedule, stats.queueDepth + 1, stats.queueDepth);
  const below = belowBenchmark(schedule);

  return (
    <section className="card stack-5" aria-labelledby={`board-${schedule.district}`}>
      <div className="row row--between">
        <h3 className="card__title row" id={`board-${schedule.district}`} style={{ gap: "var(--space-2)" }}>
          <HospitalIcon size={20} />
          {schedule.district}
        </h3>
        <span className={`chip ${below ? "chip--attention" : "chip--done"}`}>
          {below ? <AlertIcon size={15} /> : <CheckIcon size={15} />}
          {below ? t.board.benchmarkBelow : t.board.benchmarkOk}
        </span>
      </div>

      <dl className="meta-list" style={{ padding: 0 }}>
        <div>
          <dt>{t.board.venue}</dt>
          <dd>{schedule.venue}</dd>
        </div>
        <div>
          <dt>{t.board.sitsOn}</dt>
          <dd>{sittingDayNames(schedule, locale).join(", ")}</dd>
        </div>
        <div>
          <dt>{t.board.perSitting}</dt>
          <dd className="numeric">{schedule.slotsPerSitting}</dd>
        </div>
        <div>
          <dt>{t.board.weeklyCapacity}</dt>
          <dd className="numeric">{stats.capacity}</dd>
        </div>
      </dl>

      <div className="grid-3">
        <div className="stat">
          <span className="stat__value">{stats.queueDepth}</span>
          <span className="stat__label">{t.board.queueDepth}</span>
        </div>
        <div className="stat">
          <span className="stat__value">{stats.upstream}</span>
          <span className="stat__label">{t.board.upstream}</span>
        </div>
        <div className={`stat ${joinToday.backlogWeeks > 4 ? "stat--danger" : ""}`}>
          <span className="stat__value">{joinToday.backlogWeeks}</span>
          <span className="stat__label">{t.board.backlog}</span>
        </div>
      </div>

      <div className="callout callout--info">
        <p className="callout__title">{t.board.joinToday}</p>
        {joinToday.expectedDate ? (
          <p>
            {t.board.joinTodayAnswer}{" "}
            <strong>{formatDate(joinToday.expectedDate, locale)}</strong>
          </p>
        ) : (
          <p>
            <strong>{t.board.beyondHorizon}</strong>
          </p>
        )}
      </div>

      <div>
        <p className="field__label">{t.board.nextSittings}</p>
        <ul className="tag-row">
          {sittings.map((date) => (
            <li key={date.toISOString()} className="chip chip--neutral numeric">
              {formatDate(date, locale)}
            </li>
          ))}
        </ul>
      </div>

      {/* The whole reason a published calendar is worth anything. */}
      <div
        className={`callout ${
          stats.clearedCount > 0 && stats.medianClearedDays > joinToday.backlogWeeks * 7
            ? "callout--attention"
            : "callout--success"
        }`}
      >
        <p className="callout__title">{t.board.realityTitle}</p>
        <p className="small">
          {stats.clearedCount > 0
            ? fill(t.board.realityBody, {
                weeks: joinToday.backlogWeeks,
                observed: stats.medianClearedDays
              })
            : t.board.realityNoData}
        </p>
      </div>
    </section>
  );
}

export function BoardScreen({ district }: { district: string | null }) {
  const { t } = useI18n();
  const stats = useBoardStats();
  const [state, setState] = useState("");
  const [districtQuery, setDistrictQuery] = useState(district ?? "");

  const normalizedQuery = districtQuery.trim().toLocaleLowerCase("en-IN");
  const shown = stats.filter((stat) => {
    const hasMatchingDistrict = stat.schedule.district
      .toLocaleLowerCase("en-IN")
      .includes(normalizedQuery);
    const hasMatchingState = !state || SCHEDULE_STATE_BY_DISTRICT[stat.schedule.district] === state;
    return hasMatchingDistrict && hasMatchingState;
  });
  const hasLocationQuery = Boolean(state || districtQuery.trim());

  return (
    <>
      <div className="page-head service-page-head service-page-head--illustrated">
        <div className="container page-head__inner service-page-head__inner">
          <div>
            <p className="eyebrow">{t.nav.services}</p>
            <h1>{t.board.title}</h1>
            <p className="lede">{t.board.lede}</p>
          </div>
          <figure className="service-page-head__visual" aria-hidden="true">
            <img src={medicalBoardHero} alt="" />
          </figure>
        </div>
      </div>

    <div className="container section--tight stack-6">
      <blockquote className="callout callout--danger">
        <p className="small">{t.board.ministerQuote}</p>
        <p className="small" style={{ marginTop: "var(--space-2)" }}>
          <strong>{QUOTES.minister.attribution}</strong>
          <br />
          {QUOTES.minister.source}
        </p>
      </blockquote>

      <div className="card board-filters stack-4">
        <div>
          <h2 className="card__title">{t.board.locationTitle}</h2>
          <p className="small muted">{t.board.locationHelp}</p>
        </div>
        <div className="grid-2">
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field__label" htmlFor="board-state">
              {t.board.stateLabel}
            </label>
            <select
              id="board-state"
              className="input"
              value={state}
              onChange={(event) => setState(event.target.value)}
            >
              <option value="">{t.board.anyState}</option>
              {INDIAN_STATES_AND_UTS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field__label" htmlFor="board-district-search">
              {t.board.districtOrPin}
            </label>
            <input
              id="board-district-search"
              className="input"
              type="search"
              inputMode="search"
              value={districtQuery}
              onChange={(event) => setDistrictQuery(event.target.value)}
              placeholder={t.board.districtOrPinHint}
            />
          </div>
        </div>
        {hasLocationQuery && (
          <button
            type="button"
            className="btn btn--quiet btn--small"
            onClick={() => { setState(""); setDistrictQuery(""); }}
          >
            {t.board.showAllDistricts}
          </button>
        )}
      </div>

      {shown.length > 0 && <section className="stack-3" aria-labelledby="published-calendars-title">
      <h2 className="section-title" id="published-calendars-title">{t.board.publishedCalendarTitle}</h2>
      <TableScroll label={t.board.publishedCalendarTitle}>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">{t.board.districtLabel}</th>
              <th scope="col">{t.board.sitsOn}</th>
              <th scope="col">{t.board.weeklyCapacity}</th>
              <th scope="col">{t.board.queueDepth}</th>
              <th scope="col">{t.board.backlog}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => {
              const f = forecast(s.schedule, s.queueDepth + 1, s.queueDepth);
              return (
                <tr key={s.schedule.district}>
                  <td>
                    <strong>{s.schedule.district}</strong>
                  </td>
                  <td>{s.schedule.sittingDays.length}</td>
                  <td className="numeric">{s.capacity}</td>
                  <td className="numeric">{s.queueDepth}</td>
                  <td className="numeric">
                    <strong>{f.backlogWeeks}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableScroll>
      </section>}

      {hasLocationQuery && shown.length === 0 && (
        <div className="callout callout--attention" role="status">
          <p className="callout__title">{t.board.noBoard}</p>
          <p className="small">{t.board.searchNoMatch}</p>
        </div>
      )}

      <div className="callout callout--attention">
        <p className="callout__title">
          <AlertIcon size={18} />
          {t.board.benchmarkTitle}
        </p>
        <p className="small">{t.board.benchmarkNote}</p>
      </div>

      {shown.map((s) => (
        <BoardCard key={s.schedule.district} stats={s} />
      ))}

      <p className="small muted">{t.board.proposalNote}</p>
    </div>
    </>
  );
}

export type { BoardSchedule };
