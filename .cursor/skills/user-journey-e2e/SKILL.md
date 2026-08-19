---
name: user-journey-e2e
description: Map Kita-Kita user journeys to Playwright E2E suites and add/adjust tests so each journey is reachable and asserted. Use when updating `e2e/*.spec.ts` or the journey-to-E2E mapping in docs/app-flows.md.
---

# User-journey E2E

Use this when a change affects a user journey and you need to keep the journey’s Playwright coverage aligned with committed behavior.

## Workflow

1. Read the affected journey ID(s) in [`docs/app-flows.md`](docs/app-flows.md).
2. Find the mapped Playwright suite(s) in `e2e/`.
3. Extend existing specs when it’s still the same user journey and automation is stable.
4. Split long journeys into multiple `describe()` blocks/suites when it improves clarity.
5. Prefer reachable UI assertions (buttons, navigation, copy, masked values).
6. If barcode decode via `expo-camera` is involved, do not invent brittle camera-frame injection; cover the reachable scanner UI paths (permission copy, close/back, non-camera actions).
7. Update the journey-to-E2E mapping row(s) in `docs/app-flows.md` whenever you add/modify mapped suites.
8. Run `npm run test:e2e` (or the smallest applicable subset) before considering the work done. Do not create git commits unless the user explicitly asks.

## Split/coverage guidance

- Meeting create + meeting detail assertions live in `e2e/meetings.spec.ts`.
- Attendee list/CRUD assertions live in `e2e/attendees.spec.ts`.
- Attendance counts, transfer navigation, and meeting-action flows live in `e2e/attendance.spec.ts`.
