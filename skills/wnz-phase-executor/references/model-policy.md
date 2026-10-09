# Model policy

## Host detection

Auto-detect the host before dispatching subagents. Treat the runtime as
Claude when its system identity or native delegation surface identifies
Claude Code; treat it as Codex when its system identity or collaboration
surface identifies Codex. Prefer the explicit system identity when signals
disagree; do not ask the user to identify the host.

## Role defaults and resolution

Use stronger models for design judgment and review; use the implementation tier
for bounded implementation and fixes. These are configurable defaults, not a
claim that a model is always better or cheaper for every task.

| Role | Claude | Codex | Effort |
| --- | --- | --- | --- |
| Plan generation and semantic plan revisions | `claude-opus-5-5` | `gpt-6.1-sol` | `medium` |
| Plan, task, and final aggregate reviews | `claude-opus-5-5` | `gpt-6.1-sol` | `medium` |
| Implementation and fix tasks | `claude-sonnet-5-5` | `gpt-6.1-sol` | Claude host default; Codex `medium` |

Resolve model and effort independently: an explicit user override changes only
the named control and role. Pass supported controls through the native host
API, using a host-equivalent selector only when it resolves to the named model.
Do not infer that an implementer inherits the controller's model. Keep the
implementation tier for review fixes; review itself uses the review tier.

A skill cannot switch its caller's model through prose. For planning, use the
current agent when its model and effort match; otherwise use an authorized,
bounded planner delegation with the requirements, repository evidence, and plan
template. The controller retains plan ownership and validates the returned
artifact before self-review and the independent gate. A delegated plan author
cannot serve as its independent reviewer or a planned implementer.

If a default control cannot be enforced, disclose the limitation before work,
use a capable host-supported fallback, and record requested versus selected
controls. If an explicit user control cannot be honored, stop the affected
role until the user permits an alternative. When the host does not expose the
resolved identity or effort, report it as unavailable; never claim a selection
was enforced merely because the prompt names it. Do not switch providers or
invoke an external CLI solely to force this policy without authorization.
