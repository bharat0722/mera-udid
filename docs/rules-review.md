# Rules review — 23 August 2026

A pass over the project against the official "Rules & How to Participate" video, item by
item, and what changed as a result.

## Step one — what to build

| Rule | Where we stand |
| --- | --- |
| Pick from the 10 listed platforms | **We did not.** UDID is off-list. |
| Off-list picks are allowed, but odds dip if the judges have not used that platform | **This is our real risk.** |
| Exceptional work gets seen, on the list or off it | The bet we are making. |

**What changed.** A judge who has never applied for a UDID card has no personal stake in
this problem, so the homepage now says what is at stake before it says anything else: the
card is not a benefit, it is the key that unlocks every other benefit, and Maharashtra
has made it compulsory for any government benefit at all — so a stuck application is not
an inconvenience, it is total exclusion. That is a sourced fact, and it is now the first
thing after the headline.

The rest of the mitigation is unchanged and was always the plan: open on a parliamentary
answer from two weeks ago that cannot account for ten lakh applications. Nobody has to
have used the service to find that indefensible.

## Step two — a complete proof of concept

| Rule | Before | Now |
| --- | --- | --- |
| Mock the backend, end to end | Done | Unchanged — event store, state machine, 1,416 synthetic applications |
| **Make it web-accessible** | Built, never deployed | `vite.config.ts` now builds with `base: "./"`, so `dist/` runs from a domain root, a subdirectory or the filesystem. Combined with hash routing there are no rewrite rules to configure anywhere. **Still needs a live URL — see below.** |
| **Provide instant logins** | **Nothing. No accounts at all.** | Six demo accounts, credentials printed on the sign-in page, one-click entry per person, and a real form that checks what you type |
| **Prioritize the user experience** — only the consumer side is evaluated | Officer console and oversight had equal billing in the main nav | Main navigation is citizen-only. The two staff tools moved to a quieter bar labelled "Staff view — internal tools. Not part of the citizen experience." |

**The one thing still outstanding: this has to be deployed.** The rule is blunt — if it
does not open in a browser, it will not be reviewed. `pnpm build` produces a `dist/` that
can go on any static host with no configuration. That is a five-minute job and it belongs
to whoever holds the hosting account.

**On instant logins.** The sign-in is deliberately not dressed up as authentication. The
password field is `type="text"`, because masking a password printed on the same page
would be theatre, and a project whose entire argument is about honesty should not open
with a small lie. Nothing is gated behind it either — a judge who follows a deep link to
a case should never hit a wall.

**On the consumer side.** Demoting the staff tools rather than removing them is the right
trade. They are not evaluated, but the officer console is where the reason-code rule is
*provable* — the "Try returning it with no reason" button is the strongest single piece
of End-to-End Thinking evidence in the build. It stays one click away, honestly labelled.

## Step three — ideas over code

| Rule | Response |
| --- | --- |
| **Interfaces and interactions**, not plumbing | Fair challenge, and worth answering directly. Most of the engineering here *is* the idea — "every application is in exactly one stage and the numbers must reconcile" is a product thesis, not infrastructure. But the interface had drifted behind it, which is what the two changes below fix. |
| **Ship bold, useful ideas** | The bold idea — that a lost application is a state the system cannot enter — was only visible on the oversight screen, which is not evaluated. The track page now carries a **"Why this case cannot go quiet"** panel stating the four guarantees in the citizen's own terms. Every line is something the state machine enforces today; the reconciliation report is the backstop on top, not the claim itself. |
| **Build for busy citizens** | The homepage opened with an essay. Someone who has already applied did not come to read about Parliament — they came to find out where their file is. The status check now sits in the hero, above the fold, and goes straight to the answer. A signed-in applicant gets **My applications** instead: one card per case saying whether the ball is in their court or somebody else's, with no ID to remember. |
| **Skip the bells and whistles** | Already compliant. No 3D, no parallax, no decorative animation, no web fonts, no external assets. |

## What did not change, and why

- **The reconciliation engine stays unbuilt.** The rules require Codex to be a meaningful
  part of the build, and reserving the conceptual core is a more specific and more honest
  answer than a vague claim about the whole project.
- **The officer console and oversight stay in the app.** Demoted, not deleted.
- **English-only staff tools.** Still the right cut with the deadline where it is.

## The follow-up: the board calendar

The review above fixed compliance. It did not answer the harder question a reviewer
asked next: *a tracking screen is a month of work for a government vendor — what is the
big deal?*

Half of that is right. The tracking screen is not the big deal; the invariant underneath
it is, and that invariant is what is reserved for Codex. But the other half landed:
we were **showing** the delay and not **removing** it.

So the medical board calendar was built. It was designed in the original research
("treat the doctors' panel the way an airline treats seats") and had been cut as out of
scope. It is the documented root cause of the 253-day wait — the minister's own answer
in Parliament is that board scheduling depends on "the availability of doctors", which
means the single scarcest resource in the whole system is unplanned.

What it adds:

- **`#/board`** publishes every district's sitting days, capacity per sitting, weekly
  throughput, current queue depth and weeks of backlog — none of which the real service
  publishes anywhere.
- **An expected date on the citizen's own case page.** "You are 47th" becomes "the board
  sits Tuesdays, you are 10th of 64, your date is 1 September, nine days away."
- **A benchmark with a source.** Maharashtra told its district hospitals to reserve at
  least two days a week; it is the only published cadence figure this research found, so
  every district is measured against it. Jabalpur, Gwalior, Rewa and Sagar sit one day a
  week and are flagged.
- **The calendar held against reality.** Publishing a cadence is decoration unless
  somebody checks it. Each district card compares the backlog the published rate implies
  against the days finished cases actually took at that board. When the two disagree, the
  board is not sitting as published — and that is now a number someone can be asked about.

The forecast is labelled a forecast, on every screen it appears. It is arithmetic on a
published cadence, not a reservation. A wrong date can be challenged; silence cannot.

## Verified after the changes

- 75 unit and journey tests passing.
- 30 accessibility checks passing across mobile and desktop, including every new screen.
- Production build clean, 104 kB gzipped.
- The sign-in, the applicant dashboard, the hero status check and the board forecast all
  driven in a real browser.

One thing the test suite caught during this pass and is worth recording: the tests shared
a single module-level store, so a test that advanced a case silently changed the world
the next one ran in. Every test now starts from a freshly seeded dataset.
