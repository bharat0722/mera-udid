# Mera UDID - Government Service UX Audit

**Date:** 25 August 2026  
**Scope:** UX/UI, information architecture, accessibility, service design, front-end architecture, and production-readiness review.  
**Method:** direct review of the local running app (home, case tracking and oversight); 360 px mobile inspection; source and test review; the two supplied UDID research PDFs; and comparison with current official GIGW, UX4G, India Portal, DigiLocker and UMANG guidance/examples.

## Executive conclusion

Mera UDID already has the *soul* of a modern Indian public service more than it has the skin of a conventional government website. It is task-led, accountable, bilingual, explicit about accessibility, and unusually honest about what is a prototype. Most importantly, it turns a citizen's question - "Where is my file, who owns it, and what can I do?" - into the centre of the product.

That is a much better direction than copying the visual clutter of legacy portals. Do **not** make it look older merely to make it look governmental. The target should be **UX4G-style government clarity with restrained Apple-like refinement**: fewer decisions per screen, quiet visual hierarchy, predictable controls, and no decorative complexity.

### Scores

| Dimension | Score | Meaning |
| --- | ---: | --- |
| Government-service soul | **78 / 100** | Strong citizen-task structure and accountability; gaps are language reach, field support and production trust. |
| UI clarity and visual finish | **76 / 100** | Calm palette, good hierarchy and readable cards; mobile chrome is too tall and dense. |
| Inclusive design intent | **82 / 100** | Strong implementation intent: skip link, keyboard focus, text-size controls, contrast control, Hindi, structured errors and assisted use. |
| Mobile/Tier 2-4 suitability | **58 / 100** | Good language and touch-target intent, but one real horizontal-overflow defect plus a very tall mobile header and no low-bandwidth/offline/help-channel plan. |
| Government compliance readiness | **68 / 100** | Many GIGW structural conventions are present, but no formal compliance, content lifecycle or security operation exists. |
| Production service readiness | **34 / 100** | Correct domain model for a real system, but data, auth, roles, persistence, integrations, security operations and support channels are prototype-only. |

The 78% is not a claim of GIGW certification. It is a design-fit score based on the weighted public-service behaviours below.

## The public-service benchmark

It is neither possible nor useful to review every Indian government domain: the estate is enormous, changes continuously, and quality varies widely. This audit uses the standards that govern that estate plus representative, high-traffic services:

| Reference | What it contributes to the benchmark | Mera UDID result |
| --- | --- | --- |
| **GIGW 3.0** | Whole-lifecycle quality, accessibility, cyber security, ownership, policies and certification expectations. | Strong structural start; incomplete production governance/security. |
| **UX4G Design System 3.0** | Reusable citizen-service components/patterns, accessibility, SLA accountability, consent and grievance concepts. | Service model aligns exceptionally well; UI is bespoke rather than a governed UX4G implementation. |
| **India Portal** | Accessibility toolbar, search/discovery, content ownership, review dates, directories, help and feedback conventions. | Matches toolbar, footer/legal structure and ownership/date; lacks service-wide search, feedback and contact/help escalation. |
| **DigiLocker** | Consent-led document exchange, activity history, language reach, printable records and trust/security signals. | Event/audit trail and assisted-consent approach are aligned; no real consent ledger, document exchange, print/share or security architecture yet. |
| **UMANG** | One clear citizen gateway across services and simple service discovery. | Five task cards are a strong local equivalent; no cross-channel/onboarding support yet. |

## What already feels genuinely government-service grade

### 1. The information architecture is right

The homepage starts with the five actual citizen jobs: apply, track, find the board date, see applications, and get help. This is the correct public-service pattern: organise by tasks, not departmental org charts. It is closer to UX4G and India Portal service discovery than to the usual ministry website.

The home page gives two clear primary actions, then a task grid, then a status lookup. This is excellent. A returning applicant can track immediately without being forced through sign-in; a new applicant can start without reading an essay first.

### 2. It makes accountability visible instead of decorative

The stage model, named office holder, target clock, board forecast, queue position, structured return reason, appeal path and escalation action are the core service design achievement. They directly answer the problems documented in the research PDFs: silent status, no named holder, no schedule, unexplained rejection and no action when a deadline passes.

This is not merely a UI resemblance to government services. It is a better underlying case-management architecture than most citizen portals expose.

### 3. The reconciliation report is a rare oversight feature

