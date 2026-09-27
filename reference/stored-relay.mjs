// Atlas Ledger Foundry store-backed Relay v0.1
// Relay semantics remain in mock-relay.mjs; this module moves custody behind FoundryStore.

import { assertFoundryStore, makeFoundryEvent } from './foundry-store.mjs';
import { createMockRelay, resumeRelay, processRelayTurn, relayAudit } from './mock-relay.mjs';

const COLLECTIONS = Object.freeze([
  'sources','testimony','discovery_observations','discovery_gaps','assertions','unknowns',
  'contradictions','discrepancies','signals','ledger_candidates','closure','acceptance_cases',
  'adjudication_cases','dispositions','dependency_impacts','structural_deltas'
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  }
  return value;
}

function canonical(value) {
  return JSON.stringify(stable(value));
}

function stableId(record) {
  return record?.source_id ?? record?.testimony_id ?? record?.observation_id ?? record?.id ??
    record?.assertion_id ?? record?.unknown_id ?? record?.contradiction_id ??
    record?.discrepancy_id ?? record?.signal_id ?? record?.ledger_candidate_id ??
    record?.closure_id ?? record?.case_id ?? record?.disposition_id ??
    record?.impact_id ?? record?.delta_id ?? null;
}

function relaySequenceFromVersion(version) {
  const match = /^relay-(\d+)$/.exec(String(version ?? ''));
  return match ? Number(match[1]) : null;
}

function workspaceMetadata(workspace) {
  const out = clone(workspace ?? {});
  for (const key of COLLECTIONS) delete out[key];
  delete out.workspace_version;
  return out;
}

function appendRecord(workspace, collection, record) {
  if (!COLLECTIONS.includes(collection)) throw new Error(`unsupported Relay collection ${collection}`);
  if (!Array.isArray(workspace[collection])) workspace[collection] = [];
  const id = stableId(record);
  if (!id) throw new Error(`record appended to ${collection} is missing a stable id`);
  const existing = workspace[collection].find(item => stableId(item) === id);
  if (existing) {
    if (canonical(existing) !== canonical(record)) {
      throw new Error(`event replay attempted to rewrite ${collection} record ${id}`);
    }
    return;
  }
  workspace[collection].push(clone(record));
}

function deriveBasisRefs(delta) {
  const refs = new Set();
  for (const records of Object.values(delta ?? {})) {
    for (const record of records ?? []) {
      for (const key of ['basis_refs','supporting_refs','source_refs','testimony_refs','origin_refs','record_refs','new_refs']) {
        for (const ref of record?.[key] ?? []) if (ref) refs.add(ref);
      }
    }
  }
  return [...refs];
}

function captureAppendOnlyDelta(beforeRelay, afterRelay) {
  if (beforeRelay.relay_id !== afterRelay.relay_id) throw new Error('Relay identity changed during turn');
  if (beforeRelay.created_at !== afterRelay.created_at) throw new Error('Relay creation metadata changed during turn');
  if (afterRelay.sequence !== beforeRelay.sequence + 1) {
    throw new Error(`Relay sequence expected ${beforeRelay.sequence + 1}, received ${afterRelay.sequence}`);
  }
  if (canonical(workspaceMetadata(beforeRelay.workspace)) !== canonical(workspaceMetadata(afterRelay.workspace))) {
    throw new Error('Relay turn changed workspace metadata outside append-only custody and workspace_version');
  }

  const appended = {};
  for (const collection of COLLECTIONS) {
    const before = beforeRelay.workspace?.[collection] ?? [];
    const after = afterRelay.workspace?.[collection] ?? [];
    const beforeIndex = new Map();

    for (const record of before) {
      const id = stableId(record);
      if (!id) throw new Error(`existing ${collection} record is missing a stable id`);
      if (beforeIndex.has(id)) throw new Error(`duplicate ${collection} record ${id} before turn`);
      beforeIndex.set(id, record);
    }

    const additions = [];
    const seenAfter = new Set();
    for (const record of after) {
      const id = stableId(record);
      if (!id) throw new Error(`resulting ${collection} record is missing a stable id`);
      if (seenAfter.has(id)) throw new Error(`duplicate ${collection} record ${id} after turn`);
      seenAfter.add(id);
      const prior = beforeIndex.get(id);
      if (prior) {
        if (canonical(prior) !== canonical(record)) {
          throw new Error(`Relay turn rewrote existing ${collection} record ${id}`);
        }
      } else {
        additions.push(clone(record));
      }
    }

    for (const id of beforeIndex.keys()) {
      if (!seenAfter.has(id)) throw new Error(`Relay turn deleted existing ${collection} record ${id}`);
    }
    if (additions.length) appended[collection] = additions;
  }

  if ((afterRelay.turn_receipts ?? []).length !== (beforeRelay.turn_receipts ?? []).length + 1) {
    throw new Error('Relay turn must append exactly one turn receipt');
  }
  for (let i = 0; i < (beforeRelay.turn_receipts ?? []).length; i += 1) {
    if (canonical(beforeRelay.turn_receipts[i]) !== canonical(afterRelay.turn_receipts[i])) {
      throw new Error('Relay turn rewrote an existing turn receipt');
    }
  }

  const receipt = clone(afterRelay.turn_receipts[afterRelay.turn_receipts.length - 1]);
  if (!receipt?.receipt_id || !receipt?.turn_id) throw new Error('resulting Relay receipt is incomplete');
  if (receipt.resulting_workspace_version !== afterRelay.workspace.workspace_version) {
    throw new Error('turn receipt workspace version does not match resulting Relay workspace');
  }

  return { appended, receipt };
}

