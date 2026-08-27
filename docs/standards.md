# Standards alignment — UX4G and GIGW 3.0

What this prototype does to follow the Government of India's own guidance for public
digital services, what it deliberately does differently, and what it does not claim.

Sources: [UX4G](https://www.ux4g.gov.in/) — the official component library and pattern
repository for Government of India initiatives — and
[GIGW 3.0](https://guidelines.india.gov.in/), the Guidelines for Indian Government
Websites and apps.

## Patterns are for everyone; identity is not

UX4G is published as an open design system, and using its patterns is exactly what it
exists for. Following the GIGW structure makes a citizen's job easier, because someone
who has used another Indian government service already knows where to look for Help,
for the policies, for the sitemap.

What the hackathon rules forbid is something different: misuse of government logos and
misrepresentation as official. Those are **identity assets**, not design patterns —
and this prototype uses none of them. Design style is not impersonation.

The disclaimers below are therefore not a hedge. They exist because honesty is a scored
judging criterion, and because GIGW itself requires a clearly stated content owner:

- The footer of every page opens with the disclaimer, exactly as the hackathon rules
  require. The interface itself speaks in the product's own voice — the honesty lives
  in the footer and the statutory pages, where the rules put it, not in a banner
  shouting over the headline.
- Every statutory page opens by saying it is not a Government of India product and is
  not affiliated with the Department of Empowerment of Persons with Disabilities.
- No government emblem, wordmark, tricolour or department logo appears anywhere. The
  project mark is a card outline with a tick, drawn for this project and deliberately
  unlike any government emblem.

## What UX4G validates about the design

UX4G states that its components build in "DPDP Act 2023 consent flows, Right to Service
Act SLA accountability, GIGW 3.0 accessibility standards, and DARPG grievance
guidelines". Three of those four are the load-bearing ideas of this build, which were
arrived at from the evidence rather than from the design system:

| UX4G compliance area | Where it already lives in this build |
| --- | --- |
| **Right to Service Act SLA accountability** | Every stage has a named owner and a running clock against a published target, and a breach is visible to the citizen and the officer at the same time. This is the core of the project. |
| **DPDP Act 2023 consent flows** | Assisted mode records who is helping, their relationship, and a consent timestamp, on the case. The application form collects a phone number and discards it on submission, because nothing needs it. |
| **DARPG grievance guidelines** | Structured reason codes on every return and rejection, a plain-language explanation, and an appeal under RPwD Act s.59 recorded on the case timeline. |
| **GIGW 3.0 accessibility** | WCAG 2.2 AA, verified on every build — see below. |

That the guidance and the evidence pointed the same way is worth saying plainly in the
pitch: this is not a design opinion, it is what the government's own design system says
a service of this kind owes its users.

## GIGW 3.0 — what was added

| Requirement | Status |
| --- | --- |
| Conformance with WCAG 2.1 Level AA | **Exceeded.** Built and tested to WCAG 2.2 AA — one version ahead. 38 automated accessibility checks across 14 screens on every build. |
| Content in more than one Indian language | **Met** for the whole citizen journey (English and Hindi). The two staff tools are English only, and the accessibility statement says so. |
| Help page | **Added** — `#/help` |
| Accessibility statement | **Added** — `#/accessibility`, including screen reader guidance and, more importantly, the known limitations |
| Terms and Conditions | **Added** — `#/policies` |
| Privacy Policy | **Added** — `#/policies` |
| Copyright Policy | **Added** — `#/policies` |
| Hyperlinking Policy | **Added** — `#/policies` |
| Sitemap, reachable from the homepage | **Added** — `#/sitemap`, linked from the footer of every page |
| Navigation to every page from the footer | **Added** — three-column footer: Services, Staff view, About this prototype |
| Named content owner and review cadence | **Added** — in the footer of every page |
| Alt text on logo images | **Met** — the project mark is decorative and marked `aria-hidden`; the link that wraps it carries the accessible name |

## The homepage

It was rebuilt to the pattern every Indian government service homepage uses, and that
UX4G is organised around: most people arrive with one of a small number of jobs in mind,
so the fastest homepage is the one that lists them.

- **Hero** — the service name ("Disability certificate services"), one factual sentence,
  and the two primary actions. No slogan, no form, no exhibit: the same shape as a
  GOV.UK or Passport Seva service start page.
- **"What would you like to do?"** — five task cards: apply, track, find your board
  date, see all your applications, get help. Each card is one large link with an icon
  that carries no meaning of its own.
- **A status check**, for someone returning to an application they already made — as one
  item in the task section rather than the thing that dominates the hero.
- Then service content only: the journey with its proposed targets, and the service's
  promises. The evidence — the stakes, the parliamentary arithmetic, the diagnosis —
  lives on a dedicated About page (`#/about`), the way a government service separates
  "do the thing" from "about this service".

Before this change the homepage led with a status lookup form, which made it read as a
tracking page rather than the front door of a service.

## Accessibility, measured

Not a claim — a build step. Full detail in [STYLE.md](../STYLE.md) and the statement at
`#/accessibility`.

- axe-core over all 14 screens at 360px and desktop widths. Bar: zero serious or
  critical violations. Currently met.
- The main journey driven end to end by keyboard alone, starting from the skip link.
- No horizontal scroll at 640 CSS pixels — a 1280px window at 200% zoom.
- Every interactive element at least 44×44px, on every screen.
- Every colour pair measured. Lowest in use: 5.67:1 against a 4.5:1 requirement.
- One `contentinfo` landmark per page, one `<h1>` per screen, ordered lists for
  sequences, and errors linked to their fields.

## What this prototype does not claim

- It is not GIGW-certified. GIGW conformance is assessed by STQC-empanelled auditors
  against the full conformity matrix. This follows the guidance; nobody has audited it.
- It has not been tested with people who use assistive technology daily. That is the
  most significant gap in the accessibility statement, and no automated score
  substitutes for it.
- It uses no UX4G code. The design system was read for its guidance; the components here
  are written from scratch against the tokens in STYLE.md, so that everything in the
  bundle is something we can explain.
