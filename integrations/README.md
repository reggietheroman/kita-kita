# Kita-Kita integration kit

The [`kita-kita-csv`](kita-kita-csv/) folder is a copyable integration kit for
applications and coding agents that need to produce attendee imports for
Kita-Kita.

## Use it in another project

Copy the complete folder:

```text
integrations/kita-kita-csv/
```

Place it in the other project as either:

```text
.cursor/skills/kita-kita-csv/
```

or:

```text
.claude/skills/kita-kita-csv/
```

Keep all of its files together:

- `SKILL.md` — instructions an agent can use when planning or implementing a
  Kita-Kita CSV export
- `attendee-import.schema.json` — the canonical CSV row contract
- `examples/attendees.csv` — a valid synthetic example

The copied kit works offline. The agent does not need access to the Kita-Kita
GitHub repository. It only needs access to the other project’s source code and
the copied kit.

After copying it, ask the agent:

```text
Use the Kita-Kita CSV skill to plan an integration for this project.
Inspect the existing attendee data model and propose how to export a
Kita-Kita-compatible CSV. Do not modify files yet.
```

When the plan is approved, ask it to implement the export, validate the output
against the included schema, and add tests based on the example CSV.

Do not copy real attendee data into the kit. The example file must remain
synthetic and must not contain unnecessary personal information.
