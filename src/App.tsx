import { useEffect, useRef } from "react";
import { ensureSeeded } from "./bootstrap";
import { useI18n } from "./i18n/I18nContext";
import { useRoute, Link } from "./lib/router";
import { AboutScreen } from "./screens/AboutScreen";
import { AdminScreen } from "./screens/AdminScreen";
import { AppealScreen } from "./screens/AppealScreen";
import { BoardScreen } from "./screens/BoardScreen";
import { ApplyScreen } from "./screens/ApplyScreen";
import { EscalateScreen } from "./screens/EscalateScreen";
import { FixScreen } from "./screens/FixScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MyApplicationsScreen } from "./screens/MyApplicationsScreen";
import { SignInScreen } from "./screens/SignInScreen";
import { SitemapScreen } from "./screens/SitemapScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { ResourcesScreen } from "./screens/ResourcesScreen";
import { StaticPageScreen } from "./screens/StaticPageScreen";
import { OfficerScreen } from "./screens/OfficerScreen";
import { TrackScreen } from "./screens/TrackScreen";
import { Layout } from "./ui/Layout";

// The store is filled at import time so the first paint already has data.
ensureSeeded();

function NotFoundScreen() {
  const { t } = useI18n();
  return (
    <div className="column section--tight stack">
      <h1>That page does not exist</h1>
      <p className="lede">
        The address you followed is not one of this prototype's screens.
      </p>
      <p>
        <Link to="/" className="btn btn--primary">
          {t.nav.home}
        </Link>
      </p>
    </div>
  );
}

function Screen({ segments }: { segments: string[] }) {
  const [first, second] = segments;

  switch (first) {
    case undefined:
      return <HomeScreen />;
    case "apply":
      return <ApplyScreen />;
    case "signin":
      return <SignInScreen />;
    case "my-applications":
      return <MyApplicationsScreen />;
    case "track":
      return <TrackScreen applicationId={second ? decodeURIComponent(second) : null} />;
    case "fix":
      return second ? <FixScreen applicationId={decodeURIComponent(second)} /> : <NotFoundScreen />;
    case "escalate":
      return second ? <EscalateScreen applicationId={decodeURIComponent(second)} /> : <NotFoundScreen />;
    case "appeal":
      return second ? <AppealScreen applicationId={decodeURIComponent(second)} /> : <NotFoundScreen />;
    case "board":
      return <BoardScreen district={second ? decodeURIComponent(second) : null} />;
    case "about":
      return <AboutScreen />;
    case "help":
      return <StaticPageScreen page="help" />;
    case "accessibility":
      return <StaticPageScreen page="accessibility" />;
    case "policies":
      return <StaticPageScreen page="policies" />;
    case "sitemap":
      return <SitemapScreen />;
    case "search":
      return <SearchScreen query={second ? decodeURIComponent(second) : ""} />;
    case "resources":
      return <ResourcesScreen />;
    case "officer":
      return <OfficerScreen />;
    case "admin":
      return <AdminScreen />;
    default:
      return <NotFoundScreen />;
  }
}

export function App() {
  const route = useRoute();
  const previousPath = useRef<string | null>(null);

  /**
   * On a route change, move the page back to the top and put focus on <main>. Without
   * this a keyboard or screen-reader user stays wherever they were in the previous
   * page's tab order, which on a single-page app means arriving somewhere arbitrary.
   *
   * This compares the path rather than using a first-render flag: StrictMode runs
   * effects twice on mount, and a flag would let the second pass steal focus on a
   * first load, putting it past the skip link before the user has pressed anything.
   */
  useEffect(() => {
    const previous = previousPath.current;
    previousPath.current = route.path;
    if (previous === null || previous === route.path) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    // Focusing main is important for keyboard and screen-reader users, but a normal
    // focus() also scrolls the focused region into view. With the sticky portal
    // header that second scroll hid the new page heading under the header.
    document.getElementById("main")?.focus({ preventScroll: true });
  }, [route.path]);

  return (
    <Layout path={route.path}>
      <Screen segments={route.segments} />
    </Layout>
  );
}
