# In-Depth Analysis Procedures

Read this file in full before step 5 (In-Depth Analysis) whenever you perform
the analysis: as the reviewer leaf, or as the controller in an inline review.
It holds the review pillars, the cross-file tracing procedure, and the
mandatory dead-code assessment that every proper review requires. The
untrusted-evidence rule and the Mandatory Clean-Code Assessment remain in
`SKILL.md`.

## Review Pillars

Analyze the code changes based on the following pillars:

*   **Correctness**: Does the code achieve its stated purpose without bugs or logical errors?
*   **Maintainability**: Is the code clean, well-structured, and easy to understand and modify in the future? Consider factors like code clarity, modularity, and adherence to established design patterns.
*   **Readability**: Is the code well-commented (where necessary) and consistently formatted according to our project's coding style guidelines?
*   **Efficiency**: Are there any obvious performance bottlenecks or resource inefficiencies introduced by the changes?
*   **Security**: Are there any potential security vulnerabilities or insecure coding practices?
*   **Edge Cases and Error Handling**: Does the code appropriately handle edge cases and potential errors?
*   **Testability**: Is the new or modified code adequately covered by tests (even if preflight checks pass)? Suggest additional test cases that would improve coverage or robustness.

## Deep Cross-File Impact Analysis

Trace relevant call and dependency paths across files instead of
reviewing each file in isolation. Apply this to public functions, classes,
modules, components, handlers, CLI commands, jobs, adapters, shared types,
configuration contracts, persistence boundaries, external SDK/API calls, and
documented invariants. For an internal change with no exported surface, trace
the nearest meaningful entrypoint and side-effect or invariant boundary.

Build a lightweight directed map of the relevant program flow:

*   **Nodes**: Changed functions/classes/modules and important callers/callees.
*   **Edges**: Imports, direct calls, interface implementations, inheritance,
    dependency injection, factory/registry resolution, event/subscription
    wiring, routing, reflection, dynamic loading, or external API/SDK calls.

Walk the graph far enough to reach the user-facing entrypoint, persistence
boundary, external system boundary, or invariant boundary. Check whether intent
and contracts still propagate correctly across the chain, including:

*   Flags and modes such as force, dry-run, overwrite, locking, retry,
    pagination, authentication, authorization, caching, and idempotency.
*   Argument shape, return shape, nullability, error behavior, async/concurrency
    behavior, side effects, ordering assumptions, and resource ownership.
*   Semantic contract drift that type checkers may miss, especially around
    loose types, raw maps/dictionaries, JSON-like metadata, generated records,
    optional fields, erased generics, unchecked casts, or untyped external data.
*   Runtime reachability through dynamic mechanisms such as plugin loaders,
    registries, factories, service locators, reflection, string-based routing,
    dynamic imports/requires, or dependency injection containers.
*   Error propagation across module boundaries, including whether thrown or
    returned failures are caught, translated, retried, surfaced, or documented.
*   Shared-state mutation and coordination, including transaction, locking,
    concurrency, cache-invalidation, and lifecycle assumptions.
*   Circular dependencies and coupling that can change initialization order or
    make the modified behavior depend on an unstable internal contract.

For dynamic paths that cannot be proven statically, state the uncertainty and
name the runtime mechanism involved. Report concrete breakages, brittle
implicit contracts, or high-risk unverified paths; do not expand into unrelated
whole-repo review.

## Mandatory Dead-Code And Cleanup Assessment

Inspect changed code and affected callers for unused helpers, obsolete wrappers,
unreachable branches, redundant checks already guaranteed by earlier control
flow, and orphaned imports, exports, tests, configuration, or documentation.
Trace deletions as well as additions: verify replacement callers and check that
removing a symbol did not strand consumers. Use available static tools as leads,
then validate each candidate against source and contracts.

Before declaring code dead, check entrypoints, public API consumers, dynamic
registries, framework hooks, reflection, and configuration-driven use. No direct
callers or only test references is insufficient evidence: tests may protect a
supported API. Conversely, an export and a test that merely preserve an obsolete
internal wrapper do not justify keeping it after its role has been replaced.
Preserve behavior tests when removing implementation-only tests.

Record checked paths, reachability evidence, confirmed removals or required
cleanup, and reasons for retaining uncertain candidates in the review's trace
coverage. If this assessment cannot be completed, report `Incomplete`, not
`Clean`. Confirmed dead code introduced or made obsolete by the change requires
cleanup before approval; treat that as a Medium requirement gap unless its
impact warrants High. Pre-existing unrelated candidates do not expand the review
scope. When the user requested broader cleanup, apply the same evidence standard
throughout that authorized scope.

Review-only requests report the cleanup and remain read-only; fix-loop cleanup
rules live in [`review-loops.md`](review-loops.md) section B, step 3.
