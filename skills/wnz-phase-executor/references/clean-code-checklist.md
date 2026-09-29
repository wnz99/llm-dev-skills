# Clean-code checklist

Use this checklist for the mandatory clean-code assessment when no matching
`wnz-clean-code-*` skill is installed for a changed language. It is deliberately
language-neutral. Apply it only to changed code and the callers it affects, and
let project rules and established local patterns override any item here.

For each item, form a concrete hypothesis from the code, confirm it with local
evidence, and propose a behavior-preserving fix. Drop candidates you cannot
anchor in the diff.

## Checks

1. **Single source of truth.** The same fact, such as a list of fields, a
   prefix, a regex, or a policy value, is defined in more than one place and
   can drift. Point to both definitions and name the one that should own the
   fact.
2. **Hidden intent.** A call is made only for its side effect or exception, a
   return value is discarded, or a validator works by accident. Name the
   intent-revealing replacement.
3. **Names that mislead.** An identifier describes a different behavior, type,
   or scope than it has, or a public-looking name is really internal.
4. **Function size and mixed responsibilities.** A changed function does
   several distinct jobs that obscure its main path. Extract only when the
   pieces have clear names and the result is easier to test.
5. **Boolean flags and long parameter lists.** A flag switches behavior inside
   one function, or many loosely related parameters travel together. Prefer
   separate functions or a named options/dependency object.
6. **Error handling.** Errors are swallowed, broad catches hide the cause, the
   original cause is dropped when translating, or messages leak secrets.
7. **Magic values.** Business or policy numbers and strings appear inline
   instead of as named constants.
8. **Output-argument mutation and hidden state.** A function mutates its inputs
   to return results, or depends on global or ambient state it does not
   declare.
9. **Duplication in tests.** Test setup repeats a factory that already exists,
   or a test can pass vacuously because its fixture does not isolate the
   environment it depends on.
10. **Needless abstraction.** A wrapper, layer, or configuration point exists
    with a single caller and no stated need. Suggest inlining unless a
    documented contract requires it.

## Reporting

For each finding, give the location, the smell, the evidence, the proposed fix,
its benefit, and its risk. Rate a finding Medium only when it creates a concrete
risk of future defects, such as a drifting duplicate or a misleading contract;
otherwise rate it Low or Nit. Checks 3, 5, and 7 are usually Low or Nit unless
you can show how the smell leads to a defect. Record how many candidates were
considered and dismissed, and state plainly when nothing is worth changing.
