import { useState, type FormEvent } from "react";
import { ACTIVE_STAGE_ORDER, STAGE_DEFINITIONS, TOTAL_SLA_DAYS } from "../core/stages";
import { useI18n } from "../i18n/I18nContext";
import { useCase } from "../lib/useCases";
import { Link, navigate } from "../lib/router";
import { TableScroll } from "../ui/TableScroll";
import {
  ArrowRightIcon,
  CheckIcon,
  DocumentIcon,
  HospitalIcon,
  OfficeIcon,
  PersonIcon,
  SearchIcon
} from "../ui/Icons";
import { BreachChip, StageChip } from "../ui/StageChip";

const civicServiceHero = new URL("../assets/civic-service-hero.webp", import.meta.url).href;
const assistedServiceDesk = new URL("../assets/assisted-service-desk.webp", import.meta.url).href;

/**
 * The first thing a busy person wants.
 *
 * Somebody who has already applied did not come here to read about parliamentary
 * arithmetic — they came to find out where their file is. So the check sits in the
 * hero, above the fold, and goes straight to the answer rather than to another page
 * with another form on it.
 */
function QuickCheck() {
  const { t } = useI18n();
  const [value, setValue] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim().toUpperCase();
    if (trimmed.length === 0) return;
    navigate(`/track/${trimmed}`);
  };

  return (
    <form className="quick-check" onSubmit={onSubmit}>
      <span className="quick-check__title" id="quick-check-title">
        {t.home.checkTitle}
      </span>
      <div className="field" style={{ marginBottom: 0, maxWidth: "none" }}>
        <label className="field__label" htmlFor="quick-check-id">
          {t.home.checkLabel}
        </label>
        <span className="field__hint" id="quick-check-hint">
          {t.track.hint}
        </span>
        <div className="field-row">
          <input
            id="quick-check-id"
            className="input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-describedby="quick-check-hint"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="btn btn--primary">
            <SearchIcon size={18} />
            {t.home.checkButton}
          </button>
        </div>
      </div>
    </form>
  );
}

/** The five jobs people arrive with, in the order they arrive with them. */
const TASKS = [
  { to: "/apply", icon: <DocumentIcon size={24} /> },
  { to: "/track", icon: <SearchIcon size={24} /> },
  { to: "/board", icon: <HospitalIcon size={24} /> },
  { to: "/signin", icon: <PersonIcon size={24} /> },
  { to: "/help", icon: <OfficeIcon size={24} /> }
];

/** The live case shown in the hero — a real record from the seeded dataset. */
const HERO_CASE_ID = "UDID-DEMO-4096";

function HeroPreview() {
  const { t, locale } = useI18n();
  const view = useCase(HERO_CASE_ID);
  if (!view) return null;

  const owner =
    locale === "hi"
      ? view.stageDefinition.ownerLabelHindi
      : view.stageDefinition.ownerLabel;

  return (
    <div className="card stack-5">
      <div className="row row--between">
        <span className="small muted numeric">{view.application.applicationId}</span>
        <StageChip stage={view.currentStage} />
      </div>

      <div>
        <span className="holder__label">{t.track.holderLabel}</span>
        <span className="holder">{owner}</span>
      </div>

      <div className={`clock${view.isBreached ? " clock--breached" : ""}`}
        style={{ borderRadius: "var(--radius-button)", border: "1px solid var(--border)" }}
      >
        <span className="clock__value">{view.daysInStage}</span>
        <span>
          <span className="small">
            <strong>{t.common.dayInStage}</strong>
          </span>
          <br />
          <span className="clock__target">
            {t.common.proposedTarget}: {view.slaDays} {t.common.days}
          </span>
        </span>
      </div>

      {view.isBreached && <BreachChip days={view.daysInStage} target={view.slaDays} />}

      <p className="small muted">{t.home.livePreviewNote}</p>

      <Link
        to={`/track/${view.application.applicationId}`}
        className="btn btn--secondary btn--block"
      >
        {t.home.viewFullCase}
        <ArrowRightIcon size={18} />
      </Link>
    </div>
  );
}