The oversight dashboard shows received, accounted-for and gap counts, then names the eight orphaned applications. That correctly implements the research's central requirement: a case must never silently disappear between reporting columns.

### 4. Accessibility is woven through the design

Evidence found in the interface and code:

- skip-to-content link and route-change focus management;
- visible 3 px focus treatment, keyboard-reachable table scroll regions and polite live status updates;
- 44 px minimum interaction target token;
- text-size and high-contrast controls stored before first paint;
- Hindi UI switch and Devanagari-specific line-height handling;
- structured, plain-language reasons and an officer-attested identity route;
- an assisted-application path with recorded consent;
- reduced-motion support.

These choices are highly aligned with the disability-specific research. They should remain non-negotiable.

### 5. It uses government cues without pretending to be government

The navy header, one saffron keyline, task cards, formal footer, accessibility controls, website policies, sitemap, content owner and last-reviewed date all signal Indian public-service familiarity. The no-emblem/no-logo rule and conspicuous synthetic-data disclaimer are correct for a hackathon prototype. Do not add the national emblem, a ministry logo, or a tricolour motif without legal authority.

## Research-PDF traceability

| Research recommendation/problem | Current status | Audit finding |
| --- | --- | --- |
| Named stage, owner and clock | **Implemented** | One of the strongest parts of the product. |
| Reconciliation so cases cannot vanish | **Implemented** | Real report shows 1,416 received, 1,408 accounted for, and 8 named orphans. |
| Board schedule, capacity, queue and expected date | **Implemented as demo model** | Strong citizen experience; real deployment needs a hospital scheduling integration and uncertainty/fallback rules. |
| Rejection/return with reason and fix action | **Implemented** | Structured reason codes are superior to free text; retain this rule at API level. |
| Accessibility and an alternative to fingerprint-only access | **Implemented in prototype** | Good UX; a real programme still needs an authenticated accessibility/assisted-service policy and field process. |
| Legacy-paper certificate matching | **Not implemented** | The research calls for assisted matching and human review. There is no matching workflow, confidence view or review queue. |
| Public district dashboard | **Implemented as synthetic data** | Good oversight design; real data needs publication governance, suppression rules and data-quality ownership. |
| Voice-first application and multilingual explanations | **Not implemented** | Only English/Hindi UI is present; no voice, IVR, SMS, WhatsApp, regional-language or low-literacy flow. |
| AI document pre-check/explanation/matching | **Partly represented, not AI-backed** | The document check is rules-based, which is safer for a demo. Do not claim AI until there is a reviewed, consented and auditable implementation. |

## Findings and recommendations

### P0 - fix before any public demo or judging on a phone

#### 1. Mobile horizontal overflow

At a 360 px viewport, the homepage has document-level horizontal overflow (about 17 px in the audited browser). This is visible as a horizontal scrollbar. It fails the basic expectation that a citizen should never have to pan a page sideways.

**Likely cause:** a child/card in the journey/table region exceeds the mobile content width. The table itself is correctly inside a horizontally scrollable `TableScroll` region, but a surrounding box is still wider than the viewport.

**Acceptance criterion:** at 320, 360, 375 and 640 CSS px, `document.documentElement.scrollWidth <= clientWidth + 1` on every route and at 200% zoom. The *table region* may scroll internally; the page must not.

#### 2. Mobile chrome hides the task

At 360 px the accessibility controls, five navigation links, sign-in button and staff bar consume most of the first screen before the citizen reaches the page content. The controls are individually good, but the composition is not.

**Recommendation:** keep the accessibility feature, but make the toolbar compact on mobile: an "Accessibility" button opens a small panel with text size/contrast; keep language as the only always-visible top control. Replace the five-link header with a clear menu button and keep the primary action prominent. Hide the staff bar unless the user is in a staff role; it should not appear in the unauthenticated citizen journey.

**Acceptance criterion:** at 360 px, the page heading and the primary task/action must appear within the first viewport without scrolling.

### P1 - highest-value service improvements

#### 3. Design for assisted, intermittent and low-literacy use

The product recognises assisted use, but not yet the full service ecosystem around it.

Add:

1. A persistent, human support route: district help number, operating hours, escalation contact and "visit a Common Service Centre / district office" alternative.
2. A printable/downloadable acknowledgement receipt after application, with application ID, next expected step, date and QR/barcode.
3. SMS and IVR/voice notification preferences, with no sensitive medical detail in message bodies.
4. Save-and-resume with a visible "last saved" status; recoverable drafts; a low-bandwidth/low-data mode.
5. A short illustrated "What you need before you start" checklist. Use images only with quality alt text and never as the sole instruction.
6. Regional language rollout based on state/district deployment, not just English/Hindi. Hindi is valuable, but it is not a national accessibility solution.

