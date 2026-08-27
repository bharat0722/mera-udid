import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../App";
import { I18nProvider } from "../i18n/I18nContext";
import { deriveCurrentStage } from "../core/projections";
import { getEvents } from "../core/caseStore";
import { signOut } from "../core/session";
import { reset as resetStore } from "../core/caseStore";
import { ensureSeeded, resetSeeded } from "../bootstrap";

/**
 * These tests walk the golden path in the same order the demo does. They exist to keep
 * a promise made in the brief: every feature shown must actually work. A dead button or
 * a screen that renders but cannot be driven would fail here.
 */

function renderApp(path = "/") {
  window.location.hash = path;
  return render(
    <I18nProvider>
      <App />
    </I18nProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  // The session is held in a module-level variable as well as in storage, so clearing
  // storage alone would leak a signed-in user into the next test.
  signOut();
  // Every test gets a pristine dataset. The store is a module-level singleton, so
  // without this a test that advances a case silently changes the world the next one
  // runs in — which is exactly the kind of hidden coupling that makes a suite lie.
  resetStore();
  resetSeeded();
  ensureSeeded();
  window.location.hash = "/";
});

describe("home", () => {
  it("opens as a service homepage, with the evidence one click away", () => {
    renderApp("/");

    expect(
      screen.getByRole("heading", { name: /disability certificate services/i })
    ).toBeInTheDocument();
    // The parliamentary case lives on /about, not on the front door.
    expect(screen.queryByText("1,15,63,288")).toBeNull();
    const main = screen.getByRole("main");
    expect(within(main).getByRole("link", { name: /why mera udid/i })).toBeInTheDocument();
  });

  it("keeps the full parliamentary arithmetic on the About page", async () => {
    renderApp("/about");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /case for a new system/i })).toBeInTheDocument()
    );
    expect(screen.getByText("1,15,63,288")).toBeInTheDocument();
    expect(screen.getByText("1,05,50,672")).toBeInTheDocument();
    expect(screen.getByText("10,12,616")).toBeInTheDocument();
    expect(screen.getAllByText(/cannot enter/i).length).toBeGreaterThan(0);
  });

  it("shows a real tracked case on the homepage, not a mock-up", () => {
    renderApp("/");

    expect(screen.getByText("UDID-DEMO-4096")).toBeInTheDocument();
    // 211 days at the medical board against a 21-day proposed target.
    expect(screen.getByText("211")).toBeInTheDocument();
  });

  it("switches the whole page to Hindi, without using the rejected terminology", () => {
    renderApp("/");

    const toggle = screen.getByRole("button", { name: /switch language/i });
    return userEvent.click(toggle).then(() => {
      expect(
        screen.getByRole("heading", { name: /विकलांगता प्रमाणपत्र सेवाएँ/ })
      ).toBeInTheDocument();
      expect(document.body.textContent).not.toMatch(/दिव्यांग/);
      expect(document.body.textContent).not.toMatch(/Divyang/i);
    });
  });
});

describe("track", () => {
  it("names who has the file, and how long they have had it", async () => {
    renderApp("/track/UDID-DEMO-1024");

    await waitFor(() =>
      expect(screen.getAllByText(/who has your file right now/i).length).toBeGreaterThan(0)
    );
    expect(
      screen.getAllByText(/district hospital medical board/i).length
    ).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: /every stage of this case/i })).toBeInTheDocument();
  });

  it("shows a returned case in plain language, with one action to fix it", async () => {
    renderApp("/track/UDID-DEMO-2048");

    await waitFor(() =>
      expect(screen.getByText(/sent back to you/i)).toBeInTheDocument()
    );
    expect(
      screen.getAllByText(/the uploaded document could not be read clearly/i).length
    ).toBeGreaterThan(0);
    expect(screen.getByText(/your place in the queue is protected/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /fix this and resubmit/i })).toBeInTheDocument();
  });

  it("says plainly when an application is in no stage at all", async () => {
    renderApp("/track/UDID-ORPH-1000");

    await waitFor(() =>
      expect(
        screen.getAllByText(/this application is not in any stage/i).length
      ).toBeGreaterThan(0)
    );
  });

  it("does not invent a status for an ID that does not exist", async () => {
    renderApp("/track/UDID-NOT-REAL");

    await waitFor(() =>
      expect(screen.getAllByText(/no application with that id exists/i).length).toBeGreaterThan(0)
    );
  });
});

