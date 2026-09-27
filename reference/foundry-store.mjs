// Atlas Ledger Foundry store contract v0.1
// Storage behavior only. No ontology, adjudication, or Atlas Reality authority.

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

export function validateFoundryEvent(event) {
  const errors = [];
  if (!event?.event_id) errors.push('missing event_id');
  if (!event?.workspace_id) errors.push('missing workspace_id');
  if (!Number.isInteger(event?.sequence) || event.sequence < 1) errors.push('sequence must be a positive integer');
  if (!event?.event_type) errors.push('missing event_type');
  if (!event || typeof event.payload !== 'object' || event.payload === null || Array.isArray(event.payload)) errors.push('payload must be an object');
  if (!Array.isArray(event?.basis_refs)) errors.push('basis_refs must be an array');
  if (!event?.authority) errors.push('missing authority');
  if (!event?.actor_kind) errors.push('missing actor_kind');
  if (!event?.recorded_at) errors.push('missing recorded_at');
  if (!event?.protocol_version) errors.push('missing protocol_version');
  return { valid: errors.length === 0, errors };
}

export function validateFoundrySnapshot(snapshot) {
  const errors = [];
  if (!snapshot?.workspace_id) errors.push('missing workspace_id');
  if (!Number.isInteger(snapshot?.through_sequence) || snapshot.through_sequence < 0) errors.push('through_sequence must be a non-negative integer');
  if (!snapshot || typeof snapshot.workspace !== 'object' || snapshot.workspace === null || Array.isArray(snapshot.workspace)) errors.push('workspace must be an object');
  if (!snapshot?.created_at) errors.push('missing created_at');
  if (!snapshot?.protocol_version) errors.push('missing protocol_version');
  return { valid: errors.length === 0, errors };
}

export function makeFoundryEvent(input) {
  const event = {
    event_id: input?.event_id,
    workspace_id: input?.workspace_id,
    sequence: input?.sequence,
    event_type: input?.event_type,
    payload: clone(input?.payload ?? {}),
    basis_refs: [...new Set(input?.basis_refs ?? [])],
    authority: input?.authority,
    actor_kind: input?.actor_kind,
    recorded_at: input?.recorded_at,
    protocol_version: input?.protocol_version ?? '0.1'
  };
  const check = validateFoundryEvent(event);
  if (!check.valid) throw new Error(check.errors.join('; '));
  return event;
}

export function assertFoundryStore(store) {
  const required = ['appendEvent','readEvents','readLatestSnapshot','writeSnapshot','hasEvent'];
  const missing = required.filter(name => typeof store?.[name] !== 'function');
  if (missing.length) throw new Error(`FoundryStore missing operation(s): ${missing.join(', ')}`);
  return store;
}

export function createMemoryStore(seed = {}) {
  const eventsByWorkspace = new Map();
  const eventsById = new Map();
  const snapshots = new Map();

  for (const raw of seed.events ?? []) {
    const event = makeFoundryEvent(raw);
    const list = eventsByWorkspace.get(event.workspace_id) ?? [];
    const expected = list.length ? list[list.length - 1].sequence + 1 : 1;
    if (event.sequence !== expected) throw new Error(`seed sequence for ${event.workspace_id} expected ${expected}, received ${event.sequence}`);
    if (eventsById.has(event.event_id)) throw new Error(`duplicate seed event_id ${event.event_id}`);
    list.push(clone(event));
    eventsByWorkspace.set(event.workspace_id, list);
    eventsById.set(event.event_id, clone(event));
  }

  for (const raw of seed.snapshots ?? []) {
    const check = validateFoundrySnapshot(raw);
    if (!check.valid) throw new Error(check.errors.join('; '));
    const prior = snapshots.get(raw.workspace_id);
    if (!prior || raw.through_sequence >= prior.through_sequence) snapshots.set(raw.workspace_id, clone(raw));
  }

  const store = {
    async appendEvent(raw) {
      const event = makeFoundryEvent(raw);
      const existing = eventsById.get(event.event_id);
      if (existing) {
        if (canonical(existing) !== canonical(event)) throw new Error(`event_id ${event.event_id} already exists with different content`);
        return { status: 'REPLAYED', event: clone(existing) };
      }

      const list = eventsByWorkspace.get(event.workspace_id) ?? [];
      const expected = list.length ? list[list.length - 1].sequence + 1 : 1;
      if (event.sequence !== expected) throw new Error(`workspace ${event.workspace_id} expected sequence ${expected}, received ${event.sequence}`);

      const stored = clone(event);
      list.push(stored);
      eventsByWorkspace.set(event.workspace_id, list);
      eventsById.set(event.event_id, stored);
      return { status: 'APPENDED', event: clone(stored) };
    },

    async readEvents(workspaceId, options = {}) {
      if (!workspaceId) throw new Error('workspaceId is required');
      const after = Number.isInteger(options.after_sequence) && options.after_sequence >= 0 ? options.after_sequence : 0;
      const through = Number.isInteger(options.through_sequence) && options.through_sequence >= after ? options.through_sequence : Infinity;
      const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : Infinity;
      return clone((eventsByWorkspace.get(workspaceId) ?? [])
        .filter(event => event.sequence > after && event.sequence <= through)
        .slice(0, limit));
    },

    async readLatestSnapshot(workspaceId) {
      if (!workspaceId) throw new Error('workspaceId is required');
      return clone(snapshots.get(workspaceId) ?? null);
    },

    async writeSnapshot(raw) {
      const snapshot = clone(raw);
      const check = validateFoundrySnapshot(snapshot);
      if (!check.valid) throw new Error(check.errors.join('; '));
      const events = eventsByWorkspace.get(snapshot.workspace_id) ?? [];
      const latestSequence = events.length ? events[events.length - 1].sequence : 0;
      if (snapshot.through_sequence > latestSequence) {
        throw new Error(`snapshot through_sequence ${snapshot.through_sequence} exceeds stored event sequence ${latestSequence}`);
      }
      const prior = snapshots.get(snapshot.workspace_id);
      if (prior && snapshot.through_sequence < prior.through_sequence) {
        throw new Error(`snapshot regression for ${snapshot.workspace_id}: ${snapshot.through_sequence} < ${prior.through_sequence}`);
      }
      snapshots.set(snapshot.workspace_id, snapshot);
      return clone(snapshot);
    },

    async hasEvent(eventId) {
      if (!eventId) throw new Error('eventId is required');
      return eventsById.has(eventId);
    }
  };

  return assertFoundryStore(store);
}
