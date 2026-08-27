# Pending

Everything designed, implied by the research, or deliberately cut — recorded here so
nothing is silently dropped. This file is the "known limitations" section of the
submission.

## Reserved, not cut

- **The Reconciliation Engine.** `src/core/reconciliation.ts` throws
  `NotImplementedError`, the oversight panel shows a reserved state, and 25 tests fail
  by design. This is the Codex handoff, not an omission. See
  [CODEX-HANDOFF.md](CODEX-HANDOFF.md).

## Explicitly out of scope for this build

These were designed in the research and deliberately deferred.

- Legacy paper-certificate matching. No fuzzy name or date matching, no confidence
  scores, no reviewer workflow.
- Any document reading. The pre-check is fixed rules over a checklist, not OCR and not a
  model looking at files. This is a deliberate limit, not a missing feature — a
  deterministic rule can be shown to a citizen as a promise, and a probabilistic reading
  cannot.
- Real authentication. The demo sign-in checks a username and password against a fixed
  list of invented accounts and stores the choice in `localStorage`. There is no account
  creation, no password storage worth the name, no session expiry and no server. It
  exists because the rules ask for working test credentials, and it says so on screen.
- Any real integration, API or government endpoint.
- Payments, and notification by real SMS, voice or email.
- Native mobile apps.
- Languages beyond English and Hindi.

## Cut during the build, with the reason

- **Hindi for the officer console and the oversight dashboard.** The citizen journey —
  home, apply, track, fix, appeal — is fully bilingual. The two internal tools are
  English only. Untranslated strings machine-translated and unchecked would be worse
  than none, and the brief's cut order puts Hindi coverage beyond the core journey last.
- **Appeal outcomes.** An appeal is recorded as an event and appears on the timeline,
  which closes the loop visibly. What a reviewing officer then does with it — uphold,
  dismiss, send back for re-assessment — is not modelled, so `REJECTED` stays terminal.
- **Non-reconciliation charts on the oversight dashboard.** Counts by stage, by
  district, median days to card, and breach counts are there. Trends over time,
  per-officer throughput and district comparisons against each other are not.
- **Withdraw and merge from the UI.** Both stages exist in the state machine, are
  enforced (a merge must name the surviving application), and appear in the seeded data.
  Neither has a screen; an officer cannot trigger them from the console.

## Known limitations of what is built

- **The store is in memory.** Every change made during a demo — advancing a case,
  returning it, resubmitting, appealing — is real, appears immediately on every screen,
  and is written to the append-only event log. A page reload throws all of it away and
  re-seeds. There is no backend and no persistence, and the apply flow's draft is the
  only thing that survives a reload (in `localStorage`).
- **The clock is pinned.** "Now" is 23 August 2026, 09:00 IST, fixed in
  `src/core/clock.ts`. The dataset is generated backwards from it so the demo and the
  tests describe the same world on any day they are run. Real elapsed time does nothing.
- **SLA targets are proposals, not policy.** The 1/7/21/1/7/3-day targets and the 40-day
  total are this prototype's suggestion. The real service publishes no processing-time
  targets — that absence is itself part of the argument — and every screen that shows a
  target labels it as proposed.
- **The document checklist is a proposal too.** Which documents each of the 21 RPwD
  categories requires is our rule set, not a published national checklist. The pre-check
  screen says so.
- **Queue position is per district and stage.** It reflects the order of arrival at that
  desk, adjusted for preserved positions.
- **The board date is a forecast, not a booking.** It is arithmetic on a published
  cadence — sitting days times slots per sitting against the queue depth — and the screen
  says so. Nothing reserves a slot, nobody is notified, and a board that does not sit as
  published makes the forecast wrong. What it buys is that a wrong date can be
  challenged; silence cannot.
- **Board capacity is fixed per district.** No holidays, no absent specialists, no
  variable panel size, and no re-planning when a sitting is missed.
- **The officer queue shows 25 rows at a time.** The counts above the table are over the
  whole filtered set; the note under the table says what is not shown. There is no
  pagination beyond the first page.
- **Assisted mode records consent; it does not verify it.** The name, relationship and a
  consent timestamp are stored on the case and shown on the track screen. Nothing checks
  that consent was actually given — that is a real-world process problem, not one this
  prototype can solve.
- **The bundle is 117 kB gzipped.** Small enough for a slow connection, but most of it is
  React. A version built for the lowest-end device would not use a framework at all.
- **No dark mode**, by choice — see [STYLE.md](STYLE.md).
- **Not GIGW-certified.** The prototype follows the GIGW 3.0 structure and exceeds its
  accessibility requirement, but GIGW conformance is assessed by STQC-empanelled auditors
  against the full conformity matrix. Nobody has audited this. See
  [docs/standards.md](docs/standards.md).
- **No UX4G code is used.** The design system was read for its guidance; every component
  here is written from scratch against the tokens in STYLE.md.
- **Not yet deployed.** The build is a static site with hash routing, so it needs no
  server rewrites and will run from any static host — but a live URL has to be published
  before submission. The rules are explicit that a prototype which does not open in a
  browser will not be reviewed.

## Research findings not yet acted on

From the evidence dossier, worth naming because they are real and this build does not
address them:

- Awareness. Roughly 90% of people are estimated not to know an online disability
  certificate exists, and around 60% not to know about UDID at all — an experienced
  field activist's estimate, not survey data. Nothing in a web prototype reaches someone
  who does not know the service exists.
- The 70% of persons with disabilities who live in rural India, with limited internet and
  no easy way to reach a district office. Assisted mode helps a little; a genuine answer
  is offline and human.
- Applying by voice, for someone who cannot use a keyboard at all.
- No first-person accounts from people who have been through the UDID process appear in
  this build. The brief asks for a problem you have faced; this is not one, and the
  honest close is to say so and to put real applicants in the demo video instead of
  inventing a story.