describe("fix and resubmit", () => {
  it("sends the case back to the desk and keeps the queue place", async () => {
    const user = userEvent.setup();
    renderApp("/fix/UDID-DEMO-2048");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /fix and resubmit/i })).toBeInTheDocument()
    );

    const submit = screen.getByRole("button", { name: /send it back to the office/i });
    expect(submit).toBeDisabled();

    await user.click(screen.getByRole("checkbox"));
    expect(submit).toBeEnabled();
    await user.click(submit);

    expect(await screen.findByText(/sent back to the office/i)).toBeInTheDocument();
    expect(screen.getByText(/your place in the queue was kept/i)).toBeInTheDocument();
    expect(deriveCurrentStage(getEvents("UDID-DEMO-2048"))).toBe("DOC_VERIFICATION");
  });
});

describe("officer console", () => {
  it("will not let an officer return a case without a structured reason", async () => {
    const user = userEvent.setup();
    renderApp("/officer");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /officer console/i })).toBeInTheDocument()
    );

    const returnButton = screen.getByRole("button", { name: /^return to the applicant$/i });
    expect(returnButton).toBeDisabled();

    await user.selectOptions(
      screen.getByLabelText(/reason code/i),
      "DOC_NAME_MISMATCH"
    );
    expect(returnButton).toBeEnabled();
    expect(
      screen.getAllByText(/the name differs between your documents/i).length
    ).toBeGreaterThan(0);
  });

  it("has the state machine refuse the write even when the UI is bypassed", async () => {
    const user = userEvent.setup();
    renderApp("/officer");

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /try returning it with no reason/i })
      ).toBeInTheDocument()
    );

    await user.click(screen.getByRole("button", { name: /try returning it with no reason/i }));

    expect(await screen.findByText(/REASON_CODE_REQUIRED/)).toBeInTheDocument();
  });

  it("advances a case, and the citizen screen shows it immediately", async () => {
    const user = userEvent.setup();
    renderApp("/officer");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /officer console/i })).toBeInTheDocument()
    );

    await user.click(screen.getByRole("button", { name: /record the assessment/i }));
    expect(deriveCurrentStage(getEvents("UDID-DEMO-1024"))).toBe("BOARD_ASSESSED");
  });
});

describe("apply", () => {
  it("catches a missing document before submission, not three months after", async () => {
    const user = userEvent.setup();
    renderApp("/apply");

    await waitFor(() =>
      expect(screen.getByLabelText(/full name of the person applying/i)).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText(/full name of the person applying/i), "Test Applicant");
    await user.type(screen.getByLabelText(/age in years/i), "31");
    await user.type(screen.getByLabelText(/mobile number/i), "9000000000");
    await user.click(screen.getByRole("button", { name: /^next$/i }));

    await user.click(
      screen.getByRole("radio", { name: /hearing impairment/i })
    );
    await user.click(screen.getByRole("button", { name: /^next$/i }));

    const precheck = await screen.findByText(/some documents are missing/i);
    expect(precheck).toBeInTheDocument();

    // Tick everything the category needs and the pre-check clears.
    for (const checkbox of screen.getAllByRole("checkbox")) {
      await user.click(checkbox);
    }
    expect(
      await screen.findByText(/everything this category needs is attached/i)
    ).toBeInTheDocument();
  });

  it("refuses to move on from an empty form, and says what is wrong", async () => {
    const user = userEvent.setup();
    renderApp("/apply");

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^next$/i })).toBeInTheDocument()
    );
    await user.click(screen.getByRole("button", { name: /^next$/i }));

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/enter the applicant's full name/i)).toBeInTheDocument();
    expect(within(alert).getByText(/enter a 10-digit mobile number/i)).toBeInTheDocument();
  });
});

describe("oversight", () => {
  it("runs the reconciliation engine live and names the gap", async () => {
    // The engine was reserved for Codex and is now implemented: the panel must show
    // the real report — 1416 received, 1408 accounted for, a gap of 8 — and the
    // "reserved" placeholder must be gone.
    renderApp("/admin");

    await waitFor(() =>
      expect(screen.getAllByText(/in no column at all/i).length).toBeGreaterThan(0)
    );
    expect(screen.getAllByText("1416").length).toBeGreaterThan(0);
    expect(screen.getAllByText("1408").length).toBeGreaterThan(0);
    expect(screen.queryByText(/reserved for codex/i)).toBeNull();
  });

  it("admits how many applications its own charts cannot count", async () => {
    renderApp("/admin");

    await waitFor(() =>
      expect(screen.getByText(/cannot be placed in any stage/i)).toBeInTheDocument()
    );
  });
});

