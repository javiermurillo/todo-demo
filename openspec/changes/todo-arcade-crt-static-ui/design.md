## Context

Mirrors `proposal.md`. The code surface being introduced is brand-new:
no existing files in `~/Projects/demo-todo/` are modified. The page is
a single HTML document plus two assets, plus a Playwright test harness
that the implementer will run via `npx playwright test`.

The "arcade CRT" aesthetic is concrete and bounded:

- **Palette**: deep near-black background `#0b0a1a`, neon magenta
  `#ff2bd6`, neon cyan `#22f6ff`, neon yellow `#fff066`. No
  gradients, no drop-shadows other than the 2-pixel hard offset used
  to evoke phosphor glow.
- **Font**: a single bitmap font (e.g. "Press Start 2P" from Google
  Fonts, or the locally-hosted equivalent) loaded via `@font-face`;
  the base font size is `16px` and the rest of the UI scales by
  integer multiples only (no fractional rem).
- **Scanlines**: a `::before` overlay using `repeating-linear-gradient`
  at ~2px / 2px transparent, with `pointer-events: none` so it never
  blocks clicks.
- **Borders**: every container uses `border: 2px solid <neon>` and
  `image-rendering: pixelated` so any future raster art does not
  blur.

## Goals / Non-Goals

**Goals**

- A single static page that any visitor can open by double-clicking
  `index.html` — no server required.
- Three behaviors only: add, toggle done, delete.
- The arcade CRT look is unmistakable: scanlines visible, bitmap
  font in use, neon palette, no rounded corners.
- Every interactive element is reachable and operable with the
  keyboard alone.
- Every interactive element exposes a stable `data-testid`.

**Non-Goals**

- Persistence, edit-in-place, drag-to-reorder, theming, accounts.
- Any tooling beyond Playwright for verification.

## Decisions

1. **Vanilla HTML/CSS/JS over a framework.** Decision: no React, no
   Vite, no Tailwind. Rationale: the user explicitly asked for a
   static UI; a framework adds install + build steps that contradict
   the "open the file and it works" promise. Trade-off accepted:
   no component model, no JSX, manual DOM wiring.

2. **Google Fonts CDN for the bitmap font.** Decision: load
   `Press Start 2P` via `<link rel="stylesheet">` from
   `fonts.googleapis.com`. Rationale: zero-binary, zero-license-fuss,
   one line of HTML. Trade-off accepted: the page requires network
   on first load for the font; if offline, the browser falls back to
   `monospace` and the visual degrades gracefully (documented in
   `specs/todo-app/spec.md` as the offline scenario).

3. **`data-testid` reserved up-front even though no test exists yet.**
   Decision: add `data-testid="todo-input"`, `todo-add"`,
   `todo-list"`, `todo-item"`, `todo-toggle"`, `todo-delete"` on the
   initial markup. Rationale: per the skill's "reserve hooks for
   downstream slices" rule, this prevents the Playwright slice from
   having to re-touch `index.html`. Trade-off: a hostile reviewer may
   flag them as dead code; the reservation is documented in
   `proposal.md` `## What Changes`.

4. **One Playwright spec file, one browser (Chromium) only.**
   Decision: `tests/todo.spec.mjs` runs under `@playwright/test` with
   the default Chromium project; no Firefox, no WebKit. Rationale: the
   surface is small and the look is the same across engines; we are
   not shipping cross-browser parity as a feature. Trade-off: a
   Firefox rendering bug would not be caught here.

5. **No service worker, no cache header, no `meta http-equiv`.**
   Decision: rely on the browser's default cache for `index.html`,
   `style.css`, `app.js`. Rationale: the page is meant to be opened
   from disk; service workers complicate that and add install prompts.

## Risks / Trade-offs

- **Bitmap font network dependency.** If Google Fonts is blocked,
  the page falls back to `monospace` and loses the pixel look.
  Accepted; documented in the offline scenario.
- **No persistence.** Reloading the page empties the list. Accepted;
  explicit non-goal.
- **Hard-coded neon palette.** Changing the theme requires editing
  the CSS file. Accepted; no theme switcher is in scope.
- **Chromium-only test coverage.** A rendering regression on Firefox
  or Safari would not be caught here. Accepted for this demo; not
  acceptable for production, which is not what this is.

## Migration Plan

None. This is the first change in a brand-new repo. There is no
existing behavior to migrate away from.