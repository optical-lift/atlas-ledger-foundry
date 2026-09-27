# Foundry Store Contract v0.1

**Status:** governing persistence boundary contract  
**Version:** 0.1

Foundry persistence is defined by behavior, not by a database product.

The governing boundary is:

`carrier → Foundry service / Relay → FoundryStore → durable events and snapshots`

not:

`carrier → unrestricted persistence`

A storage adapter has custody duties only. It does not gain ontology authority, adjudication authority, or Atlas Reality write authority merely because it persists records.

## 1. Purpose

`FoundryStore` is the smallest storage contract needed to let the same governed Foundry behavior run against:

- an in-memory development store;
- an append-only local/file journal;
- a later Supabase adapter;
- another durable carrier that preserves this contract.

The first implementation goal is continuity across carriers and sessions without tying Foundry semantics to one persistence technology.

## 2. Store operations

Every conforming adapter must provide:

- `appendEvent(event)` — append one immutable governed event;
- `readEvents(workspaceId, options)` — return the ordered event stream for one workspace;
- `readLatestSnapshot(workspaceId)` — return the newest accepted snapshot, or `null`;
- `writeSnapshot(snapshot)` — persist a derived checkpoint without rewriting event history;
- `hasEvent(eventId)` — determine whether an event ID is already present.

Adapters may expose additional operational helpers, but Foundry reference logic must not require adapter-specific CRUD.

## 3. Event envelope

Every persisted event uses this minimum envelope:

```json
{
  "event_id": "EVT-001",
  "workspace_id": "W-001",
  "sequence": 1,
  "event_type": "TESTIMONY_PRESERVED",
  "payload": {},
  "basis_refs": [],
  "authority": "HUMAN_TESTIMONY",
  "actor_kind": "CARRIER",
  "recorded_at": "2026-09-27T20:00:00.000Z",
  "protocol_version": "0.1"
}
```

Required properties:

- `event_id` is stable and idempotent;
- `workspace_id` binds the event to exactly one Foundry workspace;
- `sequence` is positive and strictly ordered within that workspace;
- `event_type` states what governed occurrence is being recorded;
- `payload` contains the event-specific body;
- `basis_refs` retain provenance when the event depends on earlier evidence or records;
- `authority` records the authority basis carried by the event and does not enlarge it;
- `actor_kind` identifies the kind of actor/carrier that submitted the event;
- `recorded_at` is the custody timestamp;
- `protocol_version` makes replay semantics explicit.

## 4. Append-only law

Existing events are never edited in place.

Correction, supersession, closure, reopening, confirmation, rejection, and repair are represented by later events.

Therefore:

`later event may change current interpretation`

but:

`later event may not erase earlier custody history`.

## 5. Idempotence

Appending the same `event_id` with identical content is an idempotent replay and must not create a duplicate event.

Appending the same `event_id` with materially different content is invalid.

This distinction separates transport retry from changed testimony or changed interpretation.

## 6. Sequence behavior

Within one workspace, accepted events must form one monotonic sequence.

An adapter must reject:

- sequence regression;
- sequence reuse for a different event;
- gaps when the caller presents an event as the immediate next append.

Concurrency control may differ by adapter, but the observable Foundry result must remain one ordered workspace history.

## 7. Snapshot law

A snapshot is a derived optimization, never the primary history.

A snapshot must contain at least:

- `workspace_id`;
- `through_sequence`;
- `workspace` projection;
- `created_at`;
- `protocol_version`.

A snapshot may be replaced by a newer snapshot because its authority is reconstructive, not historical.

A conforming implementation must be able to discard snapshots and reconstruct current state from the event stream when a reducer for those event types exists.

## 8. Evidence and interpretation remain distinct

Storage must not collapse semantic lanes.

For example:

`TESTIMONY_PRESERVED`

is not equivalent to:

`DISCOVERY_OBSERVATION_PROPOSED`

and neither is equivalent to:

`ASSERTION_ESTABLISHED`.

The store persists those distinctions; it does not decide them.

## 9. Authority boundary

A persistence adapter may validate storage invariants such as shape, idempotence, workspace binding, and sequence.

It may not decide:

- whether testimony is true;
- whether an AI interpretation is established;
- whether a disposition is authorized;
- whether a Ledger should exist;
- whether Foundry material may enter canonical Atlas Reality.

Those decisions remain upstream in governed Foundry logic.

## 10. Initial event vocabulary

The reference implementation may begin with event types such as:

- `WORKSPACE_CREATED`;
- `TESTIMONY_PRESERVED`;
- `DISCOVERY_OBSERVATION_PROPOSED`;
- `DISCOVERY_GAP_OPENED`;
- `CASE_OPENED`;
- `DISPOSITION_RECORDED`;
- `STRUCTURAL_DELTA_RECORDED`;
- `TURN_RECEIPT_RECORDED`;
- `SNAPSHOT_CHECKPOINTED`.

This list is not authority to create facts. Each event type still inherits the governing rules of the operation that produced it.

## 11. Adapter invariance

The same accepted event history must produce materially equivalent Foundry state regardless of whether custody is provided by MemoryStore, FileStore, SupabaseStore, or another conforming adapter.

Persistence technology may change performance and operational guarantees. It may not change Foundry meaning.

## 12. Migration direction

The current Mock Relay owns an in-memory workspace directly.

Migration proceeds in three steps:

1. define and prove `FoundryStore` plus the event envelope;
2. implement MemoryStore and FileStore against the same contract;
3. move Relay custody behind the store while leaving question selection, Canon Discovery, interpretation, adjudication, and authority logic unchanged.

A later Supabase adapter should implement the same contract rather than introducing a second semantic path.

## Governing invariant

**Storage preserves ordered custody. Governing Foundry logic determines meaning and authority.**
