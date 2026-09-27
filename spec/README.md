# Atlas Ledger Foundry Specification

This directory defines the carrier-independent state, operation, inquiry, readiness, and interchange contracts for Foundry.

## Governing specifications

- [`FOUNDRY_WORKSPACE_V0.1.md`](FOUNDRY_WORKSPACE_V0.1.md) — durable pre-Ledger state, lifecycle, provenance, readiness, and seal semantics.
- [`FOUNDRY_SERVICE_OPERATIONS_V0.1.md`](FOUNDRY_SERVICE_OPERATIONS_V0.1.md) — lawful connected-service command surface and authority boundaries.
- [`QUESTION_SELECTION_V0.1.md`](QUESTION_SELECTION_V0.1.md) — how Foundry chooses the next structurally useful question instead of running a questionnaire.
- [`READINESS_ENGINE_V0.1.md`](READINESS_ENGINE_V0.1.md) — deterministic readiness gates, blockers, warnings, and seal preconditions.
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

## Executable reference

The storage-free reference implementation lives under [`../reference/`](../reference/). It exists so inquiry and readiness behavior can be exercised before persistence, MCP, OAuth, or native Atlas implementation.

Question selection asks **what should Foundry learn next?**

Readiness asks **is the field sufficiently reconciled to seal?**

These are related but distinct judgments.

## Service rule

The connected service is a governed command surface, not unrestricted database access.

An AI carrier may preserve testimony, propose structure, ask for reconciliation, and request readiness/sealing. It may not receive generic CRUD, SQL, direct Atlas Reality writes, force-seal authority, or permission to impersonate the principal.

## Authority rule

These contracts describe Foundry state and lawful Foundry operations. They do not authorize a carrier to write canonical Atlas Reality.

`Foundry ESTABLISHED ≠ Atlas canonical Reality`

The promotion path remains:

`workspace → readiness → seal → sealed Ledger candidate → Atlas admission validation → active Ledger`

No carrier may collapse these stages for convenience.
