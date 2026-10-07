# Test selection examples

These examples illustrate decisions, not mandatory test counts.

## Regression without a negative-case checklist

A price formatter rounds `1.005` incorrectly under the documented rounding
rule. Extend the existing table of rounding cases with the failing input and
its hand-derived expected output. Check a neighboring boundary only if the fix
could round other supported values incorrectly and existing cases miss that.
Adding null, object, and malformed-string cases to a number-only internal API
does not protect this fix. An external parser's input rejection is a separate
contract, relevant when that parser changes.

## Negative assertion that protects a real effect

A payment handler charges twice when the same event is delivered again. Exercise
duplicate delivery and assert one charge and the correct stored state. The
absence of a second charge is meaningful; a charge spy's count can be the oracle
when the external operation is the contract. Add a real database test if the
deduplication guarantee depends on transactional or uniqueness semantics.

## Fix plus overcorrection

A tenant filter leaks another tenant's record. Verify the caller cannot read
the foreign record and can still read their own. Both outcomes matter: simply
returning no records would satisfy the denial test while breaking the feature.
Use the actual query boundary if database scoping is the failure source.

## A migration needs real semantics

A migration converts nullable timestamps and must preserve existing rows.
Exercise representative existing data against a production-compatible database
and assert preserved data and the intended resulting behavior. Test rollback
when supported and relevant. Checking the migration file contains `ALTER TABLE`
or mocking the database execute method cannot prove conversion or data safety.

## Removed implementation does not need a tombstone

A refactor removes `legacyDispatch` while preserving response routing. Keep
behavior tests for supported routes. Do not add a source scan asserting
`legacyDispatch` never appears: a future valid implementation could reuse that
name, and other routing bugs would pass the scan. If an obsolete public endpoint
must reject requests, test the documented rejection through that endpoint.

## Shared assertions with distinct coverage

A unit test proves a discount calculation. A checkout test may also assert the
total while proving the UI submits the selected discount and persists the order.
That is distinct wiring and composition coverage. Another test calling the same
calculator with the same inputs and oracle adds no confidence.

## No new test is a valid outcome

A private variable rename preserves behavior and existing tests cover its
consumers. Run the relevant checks; add no rename-specific assertion. Likewise,
a human-facing documentation typo can be checked by reading the rendered text.
Executable scripts and agent instructions can need behavior checks; tests that
search their source for exact wording do not establish runtime behavior.

## Independently derived expectations

```python
# Tautological: the implementation supplies its own expected value.
expected = calculate_total(cart)
assert calculate_total(cart) == expected

# Meaningful: the contract says two items at 12 each, less a discount of 3.
assert calculate_total(cart) == 21
```
