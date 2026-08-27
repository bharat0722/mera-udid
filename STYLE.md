# Style

The design system for Mera UDID. Every screen consumes these tokens. No component
hard-codes a colour, a size or a spacing value.

Source of truth: [`src/styles/tokens.css`](src/styles/tokens.css). Components:
[`src/styles/components.css`](src/styles/components.css). Reset, typography and layout
primitives: [`src/styles/base.css`](src/styles/base.css).

## Direction

The navy / white / saffron-accent visual language of Indian government digital
services, per UX4G — patterns, not identity. A dark navy header band with a single
saffron keyline, blue for actions and the current stage, green reserved for success
and completion, and calm white cards on a cool grey page. It must feel trustworthy and
effortless, not like a startup landing page.

Deliberately absent, and to stay absent: gradients, glassmorphism, dark mode, decorative
animation, parallax, emoji used as icons, stock photography, icon fonts, any asset
loaded from another origin — and any government emblem, wordmark or flag device. The
saffron keyline is one colour on its own, never part of a tricolour arrangement. Icons
are inline SVG in [`src/ui/Icons.tsx`](src/ui/Icons.tsx), drawn for this project.

There are no web fonts. The system font stack loads instantly on a cheap Android phone
on a slow connection, which is the device this has to work on.

## Colour

| Token | Value | Used for |
| --- | --- | --- |
| `--ink` | `#171B26` | Primary text |
| `--ink-muted` | `#49546B` | Secondary text, form control borders |
| `--paper` | `#F4F6FA` | Page background |
| `--surface` | `#FFFFFF` | Cards, footer |
| `--border` | `#D8DEE9` | Card edges, table rules, dividers |
| `--primary` | `#1E40AF` | Actions, links, the current stage |
| `--primary-hover` | `#1E3A8A` | Hover state of the above |
| `--primary-tint` | `#E8EEFC` | Fills only: current stepper row, selections |
| `--header-bg` | `#0F2557` | The navy header band |
| `--header-ink` / `--header-muted` | `#FFFFFF` / `#C7D3EC` | Text inside the band |
| `--accent` | `#E36414` | Saffron keylines and hover edges — decorative only |
| `--accent-ink` | `#92400E` | The only orange permitted to carry text (eyebrows) |
| `--success` | `#0B5D3B` | Done stages, protected queue, confirmations |
| `--success-deep` / `--success-tint` | `#084A2F` / `#EAF2ED` | Text and fills for the above |
| `--info` / `--info-bg` | `#1B4D8F` / `#EDF3FB` | "Next step" callouts |
| `--attention-bg` / `--attention-ink` | `#FFF6E0` / `#7A5200` | Returned-to-applicant states |
| `--danger` / `--danger-bg` | `#A32B1C` / `#FCEFED` | Rejections, SLA breaches |
| `--focus` | `#FFBF47` | Focus ring |

The colour grammar, in one line: **blue is what is happening, green is what is done,
amber is what is waiting on you, red is what went wrong, saffron is decoration.**

### Verified contrast ratios

Computed from the hex values above, sRGB relative luminance, WCAG 2.x formula.

