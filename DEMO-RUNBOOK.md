# Mera UDID — 4-minute judge walkthrough

Open the local service at `http://127.0.0.1:5173/#/`.

## 0:00–0:30 — The promise

Start on the homepage. Say: “A disability-certificate application should be a tracked case, not a form that vanishes. Here, every case has a stage, owner and clock.” Point out the two clear citizen actions and the status lookup directly beneath them.

## 0:30–1:30 — The citizen truth

Open `#/track/UDID-DEMO-4096`.

Say: “This case has been at the medical board for 211 days against a 21-day proposed target. The applicant can see the responsible office, the clock, the statutory delay position and an escalation route—not merely ‘pending’.”

Optional recovery proof: open `#/track/UDID-DEMO-2048` and show the named return reason, exact document and one action to fix it.

## 1:30–2:20 — The staff rule

Open `#/officer` or use the staff demo account on `#/signin` (`officer` / `demo1234`).

Select a case that can be returned and use **Try returning it with no reason**. Say: “The interface prevents it, and the state machine prevents it too. A person is never returned or rejected without a reason code that becomes a plain-language remedy.”

## 2:20–2:50 — Capacity, not vague waiting

Open `#/board`. Say: “The medical board is treated as a published capacity and calendar problem. The system exposes sitting days, queue depth and a forecast rather than hiding a wait behind ‘under process’.”

## 2:50–3:45 — The differentiator

Open `#/admin` or sign in with `oversight` / `demo1234`.

Say: “Here is the control total: 1,416 received, 1,408 accounted for and a gap of 8. These eight are not silently omitted. They are named with their exact event-log problem. The engine also records anomalies without pretending they are normal cases.”

Finish: “That is the rule this product adds: every application is either in exactly one modelled stage or is explicitly named as an exception. Nobody disappears into a no-column state.”

## 3:45–4:00 — Credibility close

Say: “This is an independent prototype using synthetic data. It does not claim Aadhaar, OTP or government-system integration. What is real here is the interaction model, the state-machine enforcement, the event log, the reconciliation rule and the accessibility-tested interface.”

## Before judges arrive

- Start the app with `start-server.bat` or `pnpm dev`.
- Open `#/` in a fresh window and keep `#/admin` ready in a second tab.
- Do not refresh after submitting a new mock application; new submissions are intentionally session-only.
- If a live interaction goes wrong, continue with the stable routes above. Never fabricate a result.
