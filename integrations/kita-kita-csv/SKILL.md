---
name: kita-kita-csv
description: Generates Kita-Kita attendee import CSV (id, first_name, last_name, optional email and E.164 phone). Use when exporting a roster for Kita-Kita, producing an attendance CSV, or integrating another app with Kita-Kita People import.
---

# Kita-Kita attendee CSV

Kita-Kita is local-first. There is **no HTTP API**. Produce a UTF-8 CSV; the organizer imports it on **People → Import CSV**.

Do not generate QR payloads, transfer frames, or call Kita-Kita internals.

## Output

Canonical headers (emit these, not camelCase):

```csv
id,first_name,last_name,email,phone_number
```

| Column | Required | Rules |
|---|---|---|
| `id` | yes | Unique in the file. Import merges by case-insensitive id; check-ins are kept. |
| `first_name` | yes | Trimmed. Quote if the value contains a comma. |
| `last_name` | yes | Trimmed. Quote if the value contains a comma. |
| `email` | no | RFC-style address; Kita-Kita lowercases it. |
| `phone_number` | no | E.164 only, e.g. `+639171234567`. Not `0917…`. |

RFC 4180 quoting. Optional UTF-8 BOM is accepted. Blank lines are ignored.

See [attendee-import.schema.json](attendee-import.schema.json) and [examples/attendees.csv](examples/attendees.csv).

## Privacy

Only these fields. Do not add government IDs, birthdates, health data, or other PII. Extra columns are ignored on import and must not be sent (RA 10173 data minimization). Use synthetic or source-system data the organizer is already allowed to process.

## Accepted header aliases

If the source system cannot rename columns, these also parse: `firstname` / `first` / `First Name`; `lastname` / `last` / `Last Name`; `email_address`; `phone` / `phonenumber` / `mobile` / `contact_number`. Prefer canonical names in new exporters.

## Row skip behavior

A row is skipped (not imported) when id/first/last is missing, `id` is duplicated in the file, email is present but invalid, or phone is present but not E.164.
