// tests/todo.spec.mjs — RED phase
// One Playwright case per scenario in specs/todo-app/spec.md.
// Every case in this file MUST FAIL before GREEN lands.

import { test, expect } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX = "file://" + path.resolve(__dirname, "..", "index.html");

test.beforeEach(async ({ page }) => {
  await page.goto(INDEX);
});

async function addItem(page, text) {
  await page.locator('[data-testid="todo-input"]').fill(text);
  await page.locator('[data-testid="todo-add"]').click();
}

// --- Requirement: Add a todo ---

test("add: empty input is rejected", async ({ page }) => {
  await addItem(page, "");
  await expect(page.locator('[data-testid="todo-item"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="todo-input"]')).toBeFocused();
});

test("add: whitespace-only input is rejected", async ({ page }) => {
  await addItem(page, "   ");
  await expect(page.locator('[data-testid="todo-item"]')).toHaveCount(0);
});

test("add: appends one item with trimmed text and clears input", async ({ page }) => {
  await addItem(page, "buy milk");
  const items = page.locator('[data-testid="todo-item"]');
  await expect(items).toHaveCount(1);
  await expect(items.first()).toHaveText("buy milk");
  await expect(items.first()).not.toHaveClass(/done/);
  await expect(page.locator('[data-testid="todo-input"]')).toHaveValue("");
});

test("add: leading and trailing whitespace is trimmed", async ({ page }) => {
  await addItem(page, "  buy milk  ");
  await expect(page.locator('[data-testid="todo-item"]').first()).toHaveText("buy milk");
});

// --- Requirement: Toggle a todo as done ---

test("toggle: marking done applies aria-pressed and done class", async ({ page }) => {
  await addItem(page, "x");
  const toggle = page.locator('[data-testid="todo-toggle"]').first();
  await toggle.click();
  const item = page.locator('[data-testid="todo-item"]').first();
  await expect(item).toHaveClass(/done/);
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
});

test("toggle: unmarking restores aria-pressed and removes done class", async ({ page }) => {
  await addItem(page, "x");
  const toggle = page.locator('[data-testid="todo-toggle"]').first();
  await toggle.click();
  await toggle.click();
  const item = page.locator('[data-testid="todo-item"]').first();
  await expect(item).not.toHaveClass(/done/);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
});

// --- Requirement: Delete a todo ---

test("delete: removes exactly the targeted item", async ({ page }) => {
  await addItem(page, "a");
  await addItem(page, "b");
  await page.locator('[data-testid="todo-item"]').first().locator('[data-testid="todo-delete"]').click();
  const items = page.locator('[data-testid="todo-item"]');
  await expect(items).toHaveCount(1);
  await expect(items.first()).toHaveText("b");
});

test("delete: empty list still has the list container and focused input", async ({ page }) => {
  await addItem(page, "x");
  await page.locator('[data-testid="todo-delete"]').first().click();
  await expect(page.locator('[data-testid="todo-list"]')).toBeVisible();
  await expect(page.locator('[data-testid="todo-item"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="todo-input"]')).toBeFocused();
});

// --- Requirement: Arcade CRT visual identity ---

test("visual: body uses a bitmap font", async ({ page }) => {
  const fontFamily = await page.evaluate(() =>
    getComputedStyle(document.body).fontFamily
  );
  expect(fontFamily.toLowerCase()).toMatch(/(press start 2p|vt323)/);
});

test("visual: scanline overlay is present and pointer-events:none", async ({ page }) => {
  const pointerEvents = await page.evaluate(() => {
    const probe = document.createElement("button");
    probe.textContent = "probe";
    document.body.appendChild(probe);
    const rect = probe.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + 2, rect.top + 2);
    probe.remove();
    return {
      beforePe: getComputedStyle(document.body, "::before").pointerEvents,
      clickedTag: top ? top.tagName : null,
    };
  });
  expect(pointerEvents.beforePe).toBe("none");
  expect(pointerEvents.clickedTag).toBe("BUTTON");
});

test("visual: hard pixel borders everywhere (border-radius 0)", async ({ page }) => {
  const radii = await page.evaluate(() => {
    const sels = ["body", "input", "button", "ul", "li"];
    return sels
      .map((s) => Array.from(document.querySelectorAll(s)))
      .flat()
      .map((el) => getComputedStyle(el).borderRadius);
  });
  for (const r of radii) expect(r).toBe("0px");
});

test("visual: body background is near-black and a neon accent appears", async ({ page }) => {
  const { bg, accents } = await page.evaluate(() => {
    const body = getComputedStyle(document.body).backgroundColor;
    const accent = (getComputedStyle(document.querySelector("h1")).color)
      || (getComputedStyle(document.querySelector("button")).color);
    return { bg: body, accents: accent };
  });
  // parse rgb/rgba into brightness
  const m = bg.match(/rgba?\(([^)]+)\)/);
  expect(m).not.toBeNull();
  const [r, g, b] = m[1].split(",").map((v) => parseInt(v.trim(), 10));
  expect(r + g + b).toBeLessThan(60); // very dark
  expect(accents.toLowerCase()).toMatch(/(255,\s*43,\s*214|34,\s*246,\s*255|255,\s*240,\s*102)/);
});

// --- Requirement: Keyboard accessibility ---

test("keyboard: Enter in input adds the item", async ({ page }) => {
  await page.locator('[data-testid="todo-input"]').fill("z");
  await page.locator('[data-testid="todo-input"]').press("Enter");
  await expect(page.locator('[data-testid="todo-item"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="todo-item"]').first()).toHaveText("z");
});

test("keyboard: Enter on toggle fires toggle only", async ({ page }) => {
  await addItem(page, "x");
  const toggle = page.locator('[data-testid="todo-toggle"]').first();
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-testid="todo-item"]')).toHaveCount(1);
});

test("keyboard: Space on delete fires delete only", async ({ page }) => {
  await addItem(page, "x");
  const del = page.locator('[data-testid="todo-delete"]').first();
  await del.focus();
  await page.keyboard.press("Space");
  await expect(page.locator('[data-testid="todo-item"]')).toHaveCount(0);
});

test("keyboard: Tab order is input -> add -> toggle -> delete", async ({ page }) => {
  await addItem(page, "x");
  await page.locator("body").click(); // reset focus
  await page.keyboard.press("Tab");
  await expect(page.locator('[data-testid="todo-input"]')).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator('[data-testid="todo-add"]')).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator('[data-testid="todo-toggle"]').first()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator('[data-testid="todo-delete"]').first()).toBeFocused();
});

// --- Requirement: Test hooks ---

test("hooks: all data-testid anchors are present after one item is added", async ({ page }) => {
  await addItem(page, "x");
  for (const id of [
    "todo-input",
    "todo-add",
    "todo-list",
    "todo-item",
    "todo-toggle",
    "todo-delete",
  ]) {
    await expect(page.locator(`[data-testid="${id}"]`)).toHaveCount(1);
  }
});