#### 4. Make "proposed" comprehensible without weakening honesty

The product correctly labels targets as proposed. Repeating that explanation in many places creates cognitive friction for a citizen who only wants to know their next step.

Use a single, persistent explanation near the first target: **"This is Mera UDID's proposed service target, not a government guarantee."** Thereafter label columns simply **"Target time"** with a small info control. Keep the full legal/prototype explanation in Help and the footer.

#### 5. Add trustworthy service-status and recovery states

The research identifies unreliable portals and lost records. A production service needs explicit states for:

- scheduled maintenance/outage, including what the citizen can still do;
- delayed upstream verification;
- document-upload failure and retry without duplicate application creation;
- "we cannot find this record" with a humane assisted recovery path;
- payment-free declaration (if there is no fee) and fraud warning;
- a visible service-status page and incident history for public accountability.

### P1 - production architecture and trust gaps

#### 6. The product model is strong; its persistence/security model is intentionally not production-ready

The front end is a React/Vite hash-routed single-page app with a module-level in-memory event store seeded from synthetic data. Demo session and accessibility preferences use local storage. This is an honest and appropriate hackathon architecture, but it cannot become a citizen service unchanged.

Before any real data:

- replace in-memory storage with an encrypted, backed-up case system and append-only audit store;
- enforce role-based access control on the server, not just via routes or interface visibility;
- add real authentication that is accessible and has a non-biometric alternative;
- create a consent ledger for assisted users, document sharing and cross-department access;
- use API gateways, rate limits, input validation, malware scanning for uploads, encryption in transit/at rest, key management and security monitoring;
- publish retention, deletion, correction, grievance and breach-response rules;
- integrate document retrieval/sharing through consented mechanisms such as DigiLocker only after legal and departmental approval;
- establish data-quality ownership and incident escalation for reconciliation gaps.

The current comment-level honesty about demo authentication is excellent. Preserve that discipline: never add "official-looking" login or Aadhaar language until the actual security/legal model exists.

#### 7. Separate citizen, operator and oversight surfaces more firmly

The code labels staff tools as internal, but unauthenticated visitors still see staff navigation. On a real service that creates both confusion and an implied access-control weakness.

Use three deliberate surfaces:

| Surface | Audience | Navigation rule |
| --- | --- | --- |
| Citizen | applicant/family/helper | Apply, track, board appointment, help, language/accessibility, sign in. |
| Assisted-service/frontline | CSC/officer helping a citizen | Dedicated assisted flow, consent capture, clear handover and no unnecessary clinical data. |
| Staff/oversight | authorised officials | Separate authenticated portal/domain or clearly gated application, purpose-limited data and audit log. |

### P2 - visual-system refinements

#### 8. Keep the navy/saffron system; simplify its hierarchy

The palette is already appropriate: navy establishes institutional seriousness, blue carries action, saffron is a restrained signal, and green means success. Keep that. Avoid gradients, glassmorphism, large decorative photography, animated counters and dense dashboards; none improve a citizen's ability to finish a certificate request.

Refine:

- make one visual element the primary focal point per screen;
- reduce card-within-card nesting on long pages;
- use a quieter border/surface treatment for reference material, reserving strong cards for action or risk;
- keep status text explicit; never let red/green be the only carrier of meaning;
- replace the current generic tick-mark brand symbol with a distinctive, authorised-free service mark that reads at 24 px and has a text equivalent.

#### 9. Apply Apple principles as restraint, not as imitation

The missing Apple-design-system repository cannot yet be audited. When supplied, use it only as a refinement lens:

- progressive disclosure: reveal details after the citizen knows their current status and next action;
- deliberate spacing and a clear primary action;
- direct manipulation and immediate feedback for forms;
- restrained motion with `prefers-reduced-motion` fallback;
- excellent typography and readable error recovery.

Do **not** transplant Apple visual identity, SF symbols, iOS-style controls or a sparse "premium app" aesthetic into a government service. UX4G/GIGW, field usability and Indian language needs remain the governing system.

## Architecture assessment

