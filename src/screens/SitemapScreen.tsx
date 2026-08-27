import { staticPages } from "../i18n/pages";
import { useI18n } from "../i18n/I18nContext";
import { Link } from "../lib/router";

/**
 * The sitemap.
 *
 * GIGW asks for a sitemap, or a link to every page, reachable from the homepage. It is
 * one of those requirements that reads like bureaucracy and is not: on a service where
 * a lot of people arrive by screen reader or by keyboard, a single flat list of
 * everything is often the fastest way to get anywhere.
 */
export function SitemapScreen() {
  const { t, locale } = useI18n();
  const pages = staticPages[locale];

  const groups = [
    {
      title: t.nav.services,
      links: [
        { to: "/", label: t.nav.home },
        { to: "/apply", label: t.nav.apply },
        { to: "/track", label: t.nav.track },
        { to: "/board", label: t.board.navLabel },
        { to: "/resources", label: t.nav.resources },
        { to: "/signin", label: t.nav.signIn },
        { to: "/my-applications", label: t.nav.myApplications }
      ]
    },
    {
      title: t.nav.staff,
      links: [
        { to: "/officer", label: t.nav.officer },
        { to: "/admin", label: t.nav.admin }
      ]
    },
    {
      title: t.nav.about,
      links: [
        { to: "/about", label: t.nav.why },
        { to: "/help", label: pages.help.title },
        { to: "/accessibility", label: pages.accessibility.title },
        { to: "/policies", label: pages.policies.title },
        { to: "/sitemap", label: t.nav.sitemap }
      ]
    }
  ];

  return (
    <div className="column section--tight stack-6">
      <div className="stack">
        <h1>{t.nav.sitemap}</h1>
        <p className="lede">
          {locale === "hi"
            ? "इस प्रोटोटाइप का हर पृष्ठ, एक ही सूची में।"
            : "Every page in this prototype, in one list."}
        </p>
      </div>

      {groups.map((group) => (
        <nav className="card stack-2" key={group.title} aria-label={group.title}>
          <h2 className="card__title">{group.title}</h2>
          <ul className="bullet-list">
            {group.links.map((link) => (
              <li key={link.to}>
                <span aria-hidden="true">›</span>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}

      <nav
        className="card stack-2"
        aria-label={locale === "hi" ? "केस पृष्ठ" : "Case pages"}
      >
        <h2 className="card__title">
          {locale === "hi" ? "केस पृष्ठ" : "Case pages"}
        </h2>
        <p className="small">
          {locale === "hi"
            ? "हर आवेदन का अपना पता होता है, जिसे साझा किया जा सकता है। डेमो उदाहरण:"
            : "Every application has its own shareable address. Demo examples:"}
        </p>
        <ul className="bullet-list">
          {["UDID-DEMO-1024", "UDID-DEMO-2048", "UDID-DEMO-4096", "UDID-DEMO-8192"].map(
            (id) => (
              <li key={id}>
                <span aria-hidden="true">›</span>
                <Link to={`/track/${id}`} className="numeric">
                  {id}
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </div>
  );
}
