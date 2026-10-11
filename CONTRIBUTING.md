# Contributing

This repo uses OpenSpec-driven development with a Kanban board binding.
Read this end-to-end before opening a PR.

## TL;DR

1. Pick a task on the active Kanban board (`todo-demo`). When you
   create it, pass `--idempotency-key=<kebab-slug>`. That slug is the
   OpenSpec change id.
2. Author the change folder: `openspec/changes/<slug>/` with
   `proposal.md`, `design.md`, `tasks.md`, and at least one
   `specs/<capability>/spec.md` containing `## ADDED Requirements`.
3. `openspec validate <slug> --strict` must pass.
4. Branch off `main`: `git checkout -b feat/<slug>`.
5. One Conventional Commit per task on the branch; the PR will
   squash-merge.
6. Open the PR against `main`. The pre-commit and pre-push hooks
   will refuse any code-touching commit without a valid change.

## Commit messages — Conventional Commits

Subject: `type(scope): subject`. The scope in this repo is a single
value: `todo-demo`. Examples: `feat(todo-demo): add arcade CRT page`,
`test(todo-demo): red phase — failing playwright spec`,
`chore(repo): wire openspec pre-commit hook`.

Types accepted in this repo: `feat`, `fix`, `test`, `chore`, `docs`,
`refactor`. Anything else is rejected in code review.

Subject constraints:
- ≤72 characters.
- Imperative mood (`add`, not `added`).
- No trailing period.
- No `Co-Authored-By:` trailer. No `🤖 Generated with ...` footer.

Body constraints:
- Wrap at 72 columns.
- Explain *why*, not *what*. The diff shows what; the body shows why.
- Reference the OpenSpec change id once at the bottom:
  `OpenSpec: openspec/changes/<slug>/`.

## OpenSpec is mandatory

Every PR must link to exactly one OpenSpec change folder under
`openspec/changes/<slug>/`. No change folder → no PR. No PR → no merge.

The change must contain:
- `proposal.md` — Why / What Changes / Capabilities / Impact / Out of scope.
- `design.md` — Context / Goals / Non-Goals / Decisions / Risks / Migration.
- `tasks.md` — RED / GREEN / REFACTOR / Integration validation.
- `specs/<capability>/spec.md` — at least one `## ADDED Requirements`
  block with one or more `#### Scenario:` entries.

Validate locally before opening the PR:

```bash
openspec validate <slug> --strict
```

## Kanban ↔ OpenSpec binding

Tasks on the active Kanban board (`todo-demo`) are bound 1:1 to
OpenSpec changes via the task's `idempotency_key`. The slug of the
key MUST equal the change folder name and MUST be kebab-case.

```bash
hermes kanban --board todo-demo create \
  --idempotency-key=<kebab-slug> "<title>"
```

The pre-commit and pre-push hooks enforce this: any commit that
touches `assets/`, `index.html`, or `tests/` will be rejected if
the active board has any non-terminal task whose
`idempotency_key` does not resolve to a valid change folder.

See `docs/kanban-openspec-policy.md` for the full contract and
`docs/CODING_STANDARDS.md` for the smell baseline.

## Local setup

Fresh clone:

```bash
git config core.hooksPath scripts/hooks
npm install
npx playwright install chromium
```

Without `core.hooksPath` set, the binding checks do not run and
commits will not be validated.

## PR workflow

1. Branch: `feat/<change-id>`.
2. Commits: one Conventional Commit per task on the branch.
3. Open the PR against `main`. Fill the PR template (see
   `.github/PULL_REQUEST_TEMPLATE.md`) — the five sections
   (Resumen, Cambios por archivo, Validación, Scope, Dependencias)
   are non-optional.
4. Reviewer checklist before merging:
   - `openspec validate <change-id> --strict` is green.
   - `npx playwright test` is green (full suite).
   - `git diff --stat origin/main..HEAD` only touches files in the
     PR's declared scope.
   - No drive-by commits (`git log --format='%h %s' origin/main..HEAD`
     shows only work tied to the change).
5. Merge strategy: **1 squash commit per merge**. Do not preserve
   the branch's per-task history in `main`; keep it in the PR body
   and in the OpenSpec change folder's `tasks.md`.
6. After merge: archive the change:
   ```bash
   openspec archive <change-id>
   ```
   Skipping the archive step breaks the workflow invariant that
   `openspec/changes/` (excluding `archive/`) contains only unmerged
   work.

## What the hooks check

`scripts/hooks/pre-commit` and `scripts/hooks/pre-push` both run:
1. STAGED-DIFF check — any non-archived `openspec/changes/<id>/`
   touched must validate.
2. KANBAN BINDING check — any commit touching `assets/`, `index.html`
   or `tests/` requires every non-terminal task on board `todo-demo`
   to have an `idempotency_key` whose `openspec/changes/<key>/`
   validates.

The pre-push hook is the second gate: even if you bypass the
pre-commit hook with `--no-verify`, the push is still rejected.

## Out of scope (do not add)

- Frameworks (React, Vue, Svelte, Tailwind, Bootstrap).
- Build tooling (Vite, Webpack, esbuild).
- Persistence (localStorage, IndexedDB, cookies).
- Authentication or accounts.
- Multiple boards. This repo has one active board: `todo-demo`.
  To add another, update the `ACTIVE_BOARD` line in
  `scripts/hooks/pre-commit` and `scripts/hooks/pre-push` and amend
  the binding policy.