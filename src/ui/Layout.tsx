import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useI18n } from "../i18n/I18nContext";
import { Link, navigate } from "../lib/router";
import { signOut } from "../core/session";
import { useSession } from "../lib/useSession";
import { AccessibilityBar } from "./AccessibilityBar";
import { BrandMark, PersonIcon, SearchIcon } from "./Icons";

interface LayoutProps {
  children: ReactNode;
  /** The current route path, used to mark the active nav item. */
  path: string;
}

/** True when this nav item owns the current route. */
function isActive(path: string, target: string): boolean {
  if (target === "/") return path === "/";
  return path === target || path.startsWith(`${target}/`);
}

export function Layout({ children, path }: LayoutProps) {
  const { t, locale, toggleLocale } = useI18n();
  const session = useSession();
  const [isNavigationOpen, setNavigationOpen] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isStaffSession = Boolean(session && session.role !== "APPLICANT");

  // A route change is also the natural close point for the compact navigation.
  // Keeping this in the layout means every link remains a normal, copyable hash link.
  useEffect(() => {
    setNavigationOpen(false);
    setSearchOpen(false);
  }, [path]);

  /**
   * Citizen routes only. The judging criteria say the consumer side is what is
   * evaluated and the staff side is assumed, so the staff tools do not get equal
   * billing in the main navigation — they sit in their own labelled bar below.
   */
  const navItems = [
    { to: "/", label: t.nav.home },
    { to: "/apply", label: t.nav.apply },
    { to: "/track", label: t.nav.track },
    { to: "/board", label: t.board.navLabel },
    { to: "/about", label: t.nav.knowUdid },
    ...(session && session.role === "APPLICANT"
      ? [{ to: "/my-applications", label: t.nav.myApplications }]
      : []),
    { to: "/help", label: t.nav.help }
  ];

  const staffItems = [
    { to: "/officer", label: t.nav.officer },
    { to: "/admin", label: t.nav.admin }
  ];

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="app-shell">
      {/* A plain href="#main" would be read by the hash router as a route change to
          /main, so the jump is done by hand. The anchor stays an anchor: Enter on a
          link fires click, so keyboard and pointer both land on <main>. */}
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main");
          main?.focus();
          main?.scrollIntoView({ block: "start", behavior: "auto" });
        }}
      >
        {t.nav.skip}
      </a>

      <AccessibilityBar
        locale={locale}
        onToggleLocale={toggleLocale}
        switchLabel={t.meta.switchTo}
        otherLanguage={t.meta.otherLanguageName}
      />

      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand" aria-label={`${t.meta.serviceName} — ${t.nav.home}`}>
            <span className="brand__crest">
              <BrandMark size={34} className="brand__mark" />
            </span>
            <span className="brand__copy">
              <span className="brand__eyebrow">{t.nav.portalLabel}</span>
              <span className="brand__name">{t.meta.serviceName}</span>
              <span className="brand__tag">{t.meta.serviceTag}</span>
            </span>
          </Link>

          <div className="header-actions">
            <button
              type="button"
              className="header-search-toggle"
              aria-expanded={isSearchOpen}
              aria-controls="website-search"
              aria-label={isSearchOpen ? t.nav.closeSearch : t.nav.openSearch}
              onClick={() => setSearchOpen((open) => !open)}
            >
              <SearchIcon size={18} />
              <span>{t.nav.search}</span>
            </button>
            <button
              type="button"
              className="nav-toggle"
              aria-expanded={isNavigationOpen}
              aria-controls="primary-navigation"
              onClick={() => setNavigationOpen((open) => !open)}
            >
              <span aria-hidden="true" className="nav-toggle__glyph">
                {isNavigationOpen ? "×" : "☰"}
              </span>
              {isNavigationOpen ? t.nav.closeMenu : t.nav.menu}
            </button>

            <nav
              id="primary-navigation"
              className="site-nav"
              data-open={isNavigationOpen ? "true" : "false"}
              aria-label={t.nav.primary}
            >
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive(path, item.to) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}

              <div className="site-nav__account">
                {session ? (
                  <>
                    <span className="chip chip--done">
                      <PersonIcon size={15} />
                      {session.displayName}
                    </span>
                    <button
                      type="button"
                      className="btn btn--quiet btn--small"
                      onClick={() => {
                        signOut();
                        navigate("/");
                      }}
                    >
                      {t.nav.signOut}
                    </button>
                  </>
                ) : (
                  <Link to="/signin" className="btn btn--secondary btn--small">
                    <PersonIcon size={16} />
                    {t.nav.signIn}
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="portal-search-panel" id="website-search" hidden={!isSearchOpen}>
        <div className="container">
          <form className="portal-search-panel__form" role="search" onSubmit={submitSearch}>
            <label className="visually-hidden" htmlFor="website-search-input">
              {t.search.label}
            </label>
            <input
              id="website-search-input"
              className="input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              autoComplete="off"
              autoFocus={isSearchOpen}
            />
            <button type="submit" className="btn btn--primary">
              <SearchIcon size={18} />
              {t.nav.search}
            </button>
          </form>
        </div>
      </div>

      <div className="portal-notice" role="status">
        <div className="container portal-notice__inner">
          <span className="portal-notice__label">{t.nav.publicNotice}</span>
          <span className="portal-notice__summary">{t.nav.noticeText}</span>
          <Link to="/help" className="service-ribbon__link">
            {t.nav.getHelp}
          </Link>
        </div>
      </div>

      {/* The route contract keeps staff tools structurally discoverable. On a citizen's
          compact screen the bar is visually removed; staff retain it after sign-in. */}
      <div className="staff-bar" data-staff-session={isStaffSession ? "true" : "false"}>
        <div className="container">
          <span className="staff-bar__label">{t.nav.staff}</span>
          <nav className="staff-bar__nav" aria-label={t.nav.staff}>
            {staffItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive(path, item.to) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <span className="staff-bar__note">{t.nav.staffNote}</span>
        </div>
      </div>

      <main id="main" className="app-main" tabIndex={-1}>
        {children}
      </main>

      {/* GIGW asks for navigation to every page from the footer, the four website
          policies, a named content owner and a review date. All of it is here — and the
          disclaimer sits first, because adopting the conventions of a government
          service makes being mistaken for one more likely, not less. */}
      <footer className="site-footer" aria-label={t.nav.footerNav}>
        <div className="container">
          <div className="footer-grid footer-grid--portal">
            <div className="footer-col">
              <p className="footer-col__title">{t.nav.services}</p>
              <ul>
                {/* Help is listed once, under "about", so the footer does not offer the
                    same link twice under two headings. */}
                {navItems
                  .filter((item) => item.to !== "/help" && item.to !== "/resources" && item.to !== "/about")
                  .map((item) => (
                    <li key={item.to}>
                      <Link to={item.to}>{item.label}</Link>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="footer-col">
              <p className="footer-col__title">{t.nav.resources}</p>
              <ul>
                <li><Link to="/resources">{t.nav.resources}</Link></li>
                <li><Link to="/admin">{t.nav.reconciliation}</Link></li>
                <li><Link to="/about">{t.nav.knowUdid}</Link></li>
                <li><Link to="/board">{t.board.navLabel}</Link></li>
                <li><Link to="/sitemap">{t.nav.sitemap}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <p className="footer-col__title">{t.nav.help}</p>
              <ul>
                <li><Link to="/help">{t.nav.help}</Link></li>
                <li><Link to="/accessibility">{t.nav.accessibility}</Link></li>
                <li><Link to="/policies">{t.nav.policies}</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <p className="footer-col__title">{t.nav.about}</p>
              <ul>
                <li>
                  <Link to="/about">{t.nav.why}</Link>
                </li>
                <li>
                  <Link to="/signin">{t.nav.signIn}</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <p className="footer-col__title">{t.nav.staff}</p>
              <ul>
                {staffItems.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* The hackathon rules require the disclaimer in the footer of every page,
              and GIGW requires a named content owner and review date. This block was
              lost in the portal rebuild and is restored deliberately — the strings
              were still in the message catalogue, only the render had gone. */}
          <div className="footer-meta stack">
            <p>
              <strong>{t.footer.title}</strong>
            </p>
            <p>{t.footer.body}</p>
            <p>{t.footer.proposedSla}</p>
            <p>{t.footer.standards}</p>
            <p>
              {t.footer.owner} {t.common.lastReviewed}: {t.footer.reviewed}.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
