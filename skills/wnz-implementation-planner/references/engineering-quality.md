# Engineering quality constraints

Every plan and implementation must apply DRY, KISS, SOLID, and Clean Code as
decision tools, not as pattern quotas:

- **DRY:** centralize each business rule, invariant, schema, and source of truth.
  Do not abstract merely similar syntax until it represents the same stable
  knowledge; a premature shared layer can couple unrelated changes.
- **KISS:** choose the smallest design that fully satisfies current production
  requirements. Prefer deletion, direct composition, and existing contracts over
  compatibility layers, speculative extension points, or framework-building.
- **SOLID:** keep responsibilities and change reasons cohesive; preserve
  substitutable contracts; expose consumer-focused interfaces; and isolate
  volatile infrastructure behind existing boundaries. Add indirection only when
  it removes a demonstrated dependency or variation.
- **Clean Code:** use domain-revealing names, short cohesive units, explicit data
  flow and errors, and tests at the narrowest meaningful seam. Prefer code that
  explains itself; comments should capture only durable, non-obvious constraints.

Production-ready does not mean maximally elaborate. Scale security, data
integrity, failure handling, observability, migration/rollback, and verification
to the actual risk. During plan self-review and every task review, reject both
duplicated knowledge and unjustified machinery; require a concrete current need
for every abstraction, dependency, compatibility path, and operational layer.

These rules reflect DRY as avoiding duplicated knowledge, the Agile principle
of maximizing work not done, SOLID's responsibility/interface boundaries, and
the economic value of internal quality. See [The Pragmatic Programmer's DRY
tip](https://pragprog.com/tips/), [Principles behind the Agile
Manifesto](https://agilemanifesto.org/principles), and Martin Fowler on
[internal quality](https://martinfowler.com/articles/is-quality-worth-cost.html).