describe("demo sign-in", () => {
  it("accepts the credentials printed on the page", async () => {
    const user = userEvent.setup();
    renderApp("/signin");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /sign in to the demo/i })).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText(/username/i), "ravi");
    await user.type(screen.getByLabelText(/^password$/i), "demo1234");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByRole("heading", { name: /my applications/i })
    ).toBeInTheDocument();
    expect(screen.getByText("UDID-DEMO-2048")).toBeInTheDocument();
    expect(screen.getByText(/needs something from you/i)).toBeInTheDocument();
  });

  it("says so plainly when the credentials are wrong", async () => {
    const user = userEvent.setup();
    renderApp("/signin");

    await waitFor(() => expect(screen.getByLabelText(/username/i)).toBeInTheDocument());
    await user.type(screen.getByLabelText(/username/i), "ravi");
    await user.type(screen.getByLabelText(/^password$/i), "wrong");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /do not match a demo account/i
    );
  });

  it("signs a judge in with one click, without typing anything", async () => {
    const user = userEvent.setup();
    renderApp("/signin");

    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /sign in as this person/i }).length).toBeGreaterThan(0)
    );

    // The first citizen card is Asha Verma, whose case is moving normally.
    await user.click(screen.getAllByRole("button", { name: /sign in as this person/i })[0]);

    expect(
      await screen.findByRole("heading", { name: /my applications/i })
    ).toBeInTheDocument();
    expect(screen.getByText("UDID-DEMO-1024")).toBeInTheDocument();
  });

  it("sends a staff account to the queue, not to a citizen dashboard", async () => {
    const user = userEvent.setup();
    renderApp("/signin");

    await waitFor(() => expect(screen.getByLabelText(/username/i)).toBeInTheDocument());
    await user.type(screen.getByLabelText(/username/i), "officer");
    await user.type(screen.getByLabelText(/^password$/i), "demo1234");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      await screen.findByRole("heading", { name: /officer console/i })
    ).toBeInTheDocument();
  });

  it("lets you sign out again", async () => {
    const user = userEvent.setup();
    renderApp("/signin");

    await waitFor(() => expect(screen.getByLabelText(/username/i)).toBeInTheDocument());
    await user.type(screen.getByLabelText(/username/i), "asha");
    await user.type(screen.getByLabelText(/^password$/i), "demo1234");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));
    await screen.findByRole("heading", { name: /my applications/i });

    await user.click(screen.getByRole("button", { name: /sign out/i }));

    expect(await screen.findByRole("heading", { name: /disability certificate services/i })).toBeInTheDocument();
  });

  it("does not gate tracking behind a sign-in", async () => {
    renderApp("/track/UDID-DEMO-4096");

    await waitFor(() =>
      expect(screen.getAllByText(/who has your file right now/i).length).toBeGreaterThan(0)
    );
  });
});

describe("built for a busy citizen", () => {
  it("checks a status straight from the homepage, without a second page", async () => {
    const user = userEvent.setup();
    renderApp("/");

    const field = screen.getByLabelText(/your application id/i);
    await user.type(field, "udid-demo-8192");
    await user.click(screen.getByRole("button", { name: /show me where it is/i }));

    expect(
      await screen.findByRole("heading", { name: /every stage of this case/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText("UDID-DEMO-8192").length).toBeGreaterThan(0);
  });

  it("says what is at stake, on the About page where the case is made", async () => {
    renderApp("/about");
    await waitFor(() =>
      expect(screen.getByText(/you lose everything at once/i)).toBeInTheDocument()
    );
  });

  it("keeps the staff tools out of the main navigation", () => {
    renderApp("/");
    const primary = screen.getByRole("navigation", { name: /^main$/i });
    expect(within(primary).queryByText(/oversight/i)).toBeNull();
    expect(within(primary).queryByText(/officer/i)).toBeNull();

    const staff = screen.getByRole("navigation", { name: /staff view/i });
    expect(within(staff).getByText(/oversight/i)).toBeInTheDocument();
  });
});

describe("the promise, said to the citizen", () => {
  it("explains on the case page why it cannot go quiet", async () => {
    renderApp("/track/UDID-DEMO-1024");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /why this case cannot go quiet/i })
      ).toBeInTheDocument()
    );
    expect(screen.getByText(/always in exactly one stage/i)).toBeInTheDocument();
  });
});