| Area | What is strong | What is missing for government deployment |
| --- | --- | --- |
| Domain model | Event-sourced stage history; explicit legal transitions; structured reasons; reconciliation. | Event-store durability, versioning, correction workflow, evidence retention and data migration. |
| Citizen UX | Task-led discovery, track-without-login, clear next action and meaningful empty/error states. | Offline/fallback channel, contact centre, language breadth, print/SMS/voice and real onboarding. |
| Accessibility | Semantic landmarks, focus handling, tables, contrast/text controls, Hindi and reduced motion. | Real-device/assistive-technology validation, accessibility statement process, regional language QA and remediation SLAs. |
| Staff operations | Queue, board schedule, escalation and oversight concepts. | Server-authorised RBAC, segregation of duties, audit-review process, caseload controls and reporting governance. |
| Privacy/security | Explicit synthetic-data disclaimer; avoids pretending to be official. | DPDP-aligned data inventory/consent/retention, secure upload, threat modelling, pen test, CERT-In/STQC operational controls. |

## Verification notes

- Manual local review covered the desktop and 360 px mobile home page, a tracked case, and the oversight report.
- The app's automated accessibility suite contains good intended coverage: serious/critical axe rules on 16 routes, keyboard journey, focus visibility, 200% overflow, target size and document language. It could **not** run in this environment because the Playwright Chromium executable is missing, so its failures are environment failures, not evidence of product accessibility failures.
- Manual inspection did find the mobile horizontal-overflow defect, so do not rely on the unexecuted suite as a release gate.
- No formal screen-reader session, field interview, low-end Android performance test, translation review or security test was performed. These are necessary before any claim of accessibility or government readiness.

## Recommended 30-day sequence

### Week 1: remove friction

1. Fix page-level mobile overflow across all routes and zoom levels.
2. Redesign mobile header/tooling; hide staff navigation for citizens.
3. Correct stale demo copy that still says the reconciliation report is "reserved for Codex." It now exists.
4. Install the Playwright browser and make the existing accessibility suite a mandatory check.

### Week 2: complete the citizen safety net

1. Add acknowledgements/print receipt, clear contact alternatives and recovery states.
2. Add a multi-channel notification design and message-consent model.
3. Simplify proposed-target explanation and test it with five first-time users.

### Weeks 3-4: make the architecture credible

1. Write the production boundary: real data classification, retention, consent, RBAC, audit logging and incident response.
2. Design legacy-certificate matching as human-in-the-loop review, never automatic decisioning.
3. Prototype regional-language and assisted-service flows with a district/CSC worker and people who have used UDID.
4. Run real-device testing on a low-cost Android phone, 2G/slow network simulation, keyboard-only use, NVDA and TalkBack.

## Final design direction

**Keep:** task-first IA; stage/owner/clock accountability; structured reasons; board transparency; reconciliation; the clear navy/saffron palette; bilingual and accessibility controls; prototype honesty.

**Change first:** mobile overflow; mobile header density; public staff navigation; support/offline/voice/print gaps; and the boundary between an impressive demo model and a secure, governed public service.

The product should feel like this: **a calm, dependable public counter that happens to be on a phone - not a startup dashboard, not an old portal, and never a postbox where a file can disappear.**

## Apple-design reference addendum

### What was reviewed

The supplied repository is a third-party `apple-design` design skill, not an official Apple component library or an Apple-owned design system. It distils Apple WWDC principles around response, direct manipulation, interruption, typography, materials and accessibility. It is useful as a *craft reference*, but it must not override UX4G/GIGW or be copied visually.

### Where Mera UDID already agrees with it

| Apple principle in the reference | Existing Mera UDID evidence | Assessment |
| --- | --- | --- |
| Purpose before feature count | Five citizen tasks, not an organisation chart; tracking and applying are first-class. | Strong. |
| Agency and responsibility | Track without sign-in, assisted-consent flow, explicit reason codes, appeal/escalation and clear prototype disclosure. | Strong; this is the most valuable overlap. |
| Feedback/status/warning/error | Current-stage headline, clock, target, queue, return reason, next action and reconciliation gap. | Strong. |
| Flexibility/accessibility | System font stack, `rem` text scale, text-size/contrast controls, Hindi, keyboard support and reduced-motion rule. | Strong foundation. |
| Simplicity, not empty minimalism | Important context appears beside actions instead of being hidden in a help centre. | Mostly strong; mobile chrome needs simplification. |
| Craft/detail | Shared tokens, consistent radii and semantic colour roles. | Good, but mobile overflow is a visible craft failure. |