| Foreground | Background | Used for | Ratio | Verdict |
| --- | --- | --- | --- | --- |
| `--ink` | `--paper` | Body text on the page | 15.89:1 | Pass AA |
| `--ink` | `--surface` | Body text on a card | 17.20:1 | Pass AA |
| `--ink` | `--primary-tint` | Text on the current stepper row | 14.79:1 | Pass AA |
| `--ink-muted` | `--paper` | Secondary text on the page | 7.02:1 | Pass AA |
| `--ink-muted` | `--surface` | Secondary text on a card | 7.60:1 | Pass AA |
| `--primary` | `--paper` | Links and action text | 8.06:1 | Pass AA |
| `--primary` | `--surface` | Links on a card | 8.72:1 | Pass AA |
| `--primary` | `--primary-tint` | Primary on its own tint | 7.50:1 | Pass AA |
| `#FFFFFF` | `--primary` | Button label on a primary fill | 8.72:1 | Pass AA |
| `#FFFFFF` | `--primary-hover` | Button label on hover | 10.36:1 | Pass AA |
| `--header-ink` | `--header-bg` | Brand text in the navy band | 14.76:1 | Pass AA |
| `--header-muted` | `--header-bg` | Nav links in the navy band | 9.81:1 | Pass AA |
| `--accent-ink` | `--paper` | Saffron eyebrow text | 6.55:1 | Pass AA |
| `--accent-ink` | `--surface` | Saffron text on a card | 7.09:1 | Pass AA |
| `--success-deep` | `--success-tint` | Done chip text | 9.07:1 | Pass AA |
| `--success` | `--surface` | Success text on a card | 7.95:1 | Pass AA |
| `--info` | `--info-bg` | Info callout text | 7.51:1 | Pass AA |
| `--attention-ink` | `--attention-bg` | Attention callout text | 6.43:1 | Pass AA |
| `--danger` | `--danger-bg` | Danger callout text | 6.41:1 | Pass AA |
| `#FFFFFF` | `--danger` | White on a danger fill | 7.19:1 | Pass AA |
| `--focus` | `--header-bg` | Focus ring against the navy band | 8.99:1 | Pass (non-text) |
| `--accent` | `--header-bg` | Saffron keyline against navy | 4.29:1 | Pass (non-text) |

The minimum for body text is 4.5:1. The lowest text pair in use is 6.41:1, so there is
headroom everywhere rather than a set of values that scrape past.

### Two pairs that do not reach 3:1, and why that is deliberate

- **`--focus` on `--surface` is 1.61:1.** A bare yellow ring would fail WCAG 2.2
  SC 1.4.11. It is never used bare: `:focus-visible` paints a 3px yellow outline over a
  `box-shadow: 0 0 0 7px var(--ink)`, so the indicator has a dark edge on both sides.
  `--focus` against `--ink` is 10.48:1, so the composite ring is unmistakable on any
  background the app uses, including the navy band.
- **`--border` on `--surface` is 1.35:1.** This token is decorative only — card edges,
  table rules, section dividers. It never carries state or identifies a control on its
  own. Every form control uses a 2px `--ink-muted` border instead (7.60:1), selected
  choices are marked by `--primary` plus a tint plus the native control, and stage
  states always carry an icon and a text label as well as a colour.

## Type

System stack, no web fonts:

```
system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans",
"Noto Sans Devanagari", Arial, sans-serif
```

`Noto Sans Devanagari` is named for the Hindi copy; if it is not installed the stack
falls through to whatever the platform uses for Devanagari.

| Role | Size / line-height | Notes |
| --- | --- | --- |
| Display | 2.75rem / 1.1 | Hero headline only, capped at 20ch |
| h1 | 2rem / 1.2 | Capped at 20ch |
| h2 | 1.5rem / 1.3 | Capped at 26ch |
| h3 | 1.25rem / 1.4 | |
| Body | 1.0625rem / 1.6 | Prose capped at 68ch |
| Small | 0.9375rem / 1.5 | Metadata, hints, sources |

Below 640px the display drops to 2rem, h1 to 1.625rem and h2 to 1.3125rem.

The hero headline is written to fit two lines at desktop inside the 20ch cap. If the
copy grows past roughly 44 characters it wraps to three and the cap has to be revisited
rather than quietly overridden.

## Spacing, radius, elevation

- Spacing steps, and only these: `4 8 12 16 24 32 48 64 96` px, as `--space-1` … `--space-9`.
- Radius: cards `10px`, buttons `8px`, chips `999px`.
- Elevation, one level only: `0 1px 2px rgba(0,0,0,.04), 0 4px 14px rgba(0,0,0,.05)`.

## Layout

- Centred container, max-width `1200px`, `24px` side padding (`16px` on mobile).
- Prose column max `680px`. Single-column screens (track, apply, fix, appeal) use a
  `760px` column so nothing sits in an empty side gutter.
- Home hero is a single-column government service start: the service name, one factual
  sentence and the two actions. The live example case sits in its own section below the
  tasks, not in the hero.
- **Case screens use `.case-layout`** — a wide main column for what is happening and
  what to do, and a supporting rail for reference material you consult rather than act
  on. Before this the track screen was a 760px column on a 1440px display, wasting 47%
  of the screen and pushing the most important fact 650px down the page.
