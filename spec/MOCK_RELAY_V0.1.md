# Foundry Mock Relay v0.1

**Status:** executable orchestration reference  
**Version:** 0.1

The Mock Relay is a storage-free, carrier-independent simulation of the eventual connected Foundry service boundary.

It exists to prove that Foundry can survive carrier changes and conversational breaks without handing ontology authority to the carrier, an industry template, or model memory.

It is **not** the production service and has no authority to write canonical Atlas Reality.

## 1. Purpose

The Mock Relay composes the already-governed Foundry layers into one turn-by-turn loop:

`resume → bounded context → question → preserve testimony → canon discovery → interpretation → adjudication → structural delta → residual gap → resume`

The reference must demonstrate that a fresh carrier can continue the work from durable Foundry state rather than reconstructing the field from conversation history.

## 2. Authority boundary

The Relay may simulate:

- durable workspace custody in memory;
- bounded session projection;
- testimony preservation;
- canon-derived discovery observations;
- discovery-gap generation;
- Question Selection and Question Operators;
- cases and interpretation plans;
- disposition adjudication;
- dependency impact;
- structural deltas;
- residual work;
- checkpoint/version movement;
- idempotent conversational-turn replay.

It may not simulate or imply:

- canonical Atlas Reality admission;
- direct SQL or generic CRUD;
- Supabase mutation;
- external-system writes;
- deployment;
- principal confirmation that was not actually supplied;
- industry-derived facts;
- whole-workspace replacement by an AI summary.

## 3. Relay state

A Relay instance contains:

- `relay_id`;
- `sequence`;
- one in-memory Foundry `workspace`;
- append-preserving `turn_receipts`;
- creation metadata.

The workspace remains the durable thing inside the simulation. Session packets are disposable projections.

## 4. Resume

`resumeRelay` projects the current workspace through the governing Session Contract.

A fresh session receives:

- north-star orientation;
- Canon Discovery rules;
- current material blockers;
- smallest sufficient relevant record neighborhood;
- primary next question and operator;
- discovery-lens provenance when the question originated in Canon Discovery;
- allowed Foundry operations;
- an omissions notice.

The Relay must not require the human to restate preserved testimony merely because the carrier changed.

## 5. Turn processing

A turn is processed in strict order.

### Stage A — testimony custody

The human answer is preserved first.

The Relay assigns or accepts a stable testimony ID and records:

- exact/derived representation;
- source refs;
- question ref;
- question operator;
- turn ID;
- capture time.

If later discovery or interpretation fails, the testimony remains preserved.

This is a hard acceptance property.

### Stage B — stale-context gate

A turn may declare the workspace version it expected.

If that version is stale:

- testimony may still be preserved;
- discovery/adjudication work does not receive overwrite authority;
- the turn returns a stale-context result;
- the carrier must resume from the newer workspace projection.

Staleness never enlarges carrier authority.

### Stage C — Canon Discovery

The carrier may submit discovery observations only after testimony exists.

Every observation must:

- use a supported Canon Discovery lens;
- cite preserved support;
- set `industry_assumption: false`;
- retain the ordinary-language structural description.

`$turn_testimony` may be used as a turn-local alias and is resolved to the stable testimony ID before validation.

A discovery observation whose support does not exist is rejected.

Rejected discovery does not erase the already-preserved testimony.

Valid observations become auditable `discovery_observations` and `discovery_gaps`, which enter the ordinary Question Selection engine.

### Stage D — interpretation and adjudication

The carrier may optionally submit an `interpretation_plan`.

The Relay opens a bounded case and passes it through the governed answer-processing reference.

The carrier may propose consequences. The adjudicator determines whether they are:

- authorized;
- require confirmation;
- require escalation;
- rejected.

AI recommendation alone cannot authorize a truth-changing disposition.

### Stage E — append-preserving workspace update

The Mock Relay may append:

- candidate assertions;
- unknowns;
- contradictions;
- discrepancies;
- signals;
- cases;
- dispositions;
- dependency impacts;
- structural deltas.

It does not attempt to emulate the entire eventual persistence engine.

Candidate records remain candidate unless the governing reference explicitly provides stronger authority. Complex production-grade supersession and canonical admission remain outside this mock.

### Stage F — next inquiry

The workspace version advances.

Question Selection runs again against the resulting state.

The turn receipt records the next material question so a new carrier can continue immediately.

## 6. Idempotence

`turn_id` is the Mock Relay's idempotency key.

Replaying the same turn ID with identical human testimony returns the prior receipt without duplicating testimony.

Reusing a turn ID with different human testimony is invalid.

This distinguishes:

- transport/tool retry;
- repeated human wording in a new turn;
- revised testimony;
- deliberate correction.

## 7. Canon-discovery invariant

The Relay must preserve:

`industry label → vocabulary context only`

and:

`preserved evidence → canon discovery lens → candidate structural gap → question operator`

The Relay must never perform:

`industry label → conventional schema → assumed workflow → questions`

Two differently named industries with materially equivalent functional structure should produce materially equivalent discovery signatures and question semantics.

## 8. Cross-session acceptance properties

The executable reference must prove at least:

1. an empty under-modeled workspace begins with `NARRATE`;
2. testimony is preserved before discovery interpretation;
3. evidence-backed Canon Discovery gaps become ranked questions;
4. a fresh carrier receives the same unresolved structural work without conversational memory;
5. industry vocabulary does not become ontology authority;
6. unsupported discovery support is rejected without deleting testimony;
7. AI truth-changing recommendations remain confirmation-gated;
8. unresolved adjudication survives into the next session;
9. turn retries do not duplicate preserved testimony;
10. no database, network, or Atlas Reality write is required.

## 9. Relationship to the future service

The Mock Relay is a behavioral proof, not a persistence architecture.

A later connected Foundry service may use databases, APIs, OAuth, event logs, MCP adapters, queues, or native Atlas infrastructure. Those implementation choices must preserve the semantics proven here.

The intended future boundary remains:

`carrier ↔ governed Foundry service ↔ durable workspace`

not:

`carrier ↔ unrestricted database`

and never:

`carrier prior/industry template → canonical Atlas Reality`.

## Governing invariant

**The carrier may discover, propose, and ask. The Relay preserves custody, method, authority gates, and continuity.**
