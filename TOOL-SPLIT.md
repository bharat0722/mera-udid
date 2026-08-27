# Tool split

The honest record of which assistant built what. This file is the source for the
submission write-up, and accuracy matters more than looking impressive.

The hackathon brief requires the prototype to be built with Codex or powered by an
OpenAI model, with Codex "a meaningful part of how you build it", and permits other
tools "provided you have the right to use them and disclose them in your submission".
This is that disclosure.

## Summary

| | |
| --- | --- |
| **Codex (OpenAI)** | Original project scaffolding; the first citizen homepage; the Reconciliation Engine — the conceptual core — implemented last against a written contract and a failing test suite. |
| **Claude Code (Anthropic)** | Design system; data layer and synthetic data generator; event store, state machine and transition rules; all screens and journeys; reason codes and fix-and-resubmit; the specification suite and handoff brief for the reserved component. |
| **Human** | Research, evidence gathering and verification (the two companion PDFs); the build specification; all product and scope decisions; running Codex for the reserved component. |

## Built by Codex

| Component | Status |
| --- | --- |
| Vite / React / TypeScript scaffold, `package.json`, verification scripts, safety boundaries | Done — 20 August 2026 |
| First citizen homepage: hero, status lookup against three demo IDs, process overview, help note, English/Hindi toggle, synthetic-data banner | Done — 20 August 2026, since redesigned |
| **Reconciliation Engine** (`src/core/reconciliation.ts`) | **Reserved — not yet implemented** |

The engine is genuinely unbuilt. `reconcile()` and `isReconciled()` throw
`NotImplementedError`, the oversight dashboard shows a "Reserved for Codex" panel where
the report will render, and the 25-test specification suite fails. See
[CODEX-HANDOFF.md](CODEX-HANDOFF.md).

Codex's own record of what it generated is [CODEX-LOG.md](CODEX-LOG.md). Nothing has
been written into that file on Codex's behalf.

## Built by Claude Code

Everything below was written in the session of 23 August 2026, on top of the scaffold
Codex created. The stack was kept as found — no rewrite.

**Design system**
- `src/styles/tokens.css`, `base.css`, `components.css` — the token set, reset,
  typography, layout primitives and every component class.
- `src/ui/Icons.tsx` — inline SVG icons and the project mark, drawn rather than sourced.
- `STYLE.md` — the documented system, including computed contrast ratios for every
  token pair in use.
- Fixed the eight recorded UI defects in the first homepage: no layout container, the
  lopsided status section, the unstyled timeline, flat visuals, the disclaimer banner
  shouting over the headline, no visual identity, the duplicated "Not yet · Not yet
  done" copy, and inconsistent vertical spacing.

**The spine**
- `src/core/types.ts` — the domain model. No stored `currentStage`; everything derives.
- `src/core/stages.ts` — stage catalogue, owners, proposed SLA targets, transition graph.
- `src/core/reasonCodes.ts` — the structured reason-code catalogue.
- `src/core/transitions.ts` — the rules. A return or rejection without a valid reason
  code is refused, not discouraged.
- `src/core/caseStore.ts` — the append-only event store.
- `src/core/projections.ts` — current stage, clocks, breach state, the stepper model.
- `src/core/queue.ts` — queue anchors and the preserved-position rule.
- `src/core/precheck.ts` — the deterministic document sufficiency rules.
- `src/core/boardSchedule.ts` — the district medical board calendars, capacity, and the
  forecast that turns a queue position into an expected date.
- `src/core/clock.ts` — the pinned demo clock and Indian digit grouping.

**Data**
- `src/data/generator.ts` — the seeded synthetic generator: 1,416 applications and 5,411
  events across six Madhya Pradesh districts, realistic stage and timing distributions,
  the four narrative demo cases, and thirteen deliberately planted defects across twelve
  applications, each described in a manifest.
- `src/data/disabilityTypes.ts` — the 21 specified disabilities from the RPwD Act 2016.
- `src/data/evidence.ts` — every sourced real-world figure, with its citation.

**Screens**
- Home, apply (four steps, resumable, with the document pre-check), track (the status
  card, the stepper and the board forecast), the published board calendar, fix and
  resubmit, officer console, oversight dashboard, appeal, demo sign-in and the
  applicant's own dashboard, and the statutory pages GIGW requires — Help, the
  accessibility statement, the website policies and the sitemap.
- `src/core/session.ts` — the demo accounts, with credentials printed on screen and a
  one-click entry per person, as the rules require. No real authentication, and nothing
  in the app is gated behind it.
- `src/lib/router.tsx` — a hash router written by hand rather than added as a dependency.
- `src/i18n/` — English and Hindi for the whole citizen journey.

**Tests**
- `src/tests/stateMachine.test.ts`, `projections.test.ts`, `app.test.tsx`, `board.test.ts` — 83 tests
  covering the rules, the projections, the board arithmetic, sign-in and the golden path
  end to end.
- `e2e/accessibility.spec.ts` — 38 checks: axe over every screen at mobile and desktop,
  the golden path by keyboard alone, no horizontal scroll at 200% zoom, tap-target sweep.
- `src/tests/reconciliation.test.ts` — the 25-test specification for the reserved
  component. Written to fail until Codex implements it.

**Documentation**
- `STYLE.md`, `TOOL-SPLIT.md`, `CODEX-HANDOFF.md`, `PENDING.md`, `README.md`,
  `docs/rules-review.md`, `docs/standards.md`, and the entries added to
  `DECISION-LOG.md`.

## Why the split is this way round

The brief permits multiple tools with disclosure, and asks specifically what Codex
contributed. Giving Codex the reconciliation engine — the rule that makes "unaccounted
for" unreachable, and the single idea the whole project rests on — is a truthful and
specific answer to that question, and a better one than a vague claim about the whole
build. It is also the kind of work the split suits: rule-heavy, precisely specified,
and verifiable by a test suite written before the implementation.

The handoff is real. Nothing in `reconciliation.ts` has been implemented "just in case".

## What is real and what is mocked

| Mocked or synthetic | Genuinely built and working |
| --- | --- |
| Every applicant, application, document and district record | The event store and the audit trail |
| Document upload — ticking a box stands in for attaching a file | The state machine and its transition rules |
| Identity verification — never real, no Aadhaar, no biometrics | The clocks, proposed SLA targets and breach detection |
| Notifications by SMS, voice or email — none are sent | The reason-code system and the enforcement that a return or rejection carries one |
| Officer and medical-board identities | The queue-position rule, and the board calendar, capacity and expected-date forecast built on it |
| Sign-in — six invented accounts checked against a string, credentials printed on the page | The document pre-check rules |
| Any backend, database or deployment — the store is in memory | The accessibility layer and the bilingual copy |
| | The reconciliation engine — **reserved, not yet built** |

No government system is contacted, scraped or tested. No government logo is used. No
real person's data appears anywhere. Phone numbers use a leading-zero pattern that
cannot be a real Indian mobile number.
