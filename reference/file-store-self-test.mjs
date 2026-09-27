import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createFileStore } from './file-store.mjs';

function event(sequence, eventId, overrides = {}) {
  return {
    event_id: eventId,
    workspace_id: 'W-FILE',
    sequence,
    event_type: 'TESTIMONY_PRESERVED',
    payload: { testimony_id: `T-${sequence}`, content: `testimony ${sequence}` },
    basis_refs: [],
    authority: 'HUMAN_TESTIMONY',
    actor_kind: 'CARRIER',
    recorded_at: `2026-09-27T20:0${sequence}:00.000Z`,
    protocol_version: '0.1',
    ...overrides
  };
}

const root = await mkdtemp(path.join(tmpdir(), 'atlas-foundry-filestore-'));

try {
  const store = createFileStore(root);

  const first = event(1, 'EVT-001');
  const second = event(2, 'EVT-002', {
    event_type: 'DISCOVERY_GAP_OPENED',
    payload: { gap_id: 'DG-001' },
    basis_refs: ['T-1'],
    authority: 'GOVERNED_DERIVATION'
  });

  assert.equal((await store.appendEvent(first)).status, 'APPENDED');
  assert.equal((await store.appendEvent(second)).status, 'APPENDED');
  assert.equal((await store.appendEvent(second)).status, 'REPLAYED');

  await assert.rejects(
    store.appendEvent({ ...second, payload: { gap_id: 'DIFFERENT' } }),
    /already exists with different content/
  );

  await assert.rejects(
    store.appendEvent(event(4, 'EVT-004')),
    /expected sequence 3, received 4/
  );

  const tail = await store.readEvents('W-FILE', { after_sequence: 1 });
  assert.deepEqual(tail.map(item => item.event_id), ['EVT-002']);
  assert.equal(await store.hasEvent('EVT-001'), true);
  assert.equal(await store.hasEvent('MISSING'), false);

  const snapshot2 = {
    workspace_id: 'W-FILE',
    through_sequence: 2,
    workspace: { workspace_id: 'W-FILE', workspace_version: 'relay-2' },
    created_at: '2026-09-27T20:10:00.000Z',
    protocol_version: '0.1'
  };
  await store.writeSnapshot(snapshot2);
  assert.deepEqual(await store.readLatestSnapshot('W-FILE'), snapshot2);

  await assert.rejects(
    store.writeSnapshot({ ...snapshot2, through_sequence: 3 }),
    /exceeds stored event sequence 2/
  );
  await assert.rejects(
    store.writeSnapshot({ ...snapshot2, through_sequence: 1 }),
    /snapshot regression/
  );

  // A new adapter instance reconstructs durable custody from disk, not process memory.
  const reopened = createFileStore(root);
  const recovered = await reopened.readEvents('W-FILE');
  assert.deepEqual(recovered.map(item => item.event_id), ['EVT-001', 'EVT-002']);
  assert.deepEqual(await reopened.readLatestSnapshot('W-FILE'), snapshot2);
  assert.equal(await reopened.hasEvent('EVT-002'), true);

  // Event IDs remain globally unique inside one FileStore root.
  await assert.rejects(
    reopened.appendEvent(event(1, 'EVT-001', { workspace_id: 'W-OTHER' })),
    /already exists with different content/
  );

  // Writes through one adapter instance are serialized into one monotonic journal.
  const third = event(3, 'EVT-003');
  const fourth = event(4, 'EVT-004');
  const [thirdResult, fourthResult] = await Promise.all([
    reopened.appendEvent(third),
    reopened.appendEvent(fourth)
  ]);
  assert.equal(thirdResult.status, 'APPENDED');
  assert.equal(fourthResult.status, 'APPENDED');
  assert.deepEqual((await reopened.readEvents('W-FILE')).map(item => item.sequence), [1, 2, 3, 4]);

  const snapshot4 = {
    ...snapshot2,
    through_sequence: 4,
    workspace: { workspace_id: 'W-FILE', workspace_version: 'relay-4' },
    created_at: '2026-09-27T20:12:00.000Z'
  };
  await reopened.writeSnapshot(snapshot4);

  const reopenedAgain = createFileStore(root);
  assert.equal((await reopenedAgain.readLatestSnapshot('W-FILE')).through_sequence, 4);
  assert.deepEqual((await reopenedAgain.readEvents('W-FILE', { after_sequence: 2, limit: 1 })).map(item => item.event_id), ['EVT-003']);

  // The physical journal is newline-delimited immutable event custody.
  const workspaceSegment = Buffer.from('W-FILE', 'utf8').toString('base64url');
  const journal = await readFile(path.join(root, 'workspaces', workspaceSegment, 'events.jsonl'), 'utf8');
  assert.equal(journal.trim().split('\n').length, 4);

  console.log('Foundry FileStore self-test passed.');
} finally {
  await rm(root, { recursive: true, force: true });
}
