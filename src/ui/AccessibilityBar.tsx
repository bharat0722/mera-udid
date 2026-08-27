import { useState, useSyncExternalStore } from "react";
import {
  getDisplaySettings,
  resetDisplay,
  setContrast,
  stepTextSize,
  subscribeDisplay,
  TEXT_SIZES
} from "../core/displaySettings";
import { useI18n } from "../i18n/I18nContext";
import { ContrastIcon, LanguageIcon, TextSizeIcon } from "./Icons";

/**
 * The accessibility toolkit, in the page chrome where india.gov.in puts it.
 *
 * Three controls, each one a real button with a real label: make the text bigger, make
 * it smaller, and switch to high contrast. The current state is announced, not merely
 * shown — a pressed toggle uses aria-pressed, and the text-size buttons disable at the
 * ends rather than silently doing nothing.
 */
export function AccessibilityBar({
  locale,
  onToggleLocale,
  switchLabel,
  otherLanguage
}: {
  locale: "en" | "hi";
  onToggleLocale: () => void;
  switchLabel: string;
  otherLanguage: string;
}) {
  const { t } = useI18n();
  const [isToolsOpen, setToolsOpen] = useState(false);
  const settings = useSyncExternalStore(
    subscribeDisplay,
    getDisplaySettings,
    getDisplaySettings
  );

  const sizeIndex = TEXT_SIZES.indexOf(settings.textSize);
  const isHighContrast = settings.contrast === "high";

  return (
    <div className="a11y-bar" data-expanded={isToolsOpen ? "true" : "false"}>
      <div className="container a11y-bar__inner">
        <span className="a11y-bar__label" id="a11y-bar-label">
          {t.a11yBar.label}
        </span>

        <button
          type="button"
          className="a11y-bar__toggle"
          aria-expanded={isToolsOpen}
          aria-controls="a11y-display-tools"
          onClick={() => setToolsOpen((open) => !open)}
        >
          <TextSizeIcon size={16} />
          {t.a11yBar.label}
        </button>

        <div
          id="a11y-display-tools"
          className="a11y-bar__group"
          role="group"
          aria-labelledby="a11y-bar-label"
        >
          <button
            type="button"
            className="a11y-bar__btn"
            onClick={() => stepTextSize(-1)}
            disabled={sizeIndex === 0}
            aria-label={t.a11yBar.decrease}
          >
            <TextSizeIcon size={14} />
            <span aria-hidden="true">A−</span>
          </button>

          <button
            type="button"
            className="a11y-bar__btn"
            onClick={() => resetDisplay()}
            aria-label={t.a11yBar.reset}
          >
            <span aria-hidden="true">A</span>
          </button>

          <button
            type="button"
            className="a11y-bar__btn"
            onClick={() => stepTextSize(1)}
            disabled={sizeIndex === TEXT_SIZES.length - 1}
            aria-label={t.a11yBar.increase}
          >
            <TextSizeIcon size={18} />
            <span aria-hidden="true">A+</span>
          </button>

          <button
            type="button"
            className="a11y-bar__btn"
            onClick={() => setContrast(isHighContrast ? "normal" : "high")}
            aria-pressed={isHighContrast}
          >
            <ContrastIcon size={16} />
            {t.a11yBar.contrast}
          </button>
        </div>

        <button
          type="button"
          className="a11y-bar__btn a11y-bar__btn--lang"
          onClick={onToggleLocale}
          lang={locale === "en" ? "hi" : "en"}
          aria-label={switchLabel}
        >
          <LanguageIcon size={16} />
          {otherLanguage}
        </button>
      </div>
    </div>
  );
}
