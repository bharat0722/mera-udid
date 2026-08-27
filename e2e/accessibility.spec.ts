import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";

declare global {
  interface Window {
    axe: typeof axe;
  }
}

/**
 * Accessibility is the product here, not a checklist item, so these run over every
 * screen rather than the homepage alone. The bar is: no serious or critical axe
 * violation anywhere, the whole golden path reachable by keyboard, and no horizontal
 * scrolling at 200% zoom.
 */

const ROUTES = [
  { name: "home", hash: "#/" },
  { name: "apply", hash: "#/apply" },
  { name: "about", hash: "#/about" },
  { name: "sign in", hash: "#/signin" },
  { name: "my applications", hash: "#/my-applications" },
  { name: "board calendar", hash: "#/board" },
  { name: "search", hash: "#/search" },
  { name: "resources", hash: "#/resources" },
  { name: "escalate a delay", hash: "#/escalate/UDID-DEMO-4096" },
  { name: "track a healthy case", hash: "#/track/UDID-DEMO-1024" },
  { name: "track a returned case", hash: "#/track/UDID-DEMO-2048" },
  { name: "fix and resubmit", hash: "#/fix/UDID-DEMO-2048" },
  { name: "help", hash: "#/help" },
  { name: "accessibility statement", hash: "#/accessibility" },
  { name: "website policies", hash: "#/policies" },
  { name: "sitemap", hash: "#/sitemap" },
  { name: "officer console", hash: "#/officer" },
  { name: "oversight", hash: "#/admin" }
];

async function runAxe(page: Page) {
  await page.addScriptTag({ content: axe.source });
  return page.evaluate(async () => {
    return window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }
    });
  });
}

for (const route of ROUTES) {
  test(`${route.name} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(`/${route.hash}`);
    await page.waitForSelector("main h1");

    const results = await runAxe(page);
    const serious = results.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious"
    );

    // Print the rule ids so a failure names the problem rather than just a count.
    expect(
      serious.map((violation) => `${violation.id}: ${violation.help}`),
      `axe violations on ${route.name}`
    ).toEqual([]);
  });
}

test("the whole page is reachable by keyboard alone", async ({ page }) => {
  await page.goto("/#/track/UDID-DEMO-2048");

  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeVisible();

  // Walk forward until the fix link takes focus, without touching the mouse.
  const fixLink = page.getByRole("link", { name: /fix this and resubmit/i });
  for (let i = 0; i < 40; i += 1) {
    if (await fixLink.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(fixLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: /fix and resubmit/i })).toBeVisible();

  const submit = page.getByRole("button", { name: /send it back to the office/i });
  await expect(submit).toBeDisabled();

  const checkbox = page.getByRole("checkbox");
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(submit).toBeEnabled();
  await submit.focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("heading", { name: /sent back to the office/i })).toBeVisible();
  await expect(page.getByText(/your place in the queue was kept/i)).toBeVisible();
});

test("the focus ring is always visible and never removed", async ({ page }) => {
  await page.goto("/#/");
  await page.keyboard.press("Tab");

  const outline = await page.evaluate(() => {
    const active = document.activeElement as HTMLElement;
    const style = getComputedStyle(active);
    return { width: style.outlineWidth, style: style.outlineStyle, shadow: style.boxShadow };
  });

  expect(outline.style).not.toBe("none");
  expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(3);
  expect(outline.shadow).not.toBe("none");
});

test("nothing scrolls sideways at 200% zoom", async ({ page }) => {
  // 640 CSS pixels is what a 1280px desktop window gives at 200% browser zoom.
  await page.setViewportSize({ width: 640, height: 800 });

  for (const route of ROUTES) {
    await page.goto(`/${route.hash}`);
    await page.waitForSelector("main h1");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `horizontal overflow on ${route.name}`).toBeLessThanOrEqual(1);
  }
});

test("every tap target is at least 44 by 44", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });

  for (const route of ROUTES) {
    await page.goto(`/${route.hash}`);
    await page.waitForSelector("main h1");

    const small = await page.evaluate(() =>
      [...document.querySelectorAll("a, button, input, select, textarea")]
        .filter((element) => {
          // A radio or checkbox wrapped in a label is activated by clicking anywhere in
          // that label, so the label is the real target and the input's own box is not.
          const target = element.closest("label") ?? element;
          const box = target.getBoundingClientRect();
          // Skip anything not rendered, and the visually hidden skip link at rest.
          if (box.width === 0 || box.height === 0) return false;
          if (element.classList.contains("skip-link")) return false;
          return box.height < 44;
        })
        .map((element) => `${element.tagName}.${element.className} ${element.textContent?.trim().slice(0, 30)}`)
    );

    expect(small, `tap targets under 44px on ${route.name}`).toEqual([]);
  }
});

test("the language toggle switches the document language", async ({ page }) => {
  await page.goto("/#/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.getByRole("button", { name: /switch language/i }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "hi");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("प्रमाणपत्र");
});
