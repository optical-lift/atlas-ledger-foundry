# Atlas Ledger Foundry Specification

This directory defines the carrier-independent state, operation, and interchange contracts for Foundry.

## Governing specifications

- [`FOUNDRY_WORKSPACE_V0.1.md`](FOUNDRY_WORKSPACE_V0.1.md) — what durable pre-Ledger state contains, its authority boundary, lifecycle, provenance, readiness, and seal semantics.
- [`FOUNDRY_SERVICE_OPERATIONS_V0.1.md`](FOUNDRY_SERVICE_OPERATIONS_V0.1.md) — the lawful connected-service command surface and its authority boundaries.
- [`LEDGER_EXCHANGE_V0.1.md`](LEDGER_EXCHANGE_V0.1.md) — how a sealed Ledger candidate moves between Foundry carriers and toward Atlas admission without flattening provenance, uncertainty, closure, or topology.
- [`FOUNDRY_TOOL_SURFACE_V0.1.json`](FOUNDRY_TOOL_SURFACE_V0.1.json) — machine-readable inventory of the provider-neutral Foundry operations and forbidden generic surfaces.

## Machine schemas

- [`schema/workspace.schema.json`](schema/workspace.schema.json) — workspace envelope and durable record collections.
- [`schema/testimony.schema.json`](schema/testimony.schema.json) — raw/recoverable testimony record.
- [`schema/assertion.schema.json`](schema/assertion.schema.json) — structured candidate/reconciled assertion with provenance and stage.
- [`schema/closure.schema.json`](schema/closure.schema.json) — explicit domain/collection closure state.
- [`schema/ledger-candidate.schema.json`](schema/ledger-candidate.schema.json) — unresolved or classified possible Ledger discovered during Foundry.
- [`schema/operation-envelope.schema.json`](schema/operation-envelope.schema.json) — attributable request envelope for a service operation.
- [`schema/operation-result.schema.json`](schema/operation-result.schema.json) — governed result envelope, including blockers and confirmation requirements.

## Service rule

The connected service is a governed command surface, not unrestricted database access.

An AI carrier may preserve testimony, propose structure, ask for reconciliation, and request readiness/sealing. It may not receive generic CRUD, SQL, direct Atlas Reality writes, force-seal authority, or permission to impersonate the principal.

## Authority rule

These contracts describe Foundry state and lawful Foundry operations. They do not authorize a carrier to write canonical Atlas Reality.

`Foundry ESTABLISHED ≠ Atlas canonical Reality`

The promotion path remains:

`workspace → readiness → seal → sealed Ledger candidate → Atlas admission validation → active Ledger`

No carrier may collapse these stages for convenience.
