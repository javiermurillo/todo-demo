# Coding Standards

Repo-specific standards for `~/Projects/demo-todo`. Short, opinionated,
overridable by a written decision in `design.md` for any given change.

## Stack

- **Vanilla HTML/CSS/JS only.** No frameworks, no bundlers, no
  transpilers. The page must open via `file://` and work without
  a server.
- **OpenSpec** for spec-driven development.
- **Playwright** for end-to-end tests, Chromium-only.

If a change needs anything else, declare it in the change's
`design.md` `## Decisions` and update this file in the same PR.

## File layout

```
~/Projects/demo-todo/
├── index.html                  # the page
├── assets/
│   ├── style.css               # all styling
│   └── app.js                  # all behavior
├── tests/
│   └── *.spec.mjs              # Playwright specs
├── scripts/
│   └── hooks/                  # git hooks (tracked)
├── openspec/
│   └── changes/<change-id>/
│       ├── proposal.md
│       ├── design.md
│       ├── tasks.md
│       └── specs/<cap>/spec.md
├── docs/
│   ├── kanban-openspec-policy.md
│   └── CODING_STANDARDS.md
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── package.json
└── playwright.config.mjs
```

## Naming

- Files and directories: `kebab-case`.
- Variables, classes, functions: `camelCase` for JS, `kebab-case` for
  CSS classes.
- OpenSpec change id and capability name: `kebab-case` nouns (e.g.
  `todo-arcade-crt-static-ui`, capability `todo-app`).
- Do not abbreviate. If a name needs a comment, it is the wrong name.

## CSS rules

- Palette tokens live in `:root` (e.g. `--neon-magenta`, `--bg`).
  No raw hex literals outside `:root`.
- Every container: `border-radius: 0` and `image-rendering: pixelated`.
- The scanline overlay is `body::before` with `pointer-events: none`.
- No gradients except the scanline `repeating-linear-gradient`.
- Drop shadows only as 2px hard offsets to evoke phosphor glow;
  no `filter: blur`.

## JavaScript rules

- Strict mode: `(function () { "use strict"; ... })();` IIFE.
- One IIFE per file. No global pollution.
- Event handlers attached at most once per file.
- Use event delegation on the list container rather than per-item
  listeners.
- Order of guards in `addItem` (or any input-validator): empty-check
  BEFORE trim so a single space is still rejected.
- `data-testid` values for dynamic elements are set in exactly one
  factory function. Static elements (`todo-input`, `todo-add`,
  `todo-list`) live in `index.html`.
- No `localStorage`, `sessionStorage`, `IndexedDB`, `cookies`, or
  any persistence layer.

## Accessibility

- Every interactive control exposes `aria-label` or has visible text.
- Toggles use `aria-pressed="true|false"`, not visual class flips
  alone.
- After `addItem` and `deleteItem`, focus returns to the input.
- Tab order: input → add → toggle → delete (per item, list order).
- Color is never the only signal: toggled items also carry a class
  and an aria attribute.

## Testing

- One Playwright case per scenario in the spec's `spec.md`.
- Test names follow `feature: assertion in plain English`.
- No `retries`. If a test is flaky, fix the test, not the flake.
- `workers: 1` and `fullyParallel: false` in Playwright config —
  `file://` plus parallel contexts produce non-deterministic locator
  resolution.
- A run is only "green" if `npx playwright test` reports
  `N passed` with `N` matching the spec's scenario count.

## Smell baseline (judgement calls)

The Standards axis of code review applies this baseline even when no
documented standard applies. Each smell is a heuristic, never a hard
violation:

- **Mysterious Name**: a function or variable whose name doesn't
  reveal what it does. Rename it.
- **Duplicated Code**: the same logic shape in two places. Extract it.
- **Feature Envy**: a method that reaches into another object's data
  more than its own. Move it.
- **Data Clumps**: same few fields travel together repeatedly. Bundle
  them.
- **Primitive Obsession**: a string standing in for a domain concept.
  Give it a small type.
- **Shotgun Surgery**: one logical change forces scattered edits
  across many files. Gather what changes together.
- **Speculative Generality**: hooks for needs the spec doesn't have.
  Delete until a real need shows.
- **Message Chains**: `a.b().c().d()` the caller shouldn't depend on.
  Hide the walk.

## Anti-patterns (hard violations in this repo)

- Adding a framework, a bundler, or a transpiler.
- Adding persistence (`localStorage` and friends).
- Adding `border-radius: <non-zero>` anywhere.
- Adding a `data-testid` outside the factory or `index.html`.
- Bypassing `pre-commit` or `pre-push` with `--no-verify` and pushing.
- Including `Co-Authored-By:` or `🤖 Generated with ...` in commits
  or PR bodies.
- Opening a PR without an OpenSpec change folder, or whose change
  folder fails `openspec validate --strict`.

## OpenSpec authoring

- Use the delta header `## ADDED Requirements` for new requirements,
  `## MODIFIED Requirements` for changes, `## REMOVED Requirements`
  for deletions, `## RENAMED Requirements` for renames.
- Each `### Requirement:` block must contain one or more
  `#### Scenario:` blocks.
- Scenarios use the shape `- **WHEN** ...`, `- **THEN** ...`,
  `- **AND** ...`. OpenSpec scenarios are WHEN/THEN, not
  GIVEN/WHEN/THEN.
- Every scenario must be verifiable by a Playwright case. Vague
  scenarios ("the system SHALL work correctly") are rejected in
  review.