/**
 * A controlled public-information carousel.
 *
 * It deliberately never auto-advances: the campaign changes only when a person asks
 * it to, which preserves reading time and avoids motion that can disorient a visitor.
 */
function CampaignCarousel() {
  const { locale, t } = useI18n();
  const [active, setActive] = useState(0);
  const campaigns = [
    {
      eyebrow: t.nav.citizenServices,
      title: t.home.headline,
      body: t.home.lede,
      primary: { to: "/apply", label: t.home.startAction },
      secondary: { to: "/track", label: t.home.trackAction },
      image: civicServiceHero
    },
    {
      eyebrow: t.board.navLabel,
      title: locale === "hi" ? "अपनी बोर्ड तारीख का अनुमान देखें" : "See your medical board date",
      body:
        locale === "hi"
          ? "जिले की बैठकें, क्षमता और कतार देखें — ताकि प्रतीक्षा की एक तारीख और जिम्मेदार कार्यालय हो।"
          : "See district sittings, capacity and queue information, so waiting has a date and a responsible office.",
      primary: { to: "/board", label: t.board.navLabel },
      secondary: { to: "/track", label: t.home.trackAction },
      image: assistedServiceDesk
    },
    {
      eyebrow: t.nav.help,
      title: locale === "hi" ? "सहायता के साथ आवेदन करें" : "Apply with assistance",
      body:
        locale === "hi"
          ? "परिवार का सदस्य या सहायक आवेदन भर सकता है। सहमति केस पर दर्ज रहती है और आपका नियंत्रण बना रहता है।"
          : "A family member or helper can complete the application with you. Consent is recorded on the case and you remain in control.",
      primary: { to: "/help", label: t.nav.getHelp },
      secondary: { to: "/apply", label: t.nav.apply },
      image: assistedServiceDesk
    }
  ];
  const campaign = campaigns[active];
  const previousLabel = locale === "hi" ? "पिछला अभियान" : "Previous campaign";
  const nextLabel = locale === "hi" ? "अगला अभियान" : "Next campaign";

  return (
    <section className="hero campaign" aria-roledescription="carousel" aria-label={t.nav.citizenServices}>
      <div className="container">
        <div className="campaign__frame">
          <div className="campaign__content stack-5">
            <p className="eyebrow">{campaign.eyebrow}</p>
            <h1 className="display">{campaign.title}</h1>
            <p className="lede">{campaign.body}</p>
            <div className="hero__actions">
              <Link to={campaign.primary.to} className="btn btn--primary">
                {campaign.primary.label}
                <ArrowRightIcon size={18} />
              </Link>
              <Link to={campaign.secondary.to} className="btn btn--secondary">
                {campaign.secondary.label}
              </Link>
            </div>
          </div>
          <div className="campaign__image" aria-hidden="true">
            <img src={campaign.image} alt="" />
          </div>
        </div>
        <div className="campaign__controls">
          <button
            type="button"
            className="campaign__control"
            onClick={() => setActive((index) => (index + campaigns.length - 1) % campaigns.length)}
            aria-label={previousLabel}
          >
            ←
          </button>
          <div className="campaign__dots" aria-label={locale === "hi" ? "अभियान चुनें" : "Choose campaign"}>
            {campaigns.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className="campaign__dot"
                data-active={index === active ? "true" : "false"}
                aria-label={`${index + 1} / ${campaigns.length}: ${item.title}`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => setActive(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="campaign__control"
            onClick={() => setActive((index) => (index + 1) % campaigns.length)}
            aria-label={nextLabel}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}

export function HomeScreen() {
  const { t, locale } = useI18n();

  return (
    <>
      <CampaignCarousel />

      {/* Returning applicants should not have to scan the full service map. The lookup
          is still outside the hero, whose contract is a simple two-choice start. */}
      <section className="service-entry" aria-labelledby="quick-check-title">
        <div className="container service-entry__grid">
          <div className="service-entry__signpost" aria-hidden="true">
            <span className="service-entry__number">01</span>
            <span>{t.home.trackAction}</span>
          </div>
          <QuickCheck />
        </div>
      </section>

      {/* The pattern every Indian government service homepage uses, and the reason it
          is used: most people arrive with one of a small number of jobs in mind, and
          the fastest homepage is the one that lists them. Tracking is already just
          above, so this section can stay a calm map of the wider service. */}
      <section className="section--tight service-gateway">
        <div className="container stack-5">
          <div className="stack">
            <h2 id="tasks-title">{t.home.tasksTitle}</h2>
            <p>{t.home.tasksLede}</p>
          </div>

          <ul className="task-grid" aria-labelledby="tasks-title">
            {TASKS.map((task, index) => (
              <li key={task.to}>
                <Link to={task.to} className="task-card">
                  <span className="task-card__icon" aria-hidden="true">
                    {task.icon}
                  </span>
                  <span className="task-card__body">
                    <span className="task-card__title">{t.home.tasks[index].title}</span>
                    <span className="task-card__text">{t.home.tasks[index].body}</span>
                  </span>
                  <ArrowRightIcon size={18} className="task-card__arrow" />
                </Link>
              </li>
            ))}
          </ul>

        </div>
      </section>

      {/* What tracking looks like, shown on a real seeded case — below the fold,
          where an example belongs. */}
      <section className="section public-accountability">
        <div className="container grid-2">
          <div className="stack">
            <p className="eyebrow">{t.nav.knowUdid}</p>
            <h2>{t.home.livePreviewTitle}</h2>
            <p>{t.home.exampleIntro}</p>
          </div>
          <HeroPreview />
        </div>
      </section>

      <section
        className="section--tight"
        style={{ background: "var(--surface)", borderBlock: "1px solid var(--border)" }}
      >
        <div className="container stack-5">
          <div className="stack">
            <h2>{t.home.processTitle}</h2>
            <p>{t.home.processIntro}</p>
          </div>

          <TableScroll label="The journey and its proposed targets">
            <table className="table">
              <caption className="visually-hidden">{t.home.processTitle}</caption>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">{t.track.stageLabel}</th>
                  <th scope="col">{t.track.holderLabel}</th>
                  <th scope="col">{t.common.proposedTarget}</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVE_STAGE_ORDER.map((key, index) => {
                  const stage = STAGE_DEFINITIONS[key];
                  return (
                    <tr key={key}>
                      <td className="numeric">{index + 1}</td>
                      <td>
                        <strong>{locale === "hi" ? stage.labelHindi : stage.label}</strong>
                        <br />
                        <span className="muted">
                          {locale === "hi" ? stage.meaningHindi : stage.meaning}
                        </span>
                      </td>
                      <td>{locale === "hi" ? stage.ownerLabelHindi : stage.ownerLabel}</td>
                      <td className="numeric">
                        {stage.slaDays} {t.common.days}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableScroll>

          <div className="stat stat--good">
            <span className="stat__value">
              {TOTAL_SLA_DAYS} {t.common.days}
            </span>
            <span className="stat__label">{t.home.totalTarget}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container stack-5">
          <h2>{t.home.rightsTitle}</h2>
          <div className="grid-2">
            {t.home.rights.map((right) => (
              <div key={right.title} className="card stack-2">
                <h3 className="row" style={{ gap: "var(--space-2)", alignItems: "flex-start" }}>
                  <CheckIcon size={20} className="brand__mark" />
                  <span>{right.title}</span>
                </h3>
                <p className="small">{right.body}</p>
              </div>
            ))}
          </div>

          {/* The argument for this service, one click away rather than on top of it. */}
          <p>
            <Link to="/about" className="btn btn--quiet">
              {t.nav.why}
              <ArrowRightIcon size={18} />
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