### What to adopt

1. **Immediate press feedback.** Add a subtle `:active` state for buttons and task cards (for example, a 0.98 scale or colour shift) that happens on pointer-down. It should be restrained, respect reduced motion and never delay the action.
2. **Size-aware type.** Retain the system-font stack and `rem` sizing. Add `font-optical-sizing: auto` where the browser/font supports it; keep negative tracking only on large headings and neutral/slightly open tracking on small labels. The current design is already close.
3. **Feedback hierarchy.** Treat every meaningful action as one of four states: ongoing status, completion, warning or error. The case tracker is exemplary; bring the same clarity to application save/upload/retry states.
4. **Progressive disclosure.** Keep the case's owner, age and next action above the fold; move audit history, technical metadata and policy explanation below. This is a better application of Apple-style simplicity than removing useful information.
5. **Platform-sensitive layout.** A phone gets a compact header, one dominant action and short flows; desktop staff work gets denser tables and supporting rails. Do not force the desktop navigation model onto a 360 px phone.

### What not to adopt

- No swipe-to-delete, physics-heavy card gestures, rubber-banding or momentum interactions for legal case actions. They create accidental-action and accessibility risk without solving a citizen need.
- No blurred/glass header as a default. Government content needs dependable contrast, low GPU cost and legibility on low-end Android phones. A solid navy header is the correct default.
- No Apple visual identity, SF symbols, iOS controls or "premium app" minimalism. Familiarity for this audience comes from Indian public-service conventions, not Cupertino conventions.
- No celebratory animation around a sensitive certificate process. Delight here is calm certainty: a receipt, clear status and an answerable delay.

### Small implementation backlog from this reference

| Priority | Change | Testable condition |
| --- | --- | --- |
| P1 | Press feedback on buttons/task cards | Immediate visual feedback, no layout shift, disabled under reduced motion where transform is used. |
| P1 | Explicit draft/upload/saved/error states | Every async operation names its current state and recovery action. |
| P1 | Mobile-first information hierarchy | Current task/action visible in first 800 px at 360 px width. |
| P2 | Respect more OS preferences | Add `prefers-contrast: more`; only evaluate reduced-transparency if translucency is later introduced. |
| P2 | Typography QA | Test Hindi and English at each text-size setting with no clipping, overflow or collapsed controls. |

## Current government redesign references: IRCTC and UIDAI

### IRCTC live route vs beta route - what actually changed

The two supplied IRCTC URLs resolve to the same official domain and the beta route visibly identifies itself as **Beta Version**. It is strong evidence of an active redesign experiment, but it is not proof that the design system has been approved for every IRCTC screen or every Indian government site.

| Area | Current `nget` route | Beta `eticket` route | Lesson for Mera UDID |
| --- | --- | --- | --- |
| First interaction | Language-selection modal, then a dense booking form laid over a train image. | Booking intent is visible immediately in one large grouped search card. | Put the citizen's primary job first. Do not make a user decode navigation before starting. |
| Form architecture | Destination, date, class, quota and concessions are placed in a stacked/legacy form with multiple checkboxes. | Source, destination, date, quota and concession are balanced, labelled tiles; the swap control is clearly between source/destination. | Group related information, label every field in plain language, and leave advanced choices one level deeper. |
| Action hierarchy | Ticket booking competes with PNR/charts tabs and a large amount of portal content. | **Search** is the one dominant action; **Check PNR** and **Track Your Train** are clear secondary actions beside it. | Mera should keep its two citizen jobs equally explicit: **Start application** and **Track application**. |
| Visual system | Legacy blue/white, rectangular controls, busy image/form composition and crowded portal expansion. | Blue/orange identity, larger type, soft card surface, stronger spacing and clearer control boundaries. | Adopt the spacing/priority, not the visual spectacle. Mera's navy/blue/saffron palette is already closer to the right restraint. |
| Access and trust | Language prompt, booking-specific concession option, chatbot and long policy footer. | Persistent advisory, clock, text-size controls, branded official header and direct contact navigation. | Add actionable support/fallback, but retain Mera's stronger accessibility and prototype honesty. |
| Remaining risks | High cognitive density and a dated, portal-like surface. | Hero image takes substantial first-screen space; desktop nav remains wide; language choice is not prominent in the beta header. | Do not copy these weaknesses. A disability-certificate service should be quieter and more task-focused than a travel marketplace. |

