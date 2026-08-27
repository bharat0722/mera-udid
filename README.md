# Mera UDID

A disability certificate application that behaves like a tracked case with a stage, an
owner and a clock — instead of a form that disappears.

**An independent prototype. Not an official government product. All data is synthetic.**

---

## Why

A written reply in the Rajya Sabha, reported on 12 August 2026, gave four numbers for
UDID applications received since 2021:

| | |
| --- | --- |
| Applications received since 2021 | 1,15,63,288 |
| Cards generated | 87,62,115 |
| Applications rejected | 8,24,951 |
| Applications pending | 9,63,606 |
| **Accounted for** | **1,05,50,672** |
| **In no column at all** | **10,12,616** |

An MP asked where they went. The reply did not say. The subtraction is ours; the four
numbers are the government's.

The diagnosis: the system was built as a postbox. You submit, and "sent" is the only
state there is — no stage list, no owner per stage, no clock per stage, and nothing that
checks the applications still add up. But getting a disability certificate is a
months-long adjudication passing through a district social welfare office and a district
hospital medical board. That needs a courier tracking number.

**The system does not know where an application is, so nobody can be asked why it has
not moved.**

## Run it

Needs Node 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints, usually `http://127.0.0.1:5173`.

## Verify it

```bash
pnpm test:built
```

106 tests — the state machine, the projections, the board arithmetic, the statutory
clock, sign-in, the government website conventions, and the golden path end to end.
These must all pass.

```bash
pnpm test:spec
```

25 tests — the specification for the reserved reconciliation engine. **These are
expected to fail**, every one with `NotImplementedError: reconcile() is reserved for
implementation by Codex.` That is the handoff, not a broken build. See
[CODEX-HANDOFF.md](CODEX-HANDOFF.md).

`pnpm test` runs both, so it reports 25 failures by design.

```bash
pnpm exec playwright install chromium
pnpm test:a11y
```

42 accessibility checks across mobile and desktop viewports: axe over every screen, the
golden path by keyboard alone, no horizontal scroll at 200% zoom, and a tap-target sweep.

```bash
pnpm build
```

## Sign in

Every account is invented and every password is printed on the sign-in screen, next to
a one-click button so nobody has to type. **Password for all accounts: `demo1234`.**

| Username | Who | What you will find |
| --- | --- | --- |
| `asha` | Asha Verma | An application moving normally — day 4 of a 21-day target |
| `ravi` | Ravi Kushwaha | Sent back for one document. The plain-language reason and the one-click fix |
| `meena` | Meena Ahirwar | Stuck at the medical board for 211 days against a 21-day target |
| `sunita` | Sunita Malviya | Finished — certificate issued and card generated |
| `officer` | District Social Welfare Officer | The staff queue and the reason-code enforcement |
| `oversight` | State Oversight | District numbers and the reserved reconciliation panel |

There is no real authentication and nothing pretends there is: the check is a string
comparison against the list above, held in `localStorage`. **Nothing is gated** — you
can track any application by ID signed out, because a judge following a deep link
should never hit a wall.

## Deploy it

The build is a static site with hash routing, so it needs no server rewrites and works
from a domain root, a subdirectory, or straight off the filesystem.

```bash
pnpm build
```

Then drop `dist/` on any static host. With Vercel:

```bash
npx vercel deploy --prebuilt dist
```

No environment variables, no backend, no build-time configuration.

## The demo walkthrough

Everything below works. There are no dead buttons and no placeholder screens.

**0 — Sign in, or don't.** `#/signin` gives you one-click entry as any of the six demo
people. Everything below also works signed out.

**1 — The service, then the case.** The homepage is a task-first service homepage: what
this is, the five things people come to do, a status check, the journey with its
targets, and the service's promises. In the hero, a real case from the seeded dataset:
`UDID-DEMO-4096`, sitting at the medical board for 211 days against a 21-day target.
The argument for the service — the four parliamentary figures, the subtraction, the
10,12,616 in no column, the postbox diagnosis — lives at `#/about`, one click away.
Open the demo there.

**2 — Apply, and catch the problem before submitting.** `#/apply`. Fill in the details,
pick a condition, and stop at step 3. The document pre-check names exactly what is
missing and why it is on the list for that category — before submission, not three
months after. Notice the identity question: fingerprints are one option, not the only
one, and assisted application is offered openly with consent recorded.

