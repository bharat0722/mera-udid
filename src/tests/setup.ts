import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Explicit rather than relying on the auto-cleanup hook: every test in this project
// renders the whole app, so a leaked previous render turns every query ambiguous.
afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});
