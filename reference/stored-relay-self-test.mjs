import assert from 'node:assert/strict';
import { createMemoryStore } from './foundry-store.mjs';
import { createStoredRelayService, reduceStoredRelayEvents } from './stored-relay.mjs';

const workspace = {
  workspace_id: 'W-STORED',
  protocol_version: '0.1',
  status: 'DISCOVERY',
  boundary_status: 'PROVISIONAL',
  provisional_subject: { label: 'Example field', subject_ref: null },
  provisional_field: 'named industry is context only',
  assertions: [],
  testimony: [],
  unknowns: [],
  contradictions: [],
  discrepancies: [],
  signals: [],
  ledger_candidates: [],
  closure: [],
  acceptance_cases: []
};

const store = createMemoryStore();
const service = createStoredRelayService(store);

const initialized = await service.initialize(workspace, {
  relay_id: 'R-STORED',
  created_at: '2026-09-27T21:00:00.000Z',
  now: '2026-09-27T21:00:00.000Z'
});
assert.equal(initialized.status, 'INITIALIZED');
assert.equal(initialized.custody.event_sequence, 1);
assert.equal(initialized.custody.snapshot.status, 'WRITTEN');

const opening = await service.resume('W-STORED', { session_id: 'S-1' });
assert.equal(opening.next_question.operator, 'NARRATE');

const first = await service.processTurn('W-STORED', {
  turn_id: '001',
  expected_workspace_version: 'relay-0',
  human_input: 'Once the work is ready, Dana takes custody. Anything above the normal limit comes back to me.',
  discovery_observations: [
    {
      observation_id: 'O-CUSTODY',
      discovery_lens: 'CUSTODY',
      subject_label: 'execution custody',
      description: 'Responsibility moves after a readiness condition.',
      supporting_refs: ['$turn_testimony'],
      industry_assumption: false,
      materiality: 'HIGH'
    },
    {
      observation_id: 'O-BOUNDARY',
      discovery_lens: 'BOUNDARY',
      subject_label: 'approval authority',
      description: 'Approval authority changes at a threshold.',
      supporting_refs: ['$turn_testimony'],
      cluster_refs: ['O-CUSTODY'],
      industry_assumption: false,
      materiality: 'HIGH',
      blocking: true
    }
  ]
}, { now: '2026-09-27T21:01:00.000Z' });

assert.equal(first.custody.status, 'COMMITTED');
assert.equal(first.custody.event_sequence, 2);
assert.equal(first.receipt.testimony_preserved, true);
assert.equal(first.receipt.discovery.status, 'ACCEPTED');
assert.equal(first.receipt.next_question.operator, 'BOUND');
assert.equal(first.relay.workspace.workspace_version, 'relay-1');

const eventsAfterFirst = await store.readEvents('W-STORED');
assert.deepEqual(eventsAfterFirst.map(event => event.event_type), ['WORKSPACE_CREATED', 'FOUNDRY_TURN_COMMITTED']);
assert.equal(eventsAfterFirst[1].payload.appended.testimony.length, 1);
assert.equal(eventsAfterFirst[1].payload.appended.discovery_observations.length, 2);
assert.equal(eventsAfterFirst[1].payload.appended.discovery_gaps.length, 2);
assert.ok(!('workspace' in eventsAfterFirst[1].payload), 'turn event must be a delta, not whole-workspace replacement');

// A fresh Relay service has no conversational memory and reconstructs from store history.
const freshService = createStoredRelayService(store);
const resumed = await freshService.resume('W-STORED', { session_id: 'S-2' });
assert.equal(resumed.workspace_version, 'relay-1');
assert.equal(resumed.next_question.operator, 'BOUND');
assert.ok(resumed.evidence_refs.includes('T-001'));

const recoveredRelay = await freshService.load('W-STORED');
assert.equal(recoveredRelay.turn_receipts.length, 1);
assert.equal(recoveredRelay.workspace.testimony[0].content, first.relay.workspace.testimony[0].content);
assert.deepEqual(recoveredRelay.workspace.discovery_gaps, first.relay.workspace.discovery_gaps);

// Event history alone is sufficient; snapshots are an optimization.
const eventOnlyStore = createMemoryStore({ events: eventsAfterFirst });
const eventOnlyService = createStoredRelayService(eventOnlyStore);
const eventOnlyRelay = await eventOnlyService.load('W-STORED');
assert.equal(eventOnlyRelay.workspace.workspace_version, 'relay-1');
assert.equal(eventOnlyRelay.turn_receipts[0].turn_id, '001');
assert.equal((await eventOnlyService.resume('W-STORED')).next_question.operator, 'BOUND');

// Retrying the same turn reconstructs the prior receipt and does not append a second event.
const replay = await freshService.processTurn('W-STORED', {
  turn_id: '001',
  human_input: 'Once the work is ready, Dana takes custody. Anything above the normal limit comes back to me.'
}, { now: '2026-09-27T21:02:00.000Z' });
assert.equal(replay.replayed, true);
assert.equal(replay.custody.status, 'REPLAYED');
assert.equal((await store.readEvents('W-STORED')).length, 2);

await assert.rejects(
  freshService.processTurn('W-STORED', {
    turn_id: '001',
    human_input: 'Different testimony under the same turn ID.'
  }),
  /already used with different testimony/
);
assert.equal((await store.readEvents('W-STORED')).length, 2);

// Stale carrier context still preserves testimony, but cannot persist stale discovery/adjudication work.
const stale = await freshService.processTurn('W-STORED', {
  turn_id: '002',
  expected_workspace_version: 'relay-0',
  human_input: 'This came from a stale carrier.',
  discovery_observations: [{
    observation_id: 'O-STALE',
    discovery_lens: 'SOURCE',
    description: 'This should not be committed from stale context.',
    supporting_refs: ['$turn_testimony'],
    industry_assumption: false
  }]
}, { now: '2026-09-27T21:03:00.000Z' });

assert.equal(stale.receipt.stale_context, true);
assert.equal(stale.receipt.testimony_preserved, true);
assert.equal(stale.receipt.discovery.status, 'NOT_SUBMITTED');
assert.equal(stale.relay.workspace.workspace_version, 'relay-2');

const thirdEvent = (await store.readEvents('W-STORED'))[2];
assert.equal(thirdEvent.event_type, 'FOUNDRY_TURN_COMMITTED');
assert.equal(thirdEvent.payload.appended.testimony.length, 1);
assert.ok(!thirdEvent.payload.appended.discovery_observations);
assert.ok(!thirdEvent.payload.appended.discovery_gaps);

// Reducer rejects in-place rewrite attempts hidden inside a later turn event.
const corrupted = (await store.readEvents('W-STORED')).map(item => structuredClone(item));
corrupted[2].payload.appended.testimony[0] = {
  ...corrupted[0].payload.workspace.testimony?.[0],
  testimony_id: 'T-001',
  record_type: 'testimony',
  content: 'rewritten custody history'
};
assert.throws(() => reduceStoredRelayEvents(corrupted), /rewrite testimony record T-001/);

const audit = await freshService.audit('W-STORED');
assert.equal(audit.workspace_version, 'relay-2');
assert.equal(audit.testimony_count, 2);
assert.equal(audit.discovery_observation_count, 2);

console.log('Foundry store-backed Relay self-test passed.');
