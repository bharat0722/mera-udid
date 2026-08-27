/**
 * Display settings — text size and contrast.
 *
 * Every major Indian government portal ships these controls in the page chrome rather
 * than burying them in a settings page: india.gov.in carries contrast adjustment, text
 * size, text spacing and line height as a persistent toolkit. On a service *for persons
 * with disabilities* their absence would be the loudest thing on the page.
 *
 * This is not a substitute for browser zoom, and it does not pretend to be. It exists
 * because a lot of people do not know browser zoom exists, are on a borrowed phone, or
 * are being helped through the form by someone else — and an on-page control they can
 * see is one they can use.
 *
 * Text size works by scaling the root font size, so every `rem` in the token system
 * scales with it and nothing needs a second set of values. Contrast works by swapping
 * token values under a `data-contrast` attribute.
 */

export type TextSize = "normal" | "large" | "largest";
export type Contrast = "normal" | "high";

export interface DisplaySettings {
  textSize: TextSize;
  contrast: Contrast;
}

export const TEXT_SIZES: TextSize[] = ["normal", "large", "largest"];

/** Root font size for each step. 100% / 112.5% / 125%. */
export const TEXT_SIZE_SCALE: Record<TextSize, string> = {
  normal: "100%",
  large: "112.5%",
  largest: "125%"
};

const STORAGE_KEY = "mera-udid.display";

const DEFAULTS: DisplaySettings = { textSize: "normal", contrast: "normal" };

type Listener = () => void;

let current: DisplaySettings = DEFAULTS;
const listeners = new Set<Listener>();

function read(): DisplaySettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
    return {
      textSize: TEXT_SIZES.includes(parsed.textSize as TextSize)
        ? (parsed.textSize as TextSize)
        : "normal",
      contrast: parsed.contrast === "high" ? "high" : "normal"
    };
  } catch {
    return DEFAULTS;
  }
}

/** Writes the settings onto the document so CSS can respond to them. */
export function apply(settings: DisplaySettings): void {
  if (typeof document === "undefined") return;
  document.documentElement.style.fontSize = TEXT_SIZE_SCALE[settings.textSize];
  document.documentElement.setAttribute("data-contrast", settings.contrast);
  document.documentElement.setAttribute("data-text-size", settings.textSize);
}

export function initDisplaySettings(): void {
  current = read();
  apply(current);
}

export function getDisplaySettings(): DisplaySettings {
  return current;
}

export function subscribeDisplay(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function commit(next: DisplaySettings): void {
  current = next;
  apply(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Not being able to remember the choice is no reason to refuse to make it.
  }
  for (const listener of listeners) listener();
}

export function setTextSize(textSize: TextSize): void {
  commit({ ...current, textSize });
}

/** Steps up or down one size, stopping at the ends rather than wrapping. */
export function stepTextSize(direction: 1 | -1): void {
  const index = TEXT_SIZES.indexOf(current.textSize);
  const next = TEXT_SIZES[Math.min(TEXT_SIZES.length - 1, Math.max(0, index + direction))];
  setTextSize(next);
}

export function setContrast(contrast: Contrast): void {
  commit({ ...current, contrast });
}

export function resetDisplay(): void {
  commit(DEFAULTS);
}
