# Tasks — todo-arcade-crt-static-ui

This change ships a single static page plus a Playwright spec. The RED
phase writes the failing tests; the GREEN phase writes the minimum
page to make them pass; the REFACTOR phase extracts nothing
structural (the page is small enough already) but tightens CSS
tokens and event wiring.

## 1. RED — demonstrate the failing behavior

Each item below adds a Playwright case in `tests/todo.spec.mjs` that
must fail before the corresponding GREEN step lands.

- [x] **Add: empty input is rejected.**
  Test: with `page.goto("file://" + repo + "/index.html")`,
  `page.locator('[data-testid="todo-input"]').fill("")` and click
  `[data-testid="todo-add"]`; assert `todo-list` has no `todo-item`
  children. Run `npx playwright test tests/todo.spec.mjs -g "empty input"`
  — must be RED today.

- [x] **Add: non-empty input appends one item.**
  Test: fill input with `"buy milk"`, click Add, assert exactly one
  `todo-item` appears with text "buy milk" and input is cleared. Run
  `npx playwright test -g "appends one item"` — must be RED.

- [x] **Add: leading/trailing whitespace is trimmed.**
  Test: fill input with `"  buy milk  "`, click Add, assert item text
  is `"buy milk"`. Run `npx playwright test -g "whitespace is trimmed"`
  — must be RED.

- [x] **Toggle: marking done applies `aria-pressed="true"` and `done`
  class.** Test: add `"x"`, click its toggle, assert
  `aria-pressed="true"` and class list contains `done`. Run
  `npx playwright test -g "marking done"` — must be RED.

- [x] **Toggle: unmarking restores.**
  Test: toggle twice, assert `aria-pressed="false"` and `done` class
  removed on the second click. Run `npx playwright test -g "unmarking"`
  — must be RED.

- [x] **Delete: removes exactly the targeted item.**
  Test: add `"a"` and `"b"`, click delete on the first item, assert
  only `"b"` remains. Run `npx playwright test -g "deleting"` — must
  be RED.

- [x] **Delete: empty list still has the list container.**
  Test: add `"x"`, delete it, assert `todo-list` exists with zero
  children and input has focus. Run `npx playwright test -g "empty list"`
  — must be RED.

- [x] **Visual: bitmap font is the rendered typeface.**
  Test: read computed `font-family` of `body`; assert it starts with
  `"Press Start 2P"`. Run `npx playwright test -g "bitmap font"` —
  must be RED.

- [x] **Visual: scanline overlay is non-blocking.**
  Test: assert `body::before` has `pointer-events: none` (via
  `evaluate` reading the rule) AND clicking through it lands on a
  todo item. Run `npx playwright test -g "scanline"` — must be RED.

- [x] **Visual: hard pixel borders everywhere.**
  Test: assert each container's computed `border-radius` is `0px`.
  Run `npx playwright test -g "pixel borders"` — must be RED.

- [x] **Keyboard: Enter in input adds the item.**
  Test: focus input, fill `"z"`, press Enter, assert one item
  appears. Run `npx playwright test -g "Enter in input"` — must be
  RED.

- [x] **Keyboard: Tab order is input → add → toggle → delete …**
  Test: from a fresh page, Tab N times and assert focus matches the
  expected sequence. Run `npx playwright test -g "Tab order"` — must
  be RED.

- [x] **Hooks: every interactive element carries its `data-testid`.**
  Test: assert presence of all six anchors on a freshly loaded page
  with one item. Run `npx playwright test -g "data-testid"` — must
  be RED.

Re-run the whole §1 set together with
`npx playwright test` — every case must fail before §2 begins.

## 2. GREEN — minimum change to pass

- [x] **Add `package.json`** declaring `@playwright/test` as a
  devDependency and a `"test:e2e": "playwright test"` script. Run
  `npm install` — must succeed.

- [x] **Add `.gitignore`** excluding `node_modules/`,
  `test-results/`, `playwright-report/`.

- [x] **Create `index.html`** with:
  - `<!doctype html>`, `<html lang="en">`, charset + viewport meta.
  - `<link rel="stylesheet" href="assets/style.css">`.
  - `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap">`.
  - `<h1>`, an `<input data-testid="todo-input">`, an
    `<button data-testid="todo-add">ADD</button>`, and a
    `<ul data-testid="todo-list">`.
  - `<script src="assets/app.js" defer></script>`.

- [x] **Create `assets/app.js`** with handlers for:
  - Click on Add → append item.
  - `keydown` Enter on input → same as click Add.
  - Click on toggle → flip `aria-pressed` and `done` class.
  - Click on delete → remove the containing item.
  - Each new item carries `data-testid="todo-item"`,
    `data-testid="todo-toggle"`, `data-testid="todo-delete"`.

- [x] **Create `assets/style.css`** with:
  - `:root` custom properties for the four palette tokens
    (`--bg`, `--neon-magenta`, `--neon-cyan`, `--neon-yellow`).
  - `body { background: var(--bg); font-family: "Press Start 2P", monospace; }`.
  - `body::before { content:""; position:fixed; inset:0; pointer-events:none; background: repeating-linear-gradient(...); }`.
  - All containers `border: 2px solid <neon>; border-radius: 0; image-rendering: pixelated;`.
  - `.todo-item.done { text-decoration: line-through; opacity: 0.5; }`.

Re-run `npx playwright test` — all §1 cases must be GREEN.

## 3. REFACTOR — extract and harden

- [x] Confirm palette is referenced only via custom properties (no
  raw hex literals outside `:root`). Re-run §1 — must stay GREEN.

- [x] Confirm the item factory in `assets/app.js` is the only place
  that creates `data-testid` values (grep for `data-testid` outside
  that function — must be zero). Re-run §1 — must stay GREEN.

- [x] Add a short comment at the top of `assets/app.js` documenting
  the order of guards: empty-input check before read of `value`. No
  behavior change.

## 4. Integration validation

- [x] `cd ~/Projects/demo-todo && npx playwright install chromium`
  succeeds.
- [x] `npx playwright test` — full suite GREEN.
- [x] `openspec validate todo-arcade-crt-static-ui --strict` —
  GREEN.
- [x] Open `index.html` directly in a browser via `file://` and
  visually confirm scanlines, bitmap font, neon palette. Document
  with a screenshot saved to `docs/screenshot.png` (out of scope
  for the PR but useful as validation evidence).
- [x] **Branch hygiene:** this change has no parent branch
  dependency — it is the first commit in a brand-new repo.
  `git log --oneline` should show a single commit once §3 is
  complete.

## Validation evidence (record before declaring done)

- `npx playwright test` → record pass count and duration.
- `openspec validate todo-arcade-crt-static-ui --strict` → record
  exit code (must be 0).
- Visual confirmation: see `docs/screenshot.png`.
- File scope (must match `proposal.md ## Impact`): `index.html`,
  `assets/style.css`, `assets/app.js`, `package.json`,
  `.gitignore`, `tests/todo.spec.mjs`, this `tasks.md`,
  `proposal.md`, `design.md`, `specs/todo-app/spec.md`.