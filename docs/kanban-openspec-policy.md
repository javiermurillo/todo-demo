# Kanban ↔ OpenSpec policy

This repo enforces a 1:1 binding between Kanban tasks (board `todo-demo`)
and OpenSpec changes.

## Rule

For every task on the active Kanban board (`todo-demo`) that is not
in a terminal state (`done`, `archived`, `cancelled`), there must
exist a directory:

    openspec/changes/<task-slug>/

containing the OpenSpec change (`proposal.md`, `design.md`,
`tasks.md`, and at least one `specs/<capability>/spec.md`). The
slug of the task IS the change id, kebab-case.

The change must validate cleanly:

    openspec validate <task-slug> --strict

## Where it is enforced

The pre-commit hook at `scripts/hooks/pre-commit` performs two
checks, in this order:

1. **Staged-diff check.** If the staged diff touches
   `openspec/changes/<id>/` for any non-archived `<id>`, run
   `openspec validate <id> --strict` and block on failure. This
   catches typos and broken spec deltas before they land.

2. **Kanban binding check.** If the staged diff touches anything
   under `assets/`, `index.html`, or `tests/`, look up the active
   Kanban board. For every task on that board in a non-terminal
   state, require that `openspec/changes/<task-slug>/` exists and
   that the change validates. Block on any missing or invalid
   change.

The hook is registered via:

    git config core.hooksPath scripts/hooks

A fresh clone must run that command (or have it set in
`.gitconfig`) before contributing. A future CI step will
re-run the same checks.

## Why

The user wanted:

- Auto-bloqueo total: no se puede commitear código mientras un
  change de OpenSpec esté roto.
- Regla 1:1 entre task y change.
- Hook versionado solo en este repo, no global.
- Granularidad de commits: 1 commit por task, squash al final
  antes del PR.

This file is the human-readable contract. The hook is the
machine-readable enforcement.

## Scope (today)

- Active board: `todo-demo`.
- Terminal states exempt from the binding check: `done`,
  `archived`, `cancelled`.
- No retroactivity: changes already archived (`archive/<id>/`)
  are not re-validated by the Kanban check.

## How an agent should comply

1. Claim a task on the board (e.g. `hermes kanban claim <slug>`).
2. **Before the first code commit**, create the matching change:
   ```
   mkdir -p openspec/changes/<task-slug>/specs/<cap>
   # write proposal.md, design.md, tasks.md, specs/<cap>/spec.md
   ```
3. `openspec validate <task-slug> --strict` must pass.
4. Now code freely. The hook will only re-check the change when
   its files are touched.

## How to change the active board

The hook currently hard-codes `todo-demo`. To change it, update the
`ACTIVE_BOARD` line at the top of `scripts/hooks/pre-commit` and
commit the hook change.