# Atlas Ledger Foundry Specification

This directory defines the carrier-independent state, operation, inquiry, answer-processing, readiness, session, and interchange contracts for Foundry.

## Governing specifications

- [`FOUNDRY_WORKSPACE_V0.1.md`](FOUNDRY_WORKSPACE_V0.1.md) — durable pre-Ledger state, lifecycle, provenance, readiness, and seal semantics.
- [`FOUNDRY_SERVICE_OPERATIONS_V0.1.md`](FOUNDRY_SERVICE_OPERATIONS_V0.1.md) — lawful connected-service command surface and authority boundaries.
- [`ANSWER_PROCESSING_OPERATIONS_V0.1.md`](ANSWER_PROCESSING_OPERATIONS_V0.1.md) — service extension for cases, interpretation plans, governed adjudication, dependency review, and structural deltas.
- [`QUESTION_SELECTION_V0.1.md`](QUESTION_SELECTION_V0.1.md) — how Foundry chooses the next structurally useful gap instead of running a questionnaire.
- [`QUESTION_OPERATORS_V0.1.md`](QUESTION_OPERATORS_V0.1.md) — the operator library used to choose the question shape that best resolves the selected structural gap.
- [`ANSWER_RECONCILIATION_V0.1.md`](ANSWER_RECONCILIATION_V0.1.md) — interpretation → adjudication → structural-delta rules, including discrepancies, signals, cases, dispositions, dependency impact, and explicit no-change.
- [`READINESS_ENGINE_V0.1.md`](READINESS_ENGINE_V0.1.md) — deterministic readiness gates, blockers, warnings, and seal preconditions.
- [`SESSION_CONTRACT_V0.1.md`](SESSION_CONTRACT_V0.1.md) — what a fresh carrier receives, how context is bounded, and how one conversational turn lawfully returns to Foundry.
- [`LEDGER_EXCHANGE_V0.1.md`](LEDGER_EXCHANGE_V0.1.md) — sealed-candidate interchange toward Atlas admission.
- [`FOUNDRY_TOOL_SURFACE_V0.1.json`](FOUNDRY_TOOL_SURFACE_V0.1.json) — provider-neutral operation inventory and forbidden generic surfaces.

## Machine schemas

- [`schema/workspace.schema.json`](schema/workspace.schema.json)
- [`schema/testimony.schema.json`](schema/testimony.schema.json)
- [`schema/assertion.schema.json`](schema/assertion.schema.json)
- [`schema/closure.schema.json`](schema/closure.schema.json)
- [`schema/ledger-candidate.schema.json`](schema/ledger-candidate.schema.json)
- [`schema/operation-envelope.schema.json`](schema/operation-envelope.schema.json)
- [`schema/operation-result.schema.json`](schema/operation-result.schema.json)
- [`schema/inquiry-hint.schema.json`](schema/inquiry-hint.schema.json)
- [`schema/question-operator.schema.json`](schema/question-operator.schema.json)
- [`schema/session-context.schema.json`](schema/session-context.schema.json)
- [`schema/session-turn.schema.json`](schema/session-turn.schema.json)
- [`schema/case.schema.json`](schema/case.schema.json) — one bounded answer-processing/adjudication episode.
- [`schema/interpretation-plan.schema.json`](schema/interpretation-plan.schema.json) — carrier proposal for what preserved testimony could structurally mean.
- [`schema/reconciliation-plan.schema.json`](schema/reconciliation-plan.schema.json) — proposed dispositions, required confirmation/evidence, and adjudication state.
- [`schema/discrepancy.schema.json`](schema/discrepancy.schema.json) — difference without premature error judgment.
- [`schema/signal.schema.json`](schema/signal.schema.json) — indication requiring investigation without premature assertion.
- [`schema/disposition.schema.json`](schema/disposition.schema.json) — explicit adjudication outcome plus reason code and authority.
- [`schema/dependency-impact.schema.json`](schema/dependency-impact.schema.json) — downstream review caused by changed premises.
- [`schema/structural-delta.schema.json`](schema/structural-delta.schema.json) — append-preserving change result and structural-gain accounting.

## Executable reference

The storage-free reference implementation lives under [`../reference/`](../reference/). It exercises inquiry, question operators, answer processing, dependency propagation, readiness, and session projection before persistence, MCP, OAuth, or native Atlas implementation.

Question selection asks **what should Foundry learn next?**

Question operators ask **what kind of question will extract the most useful structure from that gap?**

Answer processing asks **what could this preserved answer mean, what consequences are lawfully justified, and what changed after adjudication?**

Readiness asks **is the field sufficiently reconciled to seal?**

The session contract asks **what does this carrier need right now, and nothing more?**

## Governing answer rule

The answer path is:

`preserved testimony → case → interpretation plan → discrepancy/signal/competing models → adjudication → dependency impact → structural delta → residual gap`

Difference is not error. Signal is not assertion. Interpretation is not adjudication. Adjudication never erases losing evidence. A new explicit unknown may be structural gain.

## Inquiry rule

`highest-value gap → question operator → relevant evidence neighborhood → one ordinary-language question → preserved testimony → bounded answer processing → residual gap`

Foundry must use `GATE` before unnecessary branches, `DISCRIMINATE` when models compete, `INVERT` to test completeness from reality back toward records, and `SIGNPOST` to learn when an established fact should be re-evaluated.

## Session rule

A carrier receives a governed projection of the workspace, not unrestricted workspace custody.

The normal loop is:

`workspace → session context → human testimony → interpretation plan → governed adjudication → updated workspace`

A carrier must not return a whole replacement workspace after every turn.

## Service rule

The connected service is a governed command surface, not unrestricted database access.

An AI carrier may preserve testimony, propose structure, submit an interpretation plan, and request adjudication. It may not force dispositions, directly apply structural deltas, receive SQL/generic CRUD, write canonical Atlas Reality, force seal, or impersonate the principal.

## Authority rule

`Foundry ESTABLISHED ≠ Atlas canonical Reality`

The promotion path remains:

`workspace → readiness → seal → sealed Ledger candidate → Atlas admission validation → active Ledger`

No carrier may collapse these stages for convenience.
