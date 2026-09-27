// Atlas Ledger Foundry FileStore v0.1
// Append-only JSONL event custody plus replaceable atomic snapshots.
// Development/reference adapter only. No ontology, adjudication, or Atlas Reality authority.

import { mkdir, readdir, readFile, appendFile, writeFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import {
  assertFoundryStore,
  makeFoundryEvent,
  validateFoundrySnapshot
} from './foundry-store.mjs';

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

function encodeWorkspaceId(workspaceId) {
  return Buffer.from(String(workspaceId), 'utf8').toString('base64url');
}

function decodeWorkspaceId(segment) {
  const decoded = Buffer.from(segment, 'base64url').toString('utf8');
  if (encodeWorkspaceId(decoded) !== segment) throw new Error(`invalid FileStore workspace directory ${segment}`);
  return decoded;
}

function parseJsonLine(line, filePath, lineNumber) {
  try {
    return JSON.parse(line);
  } catch (error) {
    throw new Error(`invalid JSON in ${filePath} at line ${lineNumber}: ${error.message}`);
  }
}

function validateReadOptions(options = {}) {
  const after = Number.isInteger(options.after_sequence) && options.after_sequence >= 0
    ? options.after_sequence
    : 0;
  const through = Number.isInteger(options.through_sequence) && options.through_sequence >= after
    ? options.through_sequence
    : Infinity;
  const limit = Number.isInteger(options.limit) && options.limit > 0
    ? options.limit
    : Infinity;
  return { after, through, limit };
}

export function createFileStore(rootDir, options = {}) {
  if (!rootDir || typeof rootDir !== 'string') throw new Error('rootDir is required');

  const absoluteRoot = path.resolve(rootDir);
  const workspacesDir = path.join(absoluteRoot, 'workspaces');
  const eventIndex = new Map();
  const eventsByWorkspace = new Map();
  let initialized = false;
  let initializing = null;
  let writeQueue = Promise.resolve();

  const workspaceDir = workspaceId => path.join(workspacesDir, encodeWorkspaceId(workspaceId));
  const eventsPath = workspaceId => path.join(workspaceDir(workspaceId), 'events.jsonl');
  const snapshotPath = workspaceId => path.join(workspaceDir(workspaceId), 'snapshot.json');

  async function readJournal(workspaceId, filePath = eventsPath(workspaceId)) {
    let raw;
    try {
      raw = await readFile(filePath, 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') return [];
      throw error;
    }

    const lines = raw.split('\n').filter(line => line.trim().length > 0);
    const events = [];
    let expected = 1;
    const localIds = new Set();

    for (let i = 0; i < lines.length; i += 1) {
      const parsed = parseJsonLine(lines[i], filePath, i + 1);
      const event = makeFoundryEvent(parsed);
      if (event.workspace_id !== workspaceId) {
        throw new Error(`journal workspace mismatch in ${filePath}: expected ${workspaceId}, received ${event.workspace_id}`);
      }
      if (event.sequence !== expected) {
        throw new Error(`journal sequence for ${workspaceId} expected ${expected}, received ${event.sequence}`);
      }
      if (localIds.has(event.event_id)) throw new Error(`duplicate event_id ${event.event_id} in ${filePath}`);
      localIds.add(event.event_id);
      events.push(event);
      expected += 1;
    }
    return events;
  }

  async function initialize() {
    if (initialized) return;
    if (initializing) return initializing;

    initializing = (async () => {
      await mkdir(workspacesDir, { recursive: true });
      const entries = await readdir(workspacesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const workspaceId = decodeWorkspaceId(entry.name);
        const list = await readJournal(workspaceId, path.join(workspacesDir, entry.name, 'events.jsonl'));
        eventsByWorkspace.set(workspaceId, list.map(clone));
        for (const event of list) {
          const existing = eventIndex.get(event.event_id);
          if (existing) throw new Error(`duplicate event_id ${event.event_id} across FileStore workspaces`);
          eventIndex.set(event.event_id, clone(event));
        }
      }
      initialized = true;
    })();

    try {
      await initializing;
    } finally {
      initializing = null;
    }
  }

  async function serializeWrite(operation) {
    const run = writeQueue.then(operation, operation);
    writeQueue = run.then(() => undefined, () => undefined);
    return run;
  }

  const store = {
    async appendEvent(raw) {
      const event = makeFoundryEvent(raw);
      await initialize();

      return serializeWrite(async () => {
        const existing = eventIndex.get(event.event_id);
        if (existing) {
          if (canonical(existing) !== canonical(event)) {
            throw new Error(`event_id ${event.event_id} already exists with different content`);
          }
          return { status: 'REPLAYED', event: clone(existing) };
        }

        const list = eventsByWorkspace.get(event.workspace_id) ?? [];
        const expected = list.length ? list[list.length - 1].sequence + 1 : 1;
        if (event.sequence !== expected) {
          throw new Error(`workspace ${event.workspace_id} expected sequence ${expected}, received ${event.sequence}`);
        }

        await mkdir(workspaceDir(event.workspace_id), { recursive: true });
        await appendFile(eventsPath(event.workspace_id), `${JSON.stringify(event)}\n`, { encoding: 'utf8' });

        const stored = clone(event);
        list.push(stored);
        eventsByWorkspace.set(event.workspace_id, list);
        eventIndex.set(event.event_id, stored);
        return { status: 'APPENDED', event: clone(stored) };
      });
    },

    async readEvents(workspaceId, readOptions = {}) {
      if (!workspaceId) throw new Error('workspaceId is required');
      await initialize();
      const { after, through, limit } = validateReadOptions(readOptions);
      return clone((eventsByWorkspace.get(workspaceId) ?? [])
        .filter(event => event.sequence > after && event.sequence <= through)
        .slice(0, limit));
    },

    async readLatestSnapshot(workspaceId) {
      if (!workspaceId) throw new Error('workspaceId is required');
      await initialize();
      let raw;
      try {
        raw = await readFile(snapshotPath(workspaceId), 'utf8');
      } catch (error) {
        if (error?.code === 'ENOENT') return null;
        throw error;
      }
      let snapshot;
      try {
        snapshot = JSON.parse(raw);
      } catch (error) {
        throw new Error(`invalid snapshot JSON for ${workspaceId}: ${error.message}`);
      }
      const check = validateFoundrySnapshot(snapshot);
      if (!check.valid) throw new Error(check.errors.join('; '));
      if (snapshot.workspace_id !== workspaceId) {
        throw new Error(`snapshot workspace mismatch: expected ${workspaceId}, received ${snapshot.workspace_id}`);
      }
      const events = eventsByWorkspace.get(workspaceId) ?? [];
      const latestSequence = events.length ? events[events.length - 1].sequence : 0;
      if (snapshot.through_sequence > latestSequence) {
        throw new Error(`snapshot through_sequence ${snapshot.through_sequence} exceeds stored event sequence ${latestSequence}`);
      }
      return clone(snapshot);
    },

    async writeSnapshot(raw) {
      await initialize();
      const snapshot = clone(raw);
      const check = validateFoundrySnapshot(snapshot);
      if (!check.valid) throw new Error(check.errors.join('; '));

      return serializeWrite(async () => {
        const events = eventsByWorkspace.get(snapshot.workspace_id) ?? [];
        const latestSequence = events.length ? events[events.length - 1].sequence : 0;
        if (snapshot.through_sequence > latestSequence) {
          throw new Error(`snapshot through_sequence ${snapshot.through_sequence} exceeds stored event sequence ${latestSequence}`);
        }

        const prior = await store.readLatestSnapshot(snapshot.workspace_id);
        if (prior && snapshot.through_sequence < prior.through_sequence) {
          throw new Error(`snapshot regression for ${snapshot.workspace_id}: ${snapshot.through_sequence} < ${prior.through_sequence}`);
        }

        const dir = workspaceDir(snapshot.workspace_id);
        await mkdir(dir, { recursive: true });
        const finalPath = snapshotPath(snapshot.workspace_id);
        const tempPath = `${finalPath}.${process.pid}.${Date.now()}.tmp`;
        try {
          await writeFile(tempPath, `${JSON.stringify(snapshot, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
          await rename(tempPath, finalPath);
        } catch (error) {
          await rm(tempPath, { force: true }).catch(() => {});
          throw error;
        }
        return clone(snapshot);
      });
    },

    async hasEvent(eventId) {
      if (!eventId) throw new Error('eventId is required');
      await initialize();
      return eventIndex.has(eventId);
    },

    // Operational metadata only; Foundry logic must not depend on it.
    adapter_info: Object.freeze({
      kind: 'FILE',
      root_dir: absoluteRoot,
      concurrency: options.concurrency ?? 'SINGLE_PROCESS_SERIALIZED_WRITES'
    })
  };

  return assertFoundryStore(store);
}
