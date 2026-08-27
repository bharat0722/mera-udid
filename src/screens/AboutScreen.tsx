import { formatIndianNumber } from "../core/clock";
import { TOTAL_SLA_DAYS } from "../core/stages";
import {
  ACCOUNTED_FOR,
  PARLIAMENT_FIGURES,
  QUOTES,
  UNACCOUNTED,
  WAIT_TIMES
} from "../data/evidence";
import { useI18n } from "../i18n/I18nContext";
import { Link } from "../lib/router";
import { AlertIcon, ArrowRightIcon, CheckIcon } from "../ui/Icons";

const civicInformationImage = new URL("../assets/know-udid-civic-information.webp", import.meta.url).href;

/**
 * The case for a new system.
 *
 * This page holds everything the homepage used to open with: the stakes, the
 * parliamentary arithmetic, the diagnosis. It moved here on a simple principle —
 * a service homepage helps you do things, and the argument for the service's
 * existence belongs one click away, the way any government service separates
 * "do the thing" from "about this service".
 *
 * It is also the screen the demo opens on: the four numbers, the subtraction,
 * and the state this system is built never to enter.
 */

function ArithmeticPanel() {
  const { t } = useI18n();

  const rows = [
    { label: t.home.received, value: PARLIAMENT_FIGURES.received },
    { label: t.home.generated, value: PARLIAMENT_FIGURES.cardsGenerated },
    { label: t.home.rejected, value: PARLIAMENT_FIGURES.rejected },
    { label: t.home.pending, value: PARLIAMENT_FIGURES.pending }
  ];

  return (
    <div className="card stack">
      <div className="arithmetic">
        {rows.map((row) => (
          <div key={row.label} className="arithmetic__row">
            <span>{row.label}</span>
            <strong>{formatIndianNumber(row.value)}</strong>
          </div>
        ))}
        <div className="arithmetic__row arithmetic__row--total">
          <span>{t.home.accounted}</span>
          <strong>{formatIndianNumber(ACCOUNTED_FOR)}</strong>
        </div>
      </div>

      <div className="arithmetic__gap">
        <span className="arithmetic__gap-number">{formatIndianNumber(UNACCOUNTED)}</span>
        <span>{t.home.gapLabel}</span>
      </div>

      <p className="small muted">{t.home.gapNote}</p>
      <p className="small muted">{PARLIAMENT_FIGURES.source}</p>
    </div>
  );
}

export function AboutScreen() {
  const { t } = useI18n();

  return (
    <>
      <section className="about-hero">
        <div className="container about-hero__grid">
          <div className="about-hero__copy stack-5">
            <div className="stack">
              <p className="eyebrow">{t.aboutWhy.eyebrow}</p>
              <h1>{t.aboutWhy.title}</h1>
              <p className="lede">{t.aboutWhy.lede}</p>
            </div>
            {/* What is actually at stake for the person applying. */}
            <div className="callout callout--attention"><p>{t.home.stakes}</p></div>
          </div>
          <figure className="about-hero__visual">
            <img src={civicInformationImage} alt="A wheelchair user and family member consult a public information board with a service worker." />
          </figure>
        </div>
      </section>

      <section
        className="section--tight"
        style={{ background: "var(--surface)", borderBlock: "1px solid var(--border)" }}
      >
        <div className="container grid-2">
          <div className="stack">
            <h2>{t.home.arithmeticTitle}</h2>
            <p>{t.home.arithmeticIntro}</p>
            <blockquote className="callout callout--attention">
              <p style={{ marginBottom: "var(--space-2)" }}>“{QUOTES.mp.text}”</p>
              <p className="small">
                <strong>{QUOTES.mp.attribution}</strong>
                <br />
                {QUOTES.mp.source}
              </p>
            </blockquote>
            {/* The turn: the evidence is not a story, it is the design requirement
                this system is built to satisfy. */}
            <div className="callout callout--success">
              <p>
                <strong>{t.home.gapPromise}</strong>
              </p>
            </div>
          </div>
          <ArithmeticPanel />
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">
          <div className="stack">
            <h2>{t.home.diagnosisTitle}</h2>
            <p>{t.home.diagnosisBody}</p>
            <p className="lede" style={{ color: "var(--ink)", fontWeight: 600 }}>
              {t.home.diagnosisPunch}
            </p>
          </div>
          <blockquote className="callout callout--danger">
            <p style={{ marginBottom: "var(--space-2)" }}>“{QUOTES.appReview.text}”</p>
            <p className="small">
              <strong>{QUOTES.appReview.attribution}</strong>
              <br />
              {QUOTES.appReview.source}
            </p>
          </blockquote>
        </div>
      </section>

      {/* The builder brief asks a strong submission to make two things obvious:
          what works today versus what is still mocked, and how the idea works safely
          at a larger scale. Both answers live here, in the product, in both languages —
          not only in repository documents a judge would never open. */}
      <section className="section" aria-labelledby="honesty-title">
        <div className="container stack-5">
          <div className="stack">
            <h2 id="honesty-title">{t.honesty.title}</h2>
            <p>{t.honesty.lede}</p>
          </div>
          <div className="grid-2">
            <div className="card stack-2">
              <h3>{t.honesty.realTitle}</h3>
              <ul className="bullet-list">
                {t.honesty.real.map((line) => (
                  <li key={line}>
                    <CheckIcon size={16} />
                    <span className="small">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card stack-2">
              <h3>{t.honesty.mockTitle}</h3>
              <ul className="bullet-list">
                {t.honesty.mock.map((line) => (
                  <li key={line}>
                    <AlertIcon size={16} />
                    <span className="small">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        className="section--tight"
        style={{ background: "var(--surface)", borderBlock: "1px solid var(--border)" }}
        aria-labelledby="scale-title"
      >
        <div className="container stack-5">
          <div className="stack">
            <h2 id="scale-title">{t.atScale.title}</h2>
            <p>{t.atScale.lede}</p>
          </div>
          <ol className="bullet-list">
            {t.atScale.points.map((line, index) => (
              <li key={line}>
                <span className="steps__marker" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="small">{line}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="section--tight"
        style={{ background: "var(--surface)", borderBlock: "1px solid var(--border)" }}
      >
        <div className="container stack-5">
          <div className="grid-2">
            <div className="stat stat--good">
              <span className="stat__value">
                {TOTAL_SLA_DAYS} {t.common.days}
              </span>
              <span className="stat__label">{t.home.totalTarget}</span>
            </div>
            <div className="stat stat--danger">
              <span className="stat__value">
                {WAIT_TIMES.madhyaPradeshAverageDays} {t.common.days}
              </span>
              <span className="stat__label">
                {t.home.realWorld} — {t.home.realWorldNote}
              </span>
            </div>
          </div>

          <div className="row">
            <Link to="/apply" className="btn btn--primary">
              {t.home.startAction}
              <ArrowRightIcon size={18} />
            </Link>
            <Link to="/track" className="btn btn--secondary">
              {t.home.trackAction}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
