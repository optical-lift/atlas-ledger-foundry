# Atlas Ledger Foundry Specification

This directory defines the carrier-independent state, operation, inquiry, readiness, session, and interchange contracts for Foundry.

## Governing specifications

- [`FOUNDRY_WORKSPACE_V0.1.md`](FOUNDRY_WORKSPACE_V0.1.md) — durable pre-Ledger state, lifecycle, provenance, readiness, and seal semantics.
- [`FOUNDRY_SERVICE_OPERATIONS_V0.1.md`](FOUNDRY_SERVICE_OPERATIONS_V0.1.md) — lawful connected-service command surface and authority boundaries.
- [`QUESTION_SELECTION_V0.1.md`](QUESTION_SELECTION_V0.1.md) — how Foundry chooses the next structurally useful gap instead of running a questionnaire.
- [`QUESTION_OPERATORS_V0.1.md`](QUESTION_OPERATORS_V0.1.md) — the operator library used to choose the question shape that best resolves the selected structural gap.
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
- [`schema/inquiry-hint.schema.json`](schema/inquiry-hint.schema.json) — durable hints describing the kind of unresolved structure, evidence standard, and maintenance work without encoding an answer.
- [`schema/question-operator.schema.json`](schema/question-operator.schema.json) — machine contract for the selected inquiry operator and its structural job.
- [`schema/session-context.schema.json`](schema/session-context.schema.json) — bounded resume packet for a fresh carrier, including selected question-operator metadata.
- [`schema/session-turn.schema.json`](schema/session-turn.schema.json) — one human turn plus bounded proposed Foundry operations.

## Executable reference

The storage-free reference implementation lives under [`../reference/`](../reference/). It exists so inquiry, question-operator, readiness, and session-projection behavior can be exercised before persistence, MCP, OAuth, or native Atlas implementation.

Question selection asks **what should Foundry learn next?**

Question operators ask **what kind of question will extract the most useful structure from that gap?**

Readiness asks **is the field sufficiently reconciled to seal?**

The session contract asks **what does this carrier need right now, and nothing more?**

These are related but distinct judgments.

## Inquiry rule

The governing inquiry chain is:

`highest-value gap → question operator → relevant evidence neighborhood → one ordinary-language question → preserved testimony → bounded operations → residual gap`

Foundry must use `GATE` before unnecessary branches, `DISCRIMINATE` when models compete, `INVERT` to test completeness from reality back toward records, and `SIGNPOST` to learn when an established fact should be re-evaluated.

## Session rule

A carrier receives a governed projection of the workspace, not unrestricted workspace custody.

The normal loop is:

`workspace → session context → human testimony → bounded operations → updated workspace`

A carrier must not return a whole replacement workspace after every turn.

## Service rule

The connected service is a governed command surface, not unrestricted database access.

An AI carrier may preserve testimony, propose structure, ask for reconciliation, and request readiness/sealing. It may not receive generic CRUD, SQL, direct Atlas Reality writes, force-seal authority, or permission to impersonate the principal.

## Authority rule

These contracts describe Foundry state and lawful Foundry operations. They do not authorize a carrier to write canonical Atlas Reality.

`Foundry ESTABLISHED ≠ Atlas canonical Reality`

The promotion path remains:

`workspace → readiness → seal → sealed Ledger candidate → Atlas admission validation → active Ledger`

No carrier may collapse these stages for convenience.