function makeWorkspaceCreatedEvent(relay, storeSequence, options = {}) {
  return makeFoundryEvent({
    event_id: `EVT:${relay.workspace.workspace_id}:WORKSPACE_CREATED`,
    workspace_id: relay.workspace.workspace_id,
    sequence: storeSequence,
    event_type: 'WORKSPACE_CREATED',
    payload: {
      relay_id: relay.relay_id,
      relay_sequence: relay.sequence,
      created_at: relay.created_at,
      workspace: clone(relay.workspace)
    },
    basis_refs: [],
    authority: 'SERVICE_RULE',
    actor_kind: 'FOUNDRY_SERVICE',
    recorded_at: options.now ?? relay.created_at ?? '1970-01-01T00:00:00.000Z',
    protocol_version: relay.workspace.protocol_version ?? '0.1'
  });
}

function makeTurnEvent(beforeRelay, afterRelay, turn, storeSequence, options = {}) {
  const { appended, receipt } = captureAppendOnlyDelta(beforeRelay, afterRelay);
  return makeFoundryEvent({
    event_id: `EVT:${afterRelay.workspace.workspace_id}:TURN:${turn.turn_id}`,
    workspace_id: afterRelay.workspace.workspace_id,
    sequence: storeSequence,
    event_type: 'FOUNDRY_TURN_COMMITTED',
    payload: {
      turn_id: turn.turn_id,
      relay_sequence: afterRelay.sequence,
      appended,
      receipt
    },
    basis_refs: deriveBasisRefs(appended),
    authority: 'SERVICE_RULE',
    actor_kind: 'FOUNDRY_SERVICE',
    recorded_at: options.now ?? receipt?.resulting_at ?? receipt?.captured_at ?? '1970-01-01T00:00:00.000Z',
    protocol_version: afterRelay.workspace.protocol_version ?? '0.1'
  });
}

export function reduceStoredRelayEvents(events = []) {
  if (!Array.isArray(events)) throw new Error('events must be an array');
  if (!events.length) return null;

  let relay = null;
  let expectedStoreSequence = 1;
  const turnIds = new Set();

  for (const event of events) {
    if (event.sequence !== expectedStoreSequence) {
      throw new Error(`stored Relay event sequence expected ${expectedStoreSequence}, received ${event.sequence}`);
    }
    expectedStoreSequence += 1;

    if (event.event_type === 'WORKSPACE_CREATED') {
      if (relay) throw new Error('WORKSPACE_CREATED must be the first and only initialization event');
      const payload = event.payload ?? {};
      const workspace = clone(payload.workspace ?? {});
      if (workspace.workspace_id !== event.workspace_id) throw new Error('WORKSPACE_CREATED workspace mismatch');
      relay = createMockRelay(workspace, {
        relay_id: payload.relay_id,
        sequence: payload.relay_sequence,
        created_at: payload.created_at
      });
      continue;
    }

    if (!relay) throw new Error(`stored Relay event ${event.event_id} appeared before WORKSPACE_CREATED`);
    if (event.workspace_id !== relay.workspace.workspace_id) throw new Error(`stored Relay workspace mismatch at ${event.event_id}`);

    if (event.event_type !== 'FOUNDRY_TURN_COMMITTED') {
      throw new Error(`unsupported stored Relay event_type ${event.event_type}`);
    }

    const payload = event.payload ?? {};
    if (!payload.turn_id) throw new Error(`turn event ${event.event_id} is missing turn_id`);
    if (turnIds.has(payload.turn_id)) throw new Error(`duplicate committed turn ${payload.turn_id}`);
    turnIds.add(payload.turn_id);

    if (payload.relay_sequence !== relay.sequence + 1) {
      throw new Error(`Relay sequence expected ${relay.sequence + 1}, received ${payload.relay_sequence}`);
    }

    for (const [collection, records] of Object.entries(payload.appended ?? {})) {
      if (!COLLECTIONS.includes(collection)) throw new Error(`turn event contains unsupported collection ${collection}`);
      if (!Array.isArray(records)) throw new Error(`turn event collection ${collection} must be an array`);
      for (const record of records) appendRecord(relay.workspace, collection, record);
    }

    const receipt = clone(payload.receipt);
    if (!receipt?.receipt_id || receipt.turn_id !== payload.turn_id) throw new Error(`turn event ${event.event_id} has invalid receipt`);
    if ((relay.turn_receipts ?? []).some(item => item.receipt_id === receipt.receipt_id || item.turn_id === receipt.turn_id)) {
      throw new Error(`duplicate turn receipt ${receipt.receipt_id}`);
    }
    relay.turn_receipts.push(receipt);
    relay.sequence = payload.relay_sequence;
    relay.workspace.workspace_version = receipt.resulting_workspace_version;

    const versionSequence = relaySequenceFromVersion(relay.workspace.workspace_version);
    if (versionSequence !== null && versionSequence !== relay.sequence) {
      throw new Error(`workspace version ${relay.workspace.workspace_version} disagrees with Relay sequence ${relay.sequence}`);
    }
  }

  return relay;
}

