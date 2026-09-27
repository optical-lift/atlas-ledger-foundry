# Store-Backed Relay v0.1

**Status:** executable custody integration contract  
**Version:** 0.1

This contract moves Relay custody behind `FoundryStore` without moving Foundry meaning or authority into storage.

The governing shape is:

`carrier → Relay semantics → atomic governed turn delta → FoundryStore → durable event history`

Relay still uses the same question selection, Canon Discovery, interpretation, adjudication, and authority logic. The store only preserves the result of those governed operations.

## 1. Why the turn is the persistence unit

A conversational turn may preserve testimony and then produce several related records: discovery observations, discovery gaps, cases, dispositions, dependency impacts, structural deltas, and a receipt.

Those records are semantically distinct, but they belong to one custody transition. Persisting them as unrelated writes would allow a crash to leave half a turn durable.

Therefore the store-backed Relay persists one `FOUNDRY_TURN_COMMITTED` event per accepted turn.

The event contains an append-only delta divided into the same semantic collections used by Foundry. It is **not** a whole-workspace replacement and does not collapse testimony, observation, interpretation, or adjudication into one meaning.

## 2. Initialization

A new durable Relay begins with exactly one `WORKSPACE_CREATED` event containing:

- the initial normalized workspace;
- Relay ID;
- Relay sequence;
- creation metadata.

A workspace with existing events must be loaded rather than initialized again.

## 3. Turn commit event

A committed turn event contains at least:

```json
{
  "turn_id": "001",
  "relay_sequence": 1,
  "appended": {
    "testimony": [],
    "discovery_observations": [],
    "discovery_gaps": [],
    "assertions": [],
    "unknowns": [],
    "contradictions": [],
    "discrepancies": [],
    "signals": [],
    "adjudication_cases": [],
    "dispositions": [],
    "dependency_impacts": [],
    "structural_deltas": []
  },
  "receipt": {}
}
```

Empty semantic lanes may be omitted from `appended`.

The turn event itself carries `SERVICE_RULE` custody authority. Authority attached to records inside the turn remains what the governing Relay/adjudication logic assigned; persistence does not upgrade it.

## 4. Append-preserving delta law

The store-backed Relay may persist records that were appended by the pure Relay transition.

It must reject a transition that silently:

- edits an existing record in place;
- deletes an existing record;
- changes workspace metadata other than the Relay checkpoint/version;
- changes Relay identity or creation metadata;
- changes more than one Relay sequence step for a new turn.

Future governed mutation semantics such as correction or supersession must remain represented by later records/events, not by rewriting prior custody.

## 5. Reconstruction

Current Relay state must be reconstructible from event history alone.

The reducer processes:

1. `WORKSPACE_CREATED`;
2. zero or more ordered `FOUNDRY_TURN_COMMITTED` events.

For each turn commit it appends the typed records, appends the turn receipt, restores the resulting workspace version, and advances the Relay sequence.

Snapshots are optional accelerators. Deleting every snapshot must not destroy the ability to reconstruct the Relay from events.

## 6. Idempotence

The durable event ID for a turn is deterministic from workspace + turn ID.

If a client retries after the turn event was already appended, Relay reconstructs the prior receipt and returns the ordinary Relay replay result. It does not append another turn event.

The same turn ID with different human testimony remains invalid.

## 7. Concurrency

A store-backed Relay computes against the latest event sequence it read and presents the immediate next store sequence when committing.

If another writer advances the workspace first, the store must reject the stale sequence rather than accepting two competing next events.

The reference service serializes turns inside one process. Cross-process guarantees depend on the adapter. FileStore v0.1 is intentionally a single-process development adapter; a later SupabaseStore must enforce the same monotonic append rule atomically at the persistence boundary.

## 8. Snapshot behavior

After a successful event append, Relay may write a snapshot containing the current workspace plus Relay metadata needed for later acceleration.

Snapshot failure does not erase or roll back the already-committed event. The event stream remains primary custody.

## 9. Adapter invariance

The same Relay operations must behave materially the same against any conforming `FoundryStore`.

The application layer must not branch on `MemoryStore`, `FileStore`, `SupabaseStore`, or another adapter in order to decide Foundry meaning.

## Governing invariant

**Relay determines the governed transition. FoundryStore preserves one ordered, append-only custody history of that transition.**
