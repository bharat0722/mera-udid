# Codex handoff — the Reconciliation Engine

This is the brief for the one component of Mera UDID that is deliberately unbuilt.
Everything else in the project is finished and tested. This is not.

## Why this component and not another

The project exists because of one fact. A written reply in the Rajya Sabha, reported on
12 August 2026, gave four numbers for UDID applications received since 2021:

| | |
| --- | --- |
| Applications received since 2021 | 1,15,63,288 |
| Cards generated | 87,62,115 |
| Applications rejected | 8,24,951 |
| Applications pending | 9,63,606 |
| **Accounted for** | **1,05,50,672** |
| **In no column at all** | **10,12,616** |

An MP asked where those went. The reply did not say.

The reconciliation engine is the rule that makes that state unreachable: every
application is in exactly one modelled stage, the stage counts sum to the total
received, and anything that cannot be placed is *named* rather than dropped. That rule
is the conceptual core of the whole build, which is why it is the piece reserved for
Codex rather than a peripheral one.

## What to build

One file: **`src/core/reconciliation.ts`**.

It currently exports the full type surface plus two functions that throw
`NotImplementedError`:

```ts
reconcile(applications, events, options?): ReconciliationReport
isReconciled(applications, events): boolean
```

Replace the two throwing bodies with real implementations. **Do not change the exported
types, the function signatures, or any other file** — the UI and the tests are already
wired to this contract.

The complete written contract is the header comment of that file. Read it first; it is
the specification, and this document is the orientation around it.

## Files

| File | What to do with it |
| --- | --- |
| `src/core/reconciliation.ts` | **Implement.** The only file you need to change. |
| `src/tests/reconciliation.test.ts` | **Read, do not edit.** 25 tests that define "done". |
| `src/core/types.ts` | `Application`, `CaseEvent`, `StageKey`. |
| `src/core/stages.ts` | `ALL_STAGE_KEYS`, `ALLOWED_TRANSITIONS`, `requiresReasonCode`, `isStageKey`. |
| `src/core/reasonCodes.ts` | `isReasonCodeKey` — for validating a recorded reason. |
| `src/core/projections.ts` | `stageEvents`, `deriveCurrentStage` — useful, but see the warning below. |
| `src/core/clock.ts` | `DEMO_NOW` — the default for `options.asOf`. |
| `src/data/generator.ts` | Where the planted defects come from, and what each one is. |
| `src/screens/AdminScreen.tsx` | The panel that renders the report. Already wired; no change needed. |

## How to run it

```bash
pnpm install
pnpm test:spec
```

That runs only this suite. All 25 tests currently fail with
`NotImplementedError: reconcile() is reserved for implementation by Codex.` — if any
test fails with a different message before you have written a line, the test itself has
broken and that needs fixing first.

To check you have not broken anything else:

```bash
pnpm test:built
```

That is the rest of the project — 106 tests — and it must stay green.

## What the engine has to detect

Six things, all present in the seeded dataset:

| Detection | Where it lands | Count in the seed |
| --- | --- | --- |
| `NO_STAGE_EVENTS` — an application with an empty event log | `orphans` | 4 |
| `UNKNOWN_STAGE` — latest event names a stage this system does not model | `orphans` | 2 |
| `CONTRADICTORY_HISTORY` — the log puts one application in two active stages at once | `orphans` | 2 |
| `MISSING_REASON_CODE` — a return or rejection with no valid reason code | `anomalies` | 2 |
| `UNREACHABLE_TRANSITION` — a move that `ALLOWED_TRANSITIONS` does not permit | `anomalies` | 2 |
| `EVENT_WITHOUT_APPLICATION` — events for an ID that is not in the register | `anomalies` | 1 |

The distinction that matters: an **orphan** cannot be placed in a stage at all, so it is
excluded from `countsByStage` and shows up in the gap. An **anomaly** is a defect in an
application's history that can still be placed, so it is counted *and* reported. An
application is never both.

On the full seeded dataset that means 8 orphans, a gap of 8, and `isBalanced === false`.

### The trap worth naming

`deriveCurrentStage()` in `projections.ts` sorts stage events by timestamp and takes the
last one. On a `CONTRADICTORY_HISTORY` case — two stage events sharing the newest
timestamp with different `toStage` values — it returns one of them and looks perfectly
happy. **If you build `reconcile()` on top of it, two planted orphans will pass straight
through as ordinary cases and the report will balance when it should not.**

That is not an accident in the seed data; it is the whole point. A projection that
quietly picks a winner is exactly the behaviour that let ten lakh applications sit in no
column while a dashboard elsewhere looked fine. The engine has to look at the event log
directly and refuse to choose.

## Where the planted defects come from

`buildPlantedDefects()` in `src/data/generator.ts` writes them as raw event objects,
deliberately bypassing the state machine — which is how they would arise in reality: a
legacy import, a direct database edit, a migration that predates the rules. They are
unreachable through the UI. The generator returns a manifest describing each one, and
the oversight screen lists it under "What the seeded dataset contains", clearly labelled
as the generator describing itself rather than a report.

The generator is seeded (`mulberry32`, fixed seed), so the dataset is identical on every
run and the counts above are stable.

## Done means

1. `pnpm test:spec` — 25 passing.
2. `pnpm test:built` — 106 passing, unchanged.
3. `pnpm build` — clean.
4. Open `#/admin`. The panel that reads "Reserved for Codex — not yet implemented" now
   shows the report: 1416 received, 1408 accounted for, a gap of 8, and the eight
   orphans named in a table. No other file changed.

The line that goes with the demo:

> In the real system, ten lakh applications from disabled citizens disappeared between
> two columns of a government spreadsheet, and nobody could say where they went. In
> ours, that is not a bug you fix. It is a state the system cannot enter.

## Rules

- Pure function. No I/O, no clock read beyond `options.asOf`, no mutation of either
  argument. The suite checks all three.
- Deterministic. Same inputs, same report — including ordering. Orphans and anomalies
  sort by `applicationId`.
- Order-independent. The suite passes the event log in reverse and expects the same
  answer.
- Never silently omit an application. If it cannot be classified, it appears in
  `orphans` with a stated reason. Absence of evidence is never evidence of absence.

Record what you built in `CODEX-LOG.md`, and add a `DECISION-LOG.md` entry for any
judgement call the contract left open.
