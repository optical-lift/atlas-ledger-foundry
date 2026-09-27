# Atlas Ledger Foundry Specification

This directory defines the carrier-independent state and interchange contract for Foundry.

## Governing specifications

- [`FOUNDRY_WORKSPACE_V0.1.md`](FOUNDRY_WORKSPACE_V0.1.md) — what durable pre-Ledger state contains, its authority boundary, lifecycle, provenance, readiness, and seal semantics.
- [`LEDGER_EXCHANGE_V0.1.md`](LEDGER_EXCHANGE_V0.1.md) — how a sealed Ledger candidate moves between Foundry carriers and toward Atlas admission without flattening provenance, uncertainty, closure, or topology.

## Machine schemas

- [`schema/workspace.schema.json`](schema/workspace.schema.json) — workspace envelope and durable record collections.
- [`schema/testimony.schema.json`](schema/testimony.schema.json) — raw/recoverable testimony record.
- [`schema/assertion.schema.json`](schema/assertion.schema.json) — structured candidate/reconciled assertion with provenance and stage.
- [`schema/closure.schema.json`](schema/closure.schema.json) — explicit domain/collection closure state.
- [`schema/ledger-candidate.schema.json`](schema/ledger-candidate.schema.json) — unresolved or classified possible Ledger discovered during Foundry.

## Authority rule

These schemas describe Foundry state. They do not authorize a carrier to write canonical Atlas Reality.

`Foundry ESTABLISHED ≠ Atlas canonical Reality`

The promotion path remains:

`workspace → readiness → seal → sealed Ledger candidate → Atlas admission validation → active Ledger`

No carrier may collapse these stages for convenience.
