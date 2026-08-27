import { useI18n } from "../i18n/I18nContext";
import type { Locale } from "../i18n/messages";
import { staticPages, type Pages } from "../i18n/pages";
import { Link } from "../lib/router";
import { ArrowRightIcon, DocumentIcon, HospitalIcon, SearchIcon } from "../ui/Icons";

const helpCitizenGuidanceHero = new URL("../assets/help-citizen-guidance-hero.webp", import.meta.url).href;

/**
 * Help, the accessibility statement and the website policies.
 *
 * GIGW asks every Indian government site to publish these, in a predictable place, in
 * more than one language. They share one renderer because they share one shape:
 * a title, a sentence saying what the page is for, and a series of plainly headed
 * sections. A citizen who has read one of these on another government site should not
 * have to learn a new layout to read this one.
 */

export type StaticPageKey = keyof Pages;

const RELATED: Record<StaticPageKey, Array<{ to: string; key: StaticPageKey }>> = {
  help: [
    { to: "/accessibility", key: "accessibility" },
    { to: "/policies", key: "policies" }
  ],
  accessibility: [
    { to: "/help", key: "help" },
    { to: "/policies", key: "policies" }
  ],
  policies: [
    { to: "/help", key: "help" },
    { to: "/accessibility", key: "accessibility" }
  ]
};

/**
 * An in-page jump that does not touch the URL hash.
 *
 * A plain href="#section-2" would be read by the hash router as a route change, exactly
 * as the skip link was before it was fixed. It stays an anchor so the browser's own
 * affordances keep working, and moves focus by hand so a keyboard user actually lands
 * on the heading rather than merely scrolling the page under them.
 */
function jumpTo(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  const target = document.getElementById(id);
  if (!target) return;
  target.setAttribute("tabindex", "-1");
  target.focus();
  target.scrollIntoView({ block: "start", behavior: "auto" });
}

/** Help is a service destination, not a policy document: lead with the routes a
 * citizen can take, then keep the detailed answer map close behind it. */
function HelpServiceHeader({ title, lede, isHindi }: { title: string; lede: string; isHindi: boolean }) {
  const routes = [
    {
      to: "/apply",
      icon: <DocumentIcon size={22} />,
      title: isHindi ? "आवेदन शुरू करें" : "Start an application",
      body: isHindi ? "चार आसान चरणों में जानकारी और दस्तावेज़ दें।" : "Give your details and documents in four clear steps."
    },
    {
      to: "/track",
      icon: <SearchIcon size={22} />,
      title: isHindi ? "अपना केस ट्रैक करें" : "Track your case",
      body: isHindi ? "जानें कि आपका आवेदन कहाँ है और आगे क्या होगा।" : "See where your application is and what happens next."
    },
    {
      to: "/board",
      icon: <HospitalIcon size={22} />,
      title: isHindi ? "बोर्ड की तारीख देखें" : "Find a board date",
      body: isHindi ? "जिले की प्रकाशित बैठकें और कतार देखें।" : "See published district sittings and the queue."
    }
  ];

  return (
    <>
      <section className="help-hero">
        <div className="container help-hero__grid">
          <div className="help-hero__copy">
            <p className="eyebrow">{isHindi ? "नागरिक सहायता" : "Citizen support"}</p>
            <h1>{title}</h1>
            <p className="lede">{lede}</p>
            <p className="help-hero__note">
              {isHindi
                ? "पहले अपना काम चुनें। हर विकल्प आपको सीधे उसी सेवा तक ले जाता है।"
                : "Choose the task you need. Each route takes you directly to the right service."}
            </p>
          </div>
          <figure className="help-hero__visual" aria-hidden="true">
            <img src={helpCitizenGuidanceHero} alt="" />
          </figure>
        </div>
      </section>

      <section className="help-routes" aria-label={isHindi ? "सहायता के विकल्प" : "Help options"}>
        <div className="container">
          <ul>
            {routes.map((route) => (
              <li key={route.to}>
                <Link to={route.to} className="help-route">
                  <span className="help-route__icon" aria-hidden="true">{route.icon}</span>
                  <span>
                    <strong>{route.title}</strong>
                    <span>{route.body}</span>
                  </span>
                  <ArrowRightIcon size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export function StaticPageScreen({ page }: { page: StaticPageKey }) {
  const { locale, t } = useI18n();
  const content = staticPages[locale][page];
  const isHelp = page === "help";

  return (
    <>
      {isHelp ? (
        <HelpServiceHeader title={content.title} lede={content.lede} isHindi={locale === "hi"} />
      ) : (
        <div className="column section--tight stack-6">
          <div className="stack">
            <h1>{content.title}</h1>
            <p className="lede">{content.lede}</p>
          </div>

          <StaticPageBody content={content} page={page} t={t} locale={locale} />
        </div>
      )}

      {isHelp && (
        <div className="container help-page-body section--tight">
          <StaticPageBody content={content} page={page} t={t} locale={locale} />
        </div>
      )}
    </>
  );
}

function StaticPageBody({ content, page, t, locale }: { content: Pages["help"]; page: StaticPageKey; t: ReturnType<typeof useI18n>["t"]; locale: Locale }) {
  return (
    <>
      {/* A table of contents on a long statutory page is the difference between a page
          somebody reads and a page somebody scrolls past. */}
      <nav className="card on-page-nav" aria-labelledby="on-this-page">
        <p className="field__label" id="on-this-page">{t.common.onThisPage}</p>
        <ol>
          {content.sections.map((section, index) => (
            <li key={section.heading}>
              <a href={`#section-${index}`} onClick={(event) => jumpTo(event, `section-${index}`)}>
                <span className="on-page-nav__number" aria-hidden="true">{index + 1}</span>
                {section.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="static-page-sections">
        {content.sections.map((section, index) => (
          <section className="stack" key={section.heading}>
            <h2 id={`section-${index}`}>{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <nav className="card stack-2" aria-label={t.common.relatedPages}>
          <p className="field__label">{t.common.relatedPages}</p>
          <div className="row">
            {RELATED[page].map((related) => (
              <Link key={related.to} to={related.to} className="btn btn--secondary btn--small">
                {staticPages[locale][related.key].title}
                <ArrowRightIcon size={16} />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