describe("the medical board, published", () => {
  it("gives an applicant a date instead of a queue position", async () => {
    renderApp("/track/UDID-DEMO-1024");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /your medical board date/i })
      ).toBeInTheDocument()
    );
    expect(screen.getByText(/expected date, if the board sits as published/i)).toBeInTheDocument();
    expect(screen.getByText(/sittings that have to happen first/i)).toBeInTheDocument();
    // A forecast, and labelled as one — not a promise.
    expect(screen.getByText(/not a promise/i)).toBeInTheDocument();
  });

  it("does not offer a board date once the board has already seen you", async () => {
    renderApp("/track/UDID-DEMO-8192");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /every stage of this case/i })).toBeInTheDocument()
    );
    expect(screen.queryByRole("heading", { name: /your medical board date/i })).toBeNull();
  });

  it("publishes every district's calendar, capacity and backlog", async () => {
    renderApp("/board");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /district medical board calendar/i })
      ).toBeInTheDocument()
    );
    expect(screen.getByRole("heading", { name: /^Bhopal$/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^Jabalpur$/ })).toBeInTheDocument();
    expect(screen.getAllByText(/people seen per week/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/weeks to clear the queue/i).length).toBeGreaterThan(0);
  });

  it("holds each district against the one published cadence benchmark", async () => {
    renderApp("/board/Jabalpur");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /^Jabalpur$/ })).toBeInTheDocument()
    );
    // Jabalpur sits one day a week, against a two-day benchmark.
    expect(screen.getByText(/below the two-days-a-week benchmark/i)).toBeInTheDocument();
  });

  it("says the calendar is a proposal, because the real service publishes none", async () => {
    renderApp("/board");

    await waitFor(() =>
      expect(screen.getByText(/publishes no board calendar at all/i)).toBeInTheDocument()
    );
  });
});

describe("government website conventions", () => {
  it("opens with a homepage, not a search form", () => {
    renderApp("/");

    // The hero offers the two primary actions and no input field.
    const hero = document.querySelector(".hero") as HTMLElement;
    expect(within(hero).getByRole("link", { name: /start a new application/i })).toBeInTheDocument();
    expect(within(hero).getByRole("link", { name: /track an existing application/i })).toBeInTheDocument();
    expect(within(hero).queryByRole("textbox")).toBeNull();
  });

  it("lists what people came to do, the way a government homepage does", () => {
    renderApp("/");

    const tasks = screen.getByRole("list", { name: /what would you like to do/i });
    const links = within(tasks).getAllByRole("link");
    expect(links.length).toBe(5);
    expect(within(tasks).getByRole("link", { name: /apply for a disability certificate/i })).toBeInTheDocument();
    expect(within(tasks).getByRole("link", { name: /find your medical board date/i })).toBeInTheDocument();
  });

  it("still lets a returning applicant check a status from the homepage", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await user.type(screen.getByLabelText(/your application id/i), "udid-demo-8192");
    await user.click(screen.getByRole("button", { name: /show me where it is/i }));

    expect(
      await screen.findByRole("heading", { name: /every stage of this case/i })
    ).toBeInTheDocument();
  });

  it("publishes the pages GIGW asks a government service to publish", async () => {
    for (const [path, heading] of [
      ["/help", /^help$/i],
      ["/accessibility", /accessibility statement/i],
      ["/policies", /website policies/i],
      ["/sitemap", /^sitemap$/i]
    ] as const) {
      cleanup();
      renderApp(path);
      await waitFor(() =>
        expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument()
      );
    }
  });

  it("names the four website policies GIGW requires", async () => {
    renderApp("/policies");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /terms and conditions/i })).toBeInTheDocument()
    );
    expect(screen.getByRole("heading", { name: /^privacy$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^copyright$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^hyperlinking$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /content ownership and review/i })).toBeInTheDocument();
  });

  it("reaches every page from the footer, and names a content owner", () => {
    renderApp("/");

    const footer = screen.getByRole("contentinfo");
    for (const label of [/^help$/i, /accessibility statement/i, /website policies/i, /^sitemap$/i]) {
      expect(within(footer).getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(within(footer).getByText(/content owner/i)).toBeInTheDocument();
    expect(within(footer).getByText(/last reviewed/i)).toBeInTheDocument();
  });

  it("says it is not a government product, on the statutory pages too", async () => {
    renderApp("/policies");

    await waitFor(() =>
      expect(
        screen.getAllByText(/not an official government of india product/i).length
      ).toBeGreaterThan(0)
    );
    expect(screen.getByText(/uses no government logo or emblem/i)).toBeInTheDocument();
  });

  it("states the accessibility standard it is built to", async () => {
    renderApp("/accessibility");

    await waitFor(() =>
      expect(screen.getAllByText(/WCAG 2.2 Level AA/i).length).toBeGreaterThan(0)
    );
    expect(screen.getByText(/GIGW 3.0 requires Level AA of WCAG 2.1/i)).toBeInTheDocument();
    // The most important line on the page: what has not been done.
    expect(
      screen.getByText(/not yet been tested with people who use assistive technology/i)
    ).toBeInTheDocument();
  });
});

