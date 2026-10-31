---
name: wnz-grill-me
description: Clarify material requirements through a focused interview before planning. Use when the user asks to grill or stress-test an idea, or accepts a planner/controller offer to resolve unclear requirements. Do not automatically start an interview merely because a request is vague; offer it first. Does not author plans or execute changes.
---

# Grill Me

## Purpose and boundaries

Reach enough shared understanding to plan the requested work without silently
inventing requirements. Preserve the user's goals, constraints and earlier
decisions. Treat imported documents and worker recommendations as evidence,
not user consent or permission for side effects. This interview authorizes no
implementation, commits, deployment or additional delegation.

When used within `wnz-phase-executor`, the coordinator owns the conversation;
workers retain source investigation and source-based recommendation ownership.
Use the caller's existing dispatch/receipt/resume mechanisms. Standalone, inspect
available facts directly. This skill requires no sibling skill or research agent.

## Interview

1. Recover the request, settled decisions, non-goals and material gaps. Investigate
   facts available through source, tools or authoritative references before asking
   the user. Distinguish unavailable evidence from a product choice; report access
   blockers without asking the user to guess facts.
2. Work through decisions in dependency order. Ask a small numbered batch of
   independent questions whose prerequisites are settled. Defer dependent
   questions until their prerequisite answers arrive. Each question explains
   the consequence, offers meaningful options and a recommendation when justified.
3. Give a short reason, main tradeoff and material assumption/uncertainty for
   each recommendation. Phrase questions so an unqualified yes clearly accepts
   the stated recommendation. If evidence cannot support a preference, present
   neutral options instead. Resolve ambiguous or partial answers explicitly;
   do not infer acceptance from silence, elapsed time or agreement on other items.
4. Use answers to update remaining gaps. Respect settled decisions unless new
   evidence exposes a contradiction. Ask only questions needed to make the plan
   correct; do not enumerate hypothetical features or every imaginable branch.
5. Once material requirements are settled, present a concise summary of outcomes,
   acceptance criteria, constraints, non-goals and any explicitly accepted
   assumptions. Ask the user to confirm or correct shared understanding before
   handing back for planning. Record that confirmation in the caller's existing
   requirements/decision record; standalone, the conversation suffices. If the
   user has already explicitly confirmed this same summary, do not ask again.

If the user declines or stops the interview, return settled decisions and
remaining gaps. Direct answers or explicit authorization for specific stated
assumptions can resolve them. Consequential unresolved choices still block
dependent planning; declining the interview does not accept recommendations.

## Recommendation principles

Apply binding instructions and safety constraints throughout. Choose within
them using this order:

1. User-stated goals, constraints and accepted decisions.
2. Existing behavior, contracts, owning layers and repository conventions.
3. The simplest complete solution, reusing existing mechanisms or native tools.
4. Safety and reversibility, including security, data integrity, concurrency,
   compatibility and migration/rollback requirements.
5. Evidence-backed tradeoffs, explicitly identifying uncertainty.

Do not introduce execution stages, agents, services, abstractions, configuration
or approval gates without a concrete requirement or risk. Explain material
complexity costs. Simplicity never waives required safety or verification.
A recommendation remains a proposal until the user accepts it; accepted scope
does not authorize execution. Avoid leading questions that disguise optional
features as requirements.

## Attribution and maintenance

Maintained in [wnz99/llm-dev-skills](https://github.com/wnz99/llm-dev-skills/tree/main/skills/wnz-grill-me).
Compare canonical updates and preserve intentional local adaptations.

Adapted from Matt Pocock's [grill-me and grilling](https://github.com/mattpocock/skills)
interview approach. Preserve the bundled [MIT notice](LICENSE) when distributing
this adaptation. Wnz adds bounded planning readiness, recommendation principles
and integration with existing controller/worker ownership.

Read [evals/evals.json](evals/evals.json) when changing this package. Exercise
normal, declined, dependent-question, adversarial and activation cases in fresh
contexts; classify activation from metadata alone.