**3 — Track.** `#/track/UDID-DEMO-1024`. Who has the file is the largest thing on the
page. Days at that desk sits beside the proposed target and turns red on breach. The
stepper shows the whole road, with the current step unmistakable.

**3b — A date, not a queue position.** Still on that page: **Your medical board date**.
The board is the one step nobody can skip, and today nothing about it is published —
not when it sits, not how many people it can see, not how long the queue is. The
minister's own answer in Parliament was that it depends on "the availability of
doctors". Here it says: 10th of 64 in the Jabalpur queue, the board sits Tuesdays, your
date is 1 September. `#/board` publishes every district's calendar, capacity and
backlog, and holds each one against the only published benchmark that exists —
Maharashtra told its district hospitals to reserve two days a week. Jabalpur sits one.

Try `#/track/UDID-DEMO-4096`: someone who has waited 211 days with no information at
all, who can now see exactly when they will be seen.

**3c — A deadline the law already gave you.** The Rights of Persons with Disabilities
Rules, 2017 (rule 18, as amended October 2024) give the certifying authority **three
months** to issue a certificate and card. The current service does not count that limit,
does not show it, and does not act on it. Here it is on the case page: Meena's
application is **157 days past the legal limit** — and there is a button. **Raise this
delay** sends it to a named authority, records it on the case with a date, and flags it
in the officer queue. The clock stops being an observation and starts being a lever.

**4 — A return, in plain language.** `#/track/UDID-DEMO-2048`. The case has been sent
back. The reason is a sentence, not a code; the exact fix is one action; and the screen
says explicitly that the place in the queue is protected, because the fault was
administrative. Follow "Fix this and resubmit" — one checkbox, one button, nothing
re-entered — and the case returns to the desk that sent it.

**5 — The rule is enforced, not requested.** `#/officer`. Choose a case. The "Return to
the applicant" and "Reject" buttons stay disabled until a structured reason code is
picked, and the panel previews exactly what the applicant will see. Then press **"Try
returning it with no reason"** — that button deliberately bypasses the UI and calls the
state machine directly. It comes back refused:
`REASON_CODE_REQUIRED: Moving a case to RETURNED_FOR_DOCUMENT requires a structured
reason code.` The rule lives in the system, not in a policy document.

Also on this screen: there is no 40% disability threshold anywhere in the codebase. A
Karnataka Health Commissioner's circular of 31 July 2024 had to order hospitals to stop
refusing cards below 40%, because the RPwD Act imposes no such condition. A case
assessed below 40 proceeds to certificate issue like any other, and a test asserts it.

**6 — What a dashboard cannot see.** `#/admin`. The oversight screen counts 1,410 of the
1,416 applications in the register, and says so in plain words: six cannot be placed in
any stage, so every chart above silently leaves them out. That is the same shape as the
real defect. Below it, the reconciliation panel — reserved for Codex, wired to the real
function, showing the reserved state until the engine lands.

Try `#/track/UDID-ORPH-1000` to see one of those cases from the citizen's side: the
prototype says it cannot tell you where the application is, rather than inventing a
plausible status.

## Demo application IDs

| ID | Story |
| --- | --- |
| `UDID-DEMO-1024` | Healthy and in progress — day 4 of a 21-day target at the medical board |
| `UDID-DEMO-2048` | Returned for a fixable, administrative reason, queue place protected |
| `UDID-DEMO-4096` | Long breached — 211 days at the medical board, now with a published date |
| `UDID-DEMO-8192` | Completed, card generated |
| `UDID-ORPH-1000` | A planted orphan — in no stage at all |

## Built to the government's own guidance

