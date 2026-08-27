import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { I18nProvider } from "./i18n/I18nContext";
import { initDisplaySettings } from "./core/displaySettings";
import "./styles/base.css";

// Restore the reader's text size and contrast before the first paint, so the page
// never flashes at the wrong size.
initDisplaySettings();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>
);
