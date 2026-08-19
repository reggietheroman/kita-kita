---
name: update-user-journey-diagrams
description: Update Kita-Kita user-journey diagrams (docs/app-flows.md and optional canvas) only after the journey’s blast-radius code changes are committed and tested. Use when diagrams are missing or drift from the current committed behavior.
---

# Update user-journey diagrams

Use this when updating `docs/app-flows.md` to match committed, tested behavior.

## Workflow

1. Identify which user-journey IDs in [`docs/app-flows.md`](docs/app-flows.md) are affected by the *committed* screen/code changes (ignore uncommitted edits).
2. Verify those changes are already on HEAD (no partial “dirty” commit in the same work as the diagram update).
3. Read the corresponding journey section(s) and update:
   - the Mermaid flowchart
   - screen/route pointers
   - empty-state copy + actual CTAs
   - the journey-to-E2E mapping row(s)
4. If a user-journey step was only refactored (no user-visible path change), do not rewrite the diagram.
5. Update the canvas only if it’s a “view” of the committed doc (no second source of truth).
6. Commit the diagram update separately (e.g., `Docs`), after tests run.

## Guardrails

- Do not edit journey diagrams in the same dirty working tree as the screen edits.
- Keep journey IDs stable; treat them as keys used by rules.
