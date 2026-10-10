## Why

We want a tiny, self-contained demo page that lets a visitor type a short
task, mark it done, and delete it — without any backend, build step, or
installable dependency. The intent is to validate a single design idea
in isolation: that an "arcade CRT" pixel-art aesthetic (scanlines, neon,
bitmap font) makes a personal todo list feel deliberately playful rather
than utilitarian.

Today there is no such page anywhere on the machine — the closest
reference point (`aqui-estoy/`) is a Spanish-language incident-response
project whose domain vocabulary is unrelated.

## What Changes

- Add a single static `index.html` at the repo root that renders the
  todo app (input, list, items).
- Add `assets/style.css` implementing the arcade CRT visual system:
  scanlines overlay, neon palette, bitmap font via `@font-face`,
  hard-pixel borders (`image-rendering: pixelated`).
- Add `assets/app.js` providing the in-page todo behavior (add, toggle
  done, delete) entirely client-side. No `localStorage`, no fetch,
  no service worker.
- Reserve a `data-testid` on every interactive element so a future
  Playwright slice can hook into them without re-tagging markup.

## Capabilities

### New Capabilities

- `todo-app` — A static, client-only todo list page with an arcade CRT
  pixel-art visual style.

## Impact

- New files (added under `~/Projects/demo-todo/`):
  - `index.html` — full document; references `assets/style.css` and
    `assets/app.js`.
  - `assets/style.css` — palette tokens, scanline overlay, bitmap font
    declaration, layout.
  - `assets/app.js` — DOM event wiring for add / toggle / delete.
- New test files (added under `tests/`):
  - `tests/todo.spec.mjs` — Playwright spec covering each scenario in
    `specs/todo-app/spec.md` (run via `npx playwright test`).
- Dependencies (added at repo root):
  - `package.json` declaring `@playwright/test` as a devDependency
    and a `test:e2e` script (`"test:e2e": "playwright test"`).
  - `.gitignore` excluding `node_modules/`, `test-results/`,
    `playwright-report/`.
- No backend, no build step, no framework. Opening `index.html`
  directly in a browser must work.

## Out of scope (explicit non-goals)

- Persistence across reloads (no `localStorage`, no IndexedDB).
- Editing an existing todo in place (delete + re-add is acceptable).
- Drag-to-reorder.
- Multi-user, sync, accounts, sharing.
- Theming switcher / dark-mode toggle. The CRT look IS the theme.
- Any CSS framework, any JS framework, any bundler.