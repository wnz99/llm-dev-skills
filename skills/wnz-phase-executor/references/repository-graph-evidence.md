# Optional repository graph evidence

Use an available repository knowledge graph, such as Graphify, when it can
reduce uncertainty about cross-module dependencies, blast radius, architectural
hubs, or overlapping pull requests. This is supporting evidence, not a runtime
dependency of the skill and not a replacement for reading source, repository
instructions, or tests.

## Before relying on graph results

1. Confirm the graph belongs to the current repository and covers the relevant
   paths.
2. Confirm it is current enough for the branch and diff under review. Refresh it
   through the installed tool's supported workflow when practical; otherwise
   label the evidence stale and do not use it to justify task ordering or
   parallel safety.
3. Preserve provenance labels such as `EXTRACTED`, `INFERRED`, and `AMBIGUOUS`.
   Verify inferred or ambiguous relationships directly in source before they
   affect ownership, interfaces, wave assignment, or acceptance criteria.

## Useful graph questions

- Which callers, callees, schemas, configuration, and documentation nodes are
  reachable from the symbols being changed?
- Which high-connectivity nodes or communities make the apparent blast radius
  larger than the file diff suggests?
- Do planned parallel tasks or open pull requests overlap through shared nodes,
  communities, or mutable resources?
- What callee-first or dependency-first order best supports implementation and
  verification?

Record useful graph paths and their confidence in current-state evidence. Omit
graph output that does not change the plan, and continue normally when no graph
tool or current graph is available.
