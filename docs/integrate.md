# Integrate with Kita-Kita

Kita-Kita is local-first. There is **no HTTP API** and no cloud sync for other applications to call.

The integration surface is an **attendee CSV**. Your app exports the file; the organizer imports it in the app on **People → Import CSV**.

## Produce the CSV

Canonical columns: `id`, `first_name`, `last_name`, optional `email`, optional `phone_number` (E.164, e.g. `+639171234567`).

- [JSON Schema](../integrations/kita-kita-csv/attendee-import.schema.json) — one row
- [Example CSV](../integrations/kita-kita-csv/examples/attendees.csv) — synthetic roster
- [Agent skill](../integrations/kita-kita-csv/SKILL.md) — copy this folder into `.cursor/skills/` or `.claude/skills/` in the exporting app
- [`parseAttendeeCsv`](../src/lib/attendance.ts) — canonical parser; change the schema in the same change as the parser

UTF-8, RFC 4180 quoting, optional BOM. Import **merges** by case-insensitive `id` and does not clear check-ins. Duplicate ids, invalid emails, and non-E.164 phones skip that row.

## Privacy

Only collect fields needed for attendance. Do not add government IDs, birthdates, health records, or other extra PII (RA 10173 data minimization). Unknown columns are ignored on import and must not be sent.

## Out of scope

Attendee QR codes and device-transfer QR frames are not a public integration contract.