### What to borrow from IRCTC beta in two days

1. Give the primary action area a single, unmistakable service-entry surface.
2. Keep two or three secondary actions visible only when they are common and safe.
3. Use predictable labelled fields and group related decisions.
4. Reserve colour and elevation for hierarchy, not decoration.
5. Keep an advisory/support strip only if it contains an actionable service fact. Do not add a carousel or promotional banner.

### Current UIDAI comparison

UIDAI's live home page is a better benchmark for government-service support infrastructure than for a case-tracking page. It uses an official identity/header, service search, Hindi/language control, accessibility options, service cards, a physical-centre locator, the 1947 help number, grievance action, FAQ/how-to content, official notices and a reviewed-date/footer structure.

| UIDAI strength | Mera UDID comparison | Decision |
| --- | --- | --- |
| Service cards with a concise action and description | Mera's five task cards are comparable and more focused. | Keep Mera's approach. |
| Find a centre, call **1947**, and file a grievance | Mera has board information and escalation, but lacks human/offline support. | **Adopt now in concept:** "Find district help", a contact route and a clear grievance handoff. Do not invent a real helpline in the demo. |
| Search services and clear official help/document routes | Mera has no global service/help search. | Add a small "Need help?" service path before adding global search. |
| Official notices, legal ownership and trust identity | Mera correctly avoids official identity because it is a prototype. | Preserve the disclaimer; do not imitate government authority. |
| Hero carousel/large lifestyle imagery | Mera has a factual task-first hero. | Do **not** copy. The Mera approach is better for a person seeking a certificate update. |
| FAQ and how-to videos | Mera has Help but no short visual/explainer aid. | Add a short illustrated or video-based "How your application moves" aid after core fixes. |

### Two-day hackathon cut list

Do not attempt a broad redesign. The win is a demonstrably better public service, not a larger feature list.

#### Day 1 - remove friction and improve first impression

1. **Fix horizontal overflow on every route at 320/360/375/640 px and 200% zoom.** This is mandatory.
2. **Replace the mobile header composition.** Keep language visible; put display controls inside a compact menu; use a citizen navigation menu; do not expose the staff bar to anonymous citizens.
3. **Give the homepage one clear service-entry block** modelled on the hierarchy of IRCTC beta, not its visual decoration: Start application, Track application, Help with my application.
4. **Add an honest support/fallback panel:** district office/board route, help page, escalation information and a demo-labelled contact placeholder. Do not manufacture a government telephone number.
5. **Remove stale "Reserved for Codex" wording** from demo/session explanatory copy. The report is now implemented.

#### Day 2 - make the story judge-proof

1. Add a printable acknowledgement/receipt view for a submitted application, including ID, date, current stage, owner and next expected action.
2. Add an explicit save/resume indicator to the application journey and plain recovery wording for upload/error states.
3. Add a compact "How this works" explainer: submitted -> district office -> medical board -> certificate -> card, plus where to get human help.
4. Run the accessibility suite after installing its missing Chromium runtime; manually validate TalkBack/keyboard and the 360 px route list.
5. Record the demo in this order: the 10.12 lakh evidence -> a tracked delayed case -> one structured fix -> board date -> escalation -> oversight reconciliation. Lead with the system rule, not a beauty shot.

#### Explicitly defer

- new AI features;
- real Aadhaar/DigiLocker/OTP integration;
- voice assistant, chatbot, complex animations or a carousel;
- redesigning every desktop page;
- copying the UIDAI/IRCTC brand language or official symbols.

## Sources reviewed
## Sources reviewed

- [GIGW 3.0 - Guidelines for Indian Government Websites and Apps](https://guidelines.india.gov.in/)
- [UX4G Design System 3.0](https://www.ux4g.gov.in/)
- [UX4G developer documentation](https://doc.ux4g.gov.in/)
- [National Portal of India](https://www.india.gov.in/)
- [DigiLocker](https://www.digilocker.gov.in/)
- [UMANG - About](https://www.umang.gov.in/landing/aboutus)
- [Supplied apple-design reference](https://github.com/emilkowalski/skills/tree/main/skills/apple-design)
- [IRCTC current train search](https://www.irctc.co.in/nget/train-search) and [IRCTC beta train search](https://www.irctc.co.in/eticket/train-search)
- [UIDAI current website](https://uidai.gov.in/en)
- `UDIDEvidenceJustification.pdf` and `UDIDExplainedSimply.pdf` in this project
