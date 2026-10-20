# Repository test audit

Review the test system and every test for useful failure detection and simpler
maintenance. Success means understandable evidence for material application
risks, not a target test count, coverage percentage, or reduction quota. Apply
the focused workflow's oracle, fidelity, fixture, and verification rules here.

## 1. Understand the application and its risks

Establish the repository/revision and requested boundaries. Read application
entrypoints, contracts, user workflows, persistence and external-effect paths,
and available incident history. Trace enough production behavior to evaluate
test assertions; test names and comments alone do not establish obligations.

Describe important failure scenarios in application terms: who is affected,
what goes wrong, and the consequence. Prioritize core functionality, money,
security/privacy, data integrity, recovery, availability, and other consequences
relevant to this application. Consider exposure, change history, complexity,
past incidents, and uncertainty without manufacturing likelihood estimates.
Do not require every category for every application or every test.

Functional focus does not imply browser-only testing. A deterministic unit test
can faithfully protect a consequential calculation; a database guarantee needs
evidence at the database boundary. Keep inexpensive checks of common behavior
when they provide useful protection, even without catastrophic consequences.
Missing requirements remain questions, not permission to invent or discard them.

## 2. Establish what exists and what runs

Inspect manifests, runner configuration, discovery patterns, scripts, CI jobs,
test environments, fixtures, fakes, mocks, snapshots, and external services.
Compare source inventory with collected test IDs and actual CI commands. Find
tests outside normal discovery, skipped/disabled/quarantined tests, conditional
or generated cases, manual checks, and suites needing unavailable environments.
Exclude vendored/generated artifacts only with an explicit scope reason; review
owned generators and their distinct generated scenarios where applicable.

Record baseline commands and results when safe and available. Separate collected,
executed, skipped, and failed counts; collection is not execution. Check isolation,
shared state, flakiness, retries, setup/teardown safety, dependency fidelity,
feedback time, and duplicated infrastructure. Trace configuration to its actual
consumer; a configured suite may still be absent from CI.

Do not run commands that can affect production or uncontrolled external state.
If collection imports unsafe application code, use static inventory and mark
runtime reconciliation unavailable. Continue with accessible evidence.

## 3. Assess every test, preserving progress

Create a ledger keyed by file and stable test ID or source location. Inspect
each test body, assertions, relevant helpers and fixtures, and the behavior they
exercise. Include every parameterized case, subtest, property, and snapshot
obligation. Equivalent cases may share a row only when their member IDs or input
partition are explicitly listed and individually accounted for. For dynamic or
unbounded generation, record the generator, properties, partitions and limits;
do not pretend that every possible generated input was enumerated.

For each entry, record briefly:

- Protected behavior, plausible failure, and user/business consequence.
- Oracle and boundary fidelity, plus distinct value relative to other tests.
- Maintenance or reliability problem, if any, with source evidence.
- Disposition: **keep**, **simplify**, **consolidate**, **replace**,
  **remove candidate**, or **unresolved**; reason and retained/replacement
  evidence where protection would change.

Use the failure and consequence as the starting question, not a checklist of
test smells. Multiple assertions can express one coherent scenario. Similar
assertions at different boundaries may catch different faults. Check whether
interaction counts, exact text, ordering, or snapshots represent real contracts
before treating them as implementation coupling.

Look for redundant equivalent cases, implementation-derived expectations,
assertions that pass when the feature is broken, unnecessary mocks, incidental
source/structure checks, giant fixtures, and helpers that obscure intent. Prefer
representative input partitions and meaningful boundaries over permutations.
Keep readable scenario detail rather than minimizing lines through abstraction.

For large suites, work in bounded batches with a persistent ledger and explicit
remaining IDs/files. Prioritize risky areas first but finish the inventory.
Reconcile ledger membership against collection and source inventory, not just
equal totals. Mark inaccessible or unassessed tests unresolved. Report assessed
and unresolved totals separately; a sample is a partial audit. Record revision
changes and reassess affected entries before claiming exhaustive coverage.

## 4. Identify missing protection and justify changes

Map material failure scenarios to tests that actually detect them, including
failure recovery and prevention of unintended effects where relevant. Report
high-consequence gaps even when every existing test is reasonable. Avoid adding
one test per function, branch, risk category, or testing-pyramid quota.

For consolidation or removal, name the exact surviving test/scenario and why
it retains equally faithful protection, or show the obligation is obsolete.
Shared line coverage or a green remaining suite does not establish redundancy.
If uncertain, retain the test as unresolved and propose a focused experiment.
For questionable assertions, use realistic, reversible fault injection in an
isolated copy when feasible; report what was actually executed and its limits.
Fix or replace flaky evidence without losing its distinct obligation.

When fixes are authorized, apply coherent changes in small batches, rerun
affected tests and discovery, and update the ledger. Preserve required checks
and repository policy. Do not turn an audit into unrelated production changes.

## 5. Report decisions and completeness

Lead with consequential gaps and the most useful simplifications. Provide:

- Scope/revision, discovery and CI findings, commands and observed results.
- Risk-to-evidence summary and prioritized recommendations with file/test IDs.
- Complete ledger or its artifact path, including kept tests and reasons.
- Inventory reconciliation: source-only, collected, assessed, unresolved,
  executed and skipped tests, with counting units explained.
- Proposed versus applied changes, retained protection, and verification.
- Unavailable environments, assumptions, remaining work and residual risks.

Claim every-test assessment only when inventory membership is reconciled and
no tests remain unassessed. An exhaustive static assessment can still have
execution gaps: state those separately, without claiming runtime verification.

## Basis and further reading

These sources informed the workflow; ordinary audits need no network access.
Read them when revising the audit's rationale or investigating its tradeoffs.

- [Cem Kaner, Risk-Based Testing: Some Basic Concepts](https://kaner.com/pdfs/QAIRiskBasics.pdf): concrete failure modes and consequences; avoid false precision in risk scores.
- [Felderer, Großmann and Schieferdecker, Classifying Risk-Based Testing Approaches](https://arxiv.org/abs/1801.06812): context, risk assessment, and risk-directed strategy.
- [Google, Test Behavior, Not Implementation](https://testing.googleblog.com/2013/08/testing-on-toilet-test-behavior-not.html) and [Change-Detector Tests Considered Harmful](https://testing.googleblog.com/2015/01/testing-on-toilet-change-detector-tests.html): protect outcomes rather than restating implementation.
- [Software Engineering at Google, Unit Testing](https://abseil.io/resources/swe-book/html/ch12.html): clear scenarios, independent expectations, and restrained fixture abstraction.
- [Inozemtseva and Holmes, Coverage Is Not Strongly Correlated with Test Suite Effectiveness](https://cs.uwaterloo.ca/~rtholmes/papers/icse_2014_inozemtseva.pdf) and [Fowler, Test Coverage](https://martinfowler.com/bliki/TestCoverage.html): coverage helps locate gaps but does not prove useful fault detection. The empirical result concerns five Java systems, not every application.
- [Testing Library, Guiding Principles](https://testing-library.com/docs/guiding-principles/): UI checks should resemble actual use; this does not require all tests to use a browser.