async function trySnapshot(store, relay, throughSequence, options = {}) {
  try {
    await store.writeSnapshot({
      workspace_id: relay.workspace.workspace_id,
      through_sequence: throughSequence,
      workspace: clone(relay.workspace),
      relay: {
        relay_id: relay.relay_id,
        relay_sequence: relay.sequence,
        created_at: relay.created_at,
        turn_receipts: clone(relay.turn_receipts ?? [])
      },
      created_at: options.now ?? '1970-01-01T00:00:00.000Z',
      protocol_version: relay.workspace.protocol_version ?? '0.1'
    });
    return { status: 'WRITTEN', error: null };
  } catch (error) {
    return { status: 'FAILED', error: error.message };
  }
}

export function createStoredRelayService(storeInput) {
  const store = assertFoundryStore(storeInput);
  let operationQueue = Promise.resolve();

  async function serialize(operation) {
    const run = operationQueue.then(operation, operation);
    operationQueue = run.then(() => undefined, () => undefined);
    return run;
  }

  async function loadWithEvents(workspaceId) {
    if (!workspaceId) throw new Error('workspaceId is required');
    const events = await store.readEvents(workspaceId);
    const relay = reduceStoredRelayEvents(events);
    return { relay, events };
  }

  return {
    async initialize(workspace, options = {}) {
      return serialize(async () => {
        if (!workspace?.workspace_id) throw new Error('workspace.workspace_id is required');
        const existing = await store.readEvents(workspace.workspace_id);
        if (existing.length) throw new Error(`workspace ${workspace.workspace_id} is already initialized; load it instead`);

        const relay = createMockRelay(workspace, options);
        const event = makeWorkspaceCreatedEvent(relay, 1, options);
        const appendResult = await store.appendEvent(event);
        const snapshot = await trySnapshot(store, relay, event.sequence, options);
        return {
          relay,
          status: 'INITIALIZED',
          custody: { event_id: event.event_id, event_sequence: event.sequence, append_status: appendResult.status, snapshot }
        };
      });
    },

    async load(workspaceId) {
      const { relay } = await loadWithEvents(workspaceId);
      if (!relay) throw new Error(`workspace ${workspaceId} is not initialized`);
      return relay;
    },

    async resume(workspaceId, options = {}) {
      const relay = await this.load(workspaceId);
      return resumeRelay(relay, options);
    },

    async processTurn(workspaceId, turn, options = {}) {
      return serialize(async () => {
        const { relay: before, events } = await loadWithEvents(workspaceId);
        if (!before) throw new Error(`workspace ${workspaceId} is not initialized`);

        const result = processRelayTurn(before, turn, options);
        if (result.replayed) {
          return { ...result, custody: { status: 'REPLAYED', event_id: `EVT:${workspaceId}:TURN:${turn.turn_id}` } };
        }

        const storeSequence = events.length ? events[events.length - 1].sequence + 1 : 1;
        const event = makeTurnEvent(before, result.relay, turn, storeSequence, options);
        const appendResult = await store.appendEvent(event);
        const snapshot = await trySnapshot(store, result.relay, event.sequence, options);

        return {
          ...result,
          custody: {
            status: 'COMMITTED',
            event_id: event.event_id,
            event_sequence: event.sequence,
            append_status: appendResult.status,
            snapshot
          }
        };
      });
    },

    async audit(workspaceId) {
      const relay = await this.load(workspaceId);
      return relayAudit(relay);
    },

    store
  };
}