This follows [UX4G](https://www.ux4g.gov.in/), the Government of India's design system,
and [GIGW 3.0](https://guidelines.india.gov.in/), the Guidelines for Indian Government
Websites — the homepage task pattern, the statutory pages, the footer structure, a named
content owner, a sitemap, and content in more than one language.

Three of the four compliance areas UX4G names turned out to be the load-bearing ideas of
this build, arrived at from the evidence before the design system was read:

| UX4G compliance area | Where it lives here |
| --- | --- |
| Right to Service Act **SLA accountability** | A named owner and a running clock on every stage |
| DPDP Act 2023 **consent flows** | Assisted mode records who helped and that you consented |
| DARPG **grievance guidelines** | Structured reason codes, plain-language explanations, and an appeal under RPwD s.59 |
| **GIGW 3.0 accessibility** | WCAG 2.2 AA, one version ahead of the required 2.1 AA, verified on every build |

**Patterns, not identity.** UX4G is an open design system — using its patterns is what
it is published for, and design style is not impersonation. What the rules forbid is the
identity layer: emblems, logos, official names, look-alike domains. This prototype uses
none of them, and says what it is where the rules require it — the footer of every page
and the opening paragraph of every statutory page — while the interface itself speaks in
the product's own voice. Honesty is a scored criterion, and GIGW itself requires a named
content owner.

Full detail, including what this prototype does **not** claim, is in
[docs/standards.md](docs/standards.md).

## How it is built

An event-sourced case store with three faces onto it: the citizen app, the officer
console, and the oversight dashboard.

```
                    ┌─────────────────────────┐
                    │   Case store (events)   │
                    │   append-only log       │
                    └───────────┬─────────────┘
        ┌───────────────────────┼───────────────────────┐
┌───────▼────────┐   ┌──────────▼─────────┐   ┌─────────▼──────────┐
│  Citizen app   │   │  Officer console   │   │  Oversight         │
│  apply, track  │   │  act on a case     │   │  reconciliation    │
└────────────────┘   └────────────────────┘   └────────────────────┘
```

Every change is an appended event with an actor, a timestamp and a reason. Current
stage, days in stage, breach status, the timeline and the reconciliation report are all
derived — there is no stored status column that could disagree with the history.

Vite, React 19, TypeScript, plain CSS. No UI framework, no router library, no web fonts,
no external assets. 123 kB gzipped.

| Path | What is in it |
| --- | --- |
| `src/core/` | Types, stages, reason codes, transitions, the event store, projections, the queue rule, the pre-check, and the reserved reconciliation stub |
| `src/data/` | The seeded synthetic generator, the RPwD Act category list, and every sourced real-world figure with its citation |
| `src/screens/` | Home, apply, track, fix, appeal, officer console, oversight |
| `src/ui/` | The stepper, the status card, chips, icons, layout |
| `src/tests/`, `e2e/` | Unit, journey and accessibility suites |

## Documentation

- [STYLE.md](STYLE.md) — the design system, with computed contrast ratios
- [docs/standards.md](docs/standards.md) — how this follows UX4G and GIGW 3.0, and what it does not claim
- [TOOL-SPLIT.md](TOOL-SPLIT.md) — which assistant built what, honestly
- [CODEX-HANDOFF.md](CODEX-HANDOFF.md) — the brief for the reserved component
- [DECISION-LOG.md](DECISION-LOG.md) — every meaningful decision and why
- [PENDING.md](PENDING.md) — everything designed but not built, and known limitations
- [CODEX-LOG.md](CODEX-LOG.md) — what Codex generated

## Safety boundaries

- Every person, application, document, district record and status in this project is
  invented. No real personal data, no real health data, no Aadhaar-format identifier.
  Phone numbers use a leading-zero pattern that cannot be a real Indian mobile number.
- This project does not call, scrape, probe or test `swavlambancard.gov.in` or any other
  live government system, and contains no code that could.
- It uses no government logos and does not represent the Government of India.
- Terminology: "persons with disabilities" or "PwD" throughout, in English and Hindi.
  Never "Divyang" (a term much of the disability community has publicly rejected),
  never "handicapped", never "differently abled". A test asserts the Hindi copy is free
  of it.

## Sources

Every real-world figure in the interface is in `src/data/evidence.ts` with its citation.

- Rajya Sabha written reply, reported 12 August 2026 (Salar News) — the four figures and
  the 10,12,616 gap
- Free Press Journal, 16 August 2026 — the 253-day Madhya Pradesh average, state-wise
  waits, and the minister's statement on medical board scheduling
- ThePrint ground report — fingerprint exclusion, awareness estimates, case timelines
- Deccan Herald — the Karnataka circular of 31 July 2024 on wrongful denials below 40%
- Google Play listing for the official UDID app — the April 2026 review on rejections
  arriving with no explanation
- NewsOnAir, 9 December 2025 — the Maharashtra mandate
