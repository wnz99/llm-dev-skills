# Structured Review Output Schema

When running review mode, you can optionally request structured JSON output.

This is the canonical machine-readable review contract for skills in this
repository. Human-facing skills may use `High`, `Medium`, `Low`, and `Nit`; map
those labels to `P1`, `P2`, `P3`, and `P3` respectively when serializing this
schema. Reserve `P0` for an immediate critical risk. This compatibility mapping
does not change existing human-facing blocking rules or dual-verdict workflows.

> **Note:** The `--output-schema` flag is only available with the Codex
> provider. For OpenCode, include "Respond with JSON matching this schema:"
> in the prompt and append the schema below.

## Schema

```json
{
  "type": "object",
  "properties": {
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "severity": {
            "type": "string",
            "enum": ["P0", "P1", "P2", "P3"]
          },
          "file": {
            "type": "string"
          },
          "line_range": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "suggestion": {
            "type": "string"
          }
        },
        "required": ["severity", "file", "title", "description"],
        "additionalProperties": false
      }
    },
    "summary": {
      "type": "string"
    },
    "verdict": {
      "type": "string",
      "enum": ["APPROVE", "APPROVE_WITH_CONCERNS", "REQUEST_CHANGES"]
    }
  },
  "required": ["findings", "summary", "verdict"],
  "additionalProperties": false
}
```

## Usage

### Codex

```bash
test -n "${LLM_ASSIST_TMPDIR:-}" && test -d "$LLM_ASSIST_TMPDIR" || {
  printf '%s\n' "LLM_ASSIST_TMPDIR must name an existing temporary directory" >&2
  exit 1
}
SCHEMA_FILE=$(mktemp "$LLM_ASSIST_TMPDIR/codex-schema.XXXXXX.json")
case "$SCHEMA_FILE" in
  "$LLM_ASSIST_TMPDIR"/*) ;;
  *) printf '%s\n' "Schema file escaped LLM_ASSIST_TMPDIR" >&2; exit 1 ;;
esac
test -f "$SCHEMA_FILE" || {
  printf '%s\n' "Schema file was not created" >&2
  exit 1
}
case "$SCHEMA_FILE" in
  *XXXXXX*) printf '%s\n' "mktemp did not resolve correctly" >&2; exit 1 ;;
esac
cat > "$SCHEMA_FILE" << 'SCHEMA'
[paste schema above]
SCHEMA

codex exec \
  -s read-only \
  --ephemeral \
  --output-schema "$SCHEMA_FILE" \
  -o "$OUTPUT_FILE" \
  - < "$PROMPT_FILE"
```

`SCHEMA_FILE` is inside the invocation-level `$LLM_ASSIST_TMPDIR`, so the
existing `cleanup_llm_assist` EXIT/HUP/INT/TERM trap removes it with the other
sensitive artifacts. Keep that trap active through schema creation and Codex
execution.

### OpenCode

Append the schema to the prompt file before the `## Instructions` section:

```markdown
## Output Format
Respond ONLY with valid JSON matching this schema:
[paste schema above]
```

Then run: `opencode run "Follow the instructions in the attached file" -f "$PROMPT_FILE" > "$OUTPUT_FILE" 2>&1`

## Parsing

The output file will contain JSON matching the schema. Parse it to
extract findings by severity and compare with your own review:

```
findings[].severity → P0/P1/P2/P3
findings[].file     → file path
findings[].title    → one-line summary
findings[].description → detailed explanation
findings[].suggestion  → suggested fix (optional)
verdict             → overall assessment
summary             → narrative summary
```