describe("the accessibility toolkit", () => {
  it("puts text size and contrast in the page chrome, on every screen", () => {
    renderApp("/");
    const bar = screen.getByRole("group", { name: /display/i });
    expect(within(bar).getByRole("button", { name: /increase text size/i })).toBeInTheDocument();
    expect(within(bar).getByRole("button", { name: /decrease text size/i })).toBeInTheDocument();
    expect(within(bar).getByRole("button", { name: /high contrast/i })).toBeInTheDocument();
  });

  it("grows the text and stops at the largest size", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const bigger = screen.getByRole("button", { name: /increase text size/i });

    await user.click(bigger);
    expect(document.documentElement.style.fontSize).toBe("112.5%");
    await user.click(bigger);
    expect(document.documentElement.style.fontSize).toBe("125%");
    expect(bigger).toBeDisabled();
  });

  it("announces high contrast as a pressed toggle, not just a colour change", async () => {
    const user = userEvent.setup();
    renderApp("/");
    const toggle = screen.getByRole("button", { name: /high contrast/i });

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.getAttribute("data-contrast")).toBe("high");
  });
});

describe("the statutory time limit, and raising a delay", () => {
  it("shows a case its legal deadline, not only our proposed target", async () => {
    renderApp("/track/UDID-DEMO-4096");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /legal time limit for your certificate/i })
      ).toBeInTheDocument()
    );
    // Applied 247 days ago against a 90-day statutory limit.
    expect(screen.getByText(/157 days past the legal time limit/i)).toBeInTheDocument();
    expect(screen.getByText(/Rights of Persons with Disabilities Rules, 2017/i)).toBeInTheDocument();
  });

  it("offers a way to act on the delay, instead of only reporting it", async () => {
    renderApp("/track/UDID-DEMO-4096");
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /raise this delay/i })).toBeInTheDocument()
    );
  });

  it("does not offer escalation on a case that is still on time", async () => {
    renderApp("/track/UDID-DEMO-1024");
    await waitFor(() =>
      expect(screen.getAllByText(/who has your file right now/i).length).toBeGreaterThan(0)
    );
    expect(screen.queryByRole("link", { name: /raise this delay/i })).toBeNull();
  });

  it("records the escalation on the case, naming the authority it went to", async () => {
    const user = userEvent.setup();
    renderApp("/escalate/UDID-DEMO-4096");

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /^raise this delay$/i })).toBeInTheDocument()
    );
    expect(screen.getByText(/First Appeal Officer, District Collectorate/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /raise this delay/i }));

    expect(await screen.findByRole("heading", { name: /delay raised/i })).toBeInTheDocument();
    const events = getEvents("UDID-DEMO-4096");
    const escalation = events.find((event) => event.type === "ESCALATED");
    expect(escalation).toBeDefined();
    expect(escalation?.payload?.tier).toBe("FIRST_APPEAL");
    expect(escalation?.toStage).toBeNull();
  });

  it("does not claim a penalty is owed, because that could not be verified", async () => {
    renderApp("/escalate/UDID-DEMO-4096");
    await waitFor(() =>
      expect(screen.getByText(/could not be verified/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/does not tell you a penalty is owed/i)).toBeInTheDocument();
  });
});