- **Form screens use `.form-layout`** — a 17rem step column beside the questions. UX4G
  and GOV.UK agree that progress belongs where there is room to name each step and its
  state, not compressed into a strip of chips.
- **`.panel` is the quiet surface**: a card is for a thing you act on, a panel for a
  thing you consult. Same tokens, no shadow, quieter edge.
- Section rhythm `96px` desktop, `64px` mobile.
- The disclaimer is a slim bar above the header, never a block above the headline.
- Any table that can outgrow the viewport is wrapped in
  [`TableScroll`](src/ui/TableScroll.tsx), which scrolls sideways inside its own box,
  takes focus, and carries a label. The page itself never scrolls horizontally.

## The stepper

The highest-priority component: [`src/ui/Stepper.tsx`](src/ui/Stepper.tsx).

- Semantic `<ol>`, one `<li>` per stage.
- A connecting vertical line: `--success` behind completed segments, `--border` ahead.
- Five node states, each with **both** an icon and a text label — never colour alone:
  - **Done** — filled circle, check icon, title and completion date.
  - **Current** — ring with a filled centre; the row is tinted, carries a 3px left
    border, and the title steps up to h3 size. It shows who holds the file, days in
    stage against the proposed target, and the next step with its date.
  - **Upcoming** — hollow circle, muted text, labelled "Not started".
  - **Blocked** — amber, alert icon, labelled "Waiting for you".
  - **Rejected** — red, cross icon, labelled "Rejected".
- The whole road is always shown, including stages not yet reached. An exception stage
  is spliced in at the point it happened, with the remaining stages still visible.
- Readable at 360px width.

## Status card hierarchy

[`src/ui/StatusHeadline.tsx`](src/ui/StatusHeadline.tsx). The order matters and is the
fix for the first build of this screen, which rendered four equal-weight items:

1. **Who has your file** — largest text on the card. It is the promise in the headline.
2. **Days at this desk** — display-size number with the proposed target beside it. The
   whole block turns `--danger-bg` on breach.
3. Application ID, district, submitted date, days since applying — quiet metadata.

## The accessibility toolkit

Every major Indian government portal puts display controls in the page chrome rather
than a settings page — india.gov.in carries contrast, text size, text spacing and line
height as a persistent toolkit. On a service *for persons with disabilities* their
absence would be the loudest thing on the page.

- **Text size** — three steps at 100% / 112.5% / 125%, applied to the root font size so
  every `rem` in the token system scales with it. Buttons disable at the ends rather
  than silently doing nothing.
- **High contrast** — a `data-contrast="high"` attribute swaps the token values for
  their maximum-separation equivalents, thickens every border (a hairline disappears at
  high contrast) and underlines every link. It is not a dark mode and not a re-skin: the
  same layout, pushed as far apart as it goes.
- Both persist to `localStorage` and are applied before the first paint, so the page
  never flashes at the wrong size.
- The state is announced, not merely shown: the contrast control is a real
  `aria-pressed` toggle.

## Devanagari line height

Latin body text runs at 1.6. **Hindi runs at 1.8**, per UX4G's typography guidance —
Devanagari ascenders and the shirorekha collide at Latin leading. Applied by `:lang(hi)`
so it follows the Hindi copy wherever it appears, with headings pulled back to 1.45.

## Accessibility rules baked into the system

- Every interactive element has a visible focus ring. Outlines are never removed.
- Every tap target is at least 44×44px, including the language toggle. Where a radio or
  checkbox is wrapped in a `.choice` label, the label is the target and is ≥44px.
- Semantic HTML: real `<nav>`, `<main>`, `<ol>` for the stepper, one `<h1>` per screen,
  labelled fields with errors linked by `aria-describedby`.
- Status changes are announced through an ARIA live region on the track screen.
- `prefers-reduced-motion` is respected; there is almost no motion to reduce.
- Error messages say what is wrong and how to fix it, in words, never in colour alone.

Verified by [`e2e/accessibility.spec.ts`](e2e/accessibility.spec.ts): axe over every
screen at both mobile and desktop viewports, the golden path driven by keyboard alone,
no horizontal scroll at 200% zoom, and a tap-target sweep.
