import assert from 'node:assert/strict';
import { createMockRelay, resumeRelay, processRelayTurn, relayAudit } from './mock-relay.mjs';

const relay0 = createMockRelay({
  workspace_id: 'W-RELAY',
  protocol_version: '0.1',
  status: 'DISCOVERY',
  boundary_status: 'PROVISIONAL',
  provisional_subject: { label: 'Acme', subject_ref: null },
  provisional_field: 'landscaping company',
  assertions: [],
  testimony: [],
  unknowns: [],
  contradictions: [],
  discrepancies: [],
  signals: [],
  ledger_candidates: [],
  closure: [],
  acceptance_cases: []
}, { relay_id: 'R1' });

const opening = resumeRelay(relay0, { session_id: 'SESSION-A' });
assert.equal(opening.next_question.operator, 'NARRATE');

const turn1 = processRelayTurn(relay0, {
  turn_id: '001',
  session_id: 'SESSION-A',
  human_input: 'Once a job is ready, the crew lead takes over. Anything above the normal spend limit comes back to me for approval.',
  discovery_observations: [
    {
      observation_id: 'O-CUSTODY',
      discovery_lens: 'CUSTODY',
      subject_label: 'execution responsibility',
      description: 'Responsibility moves to an execution bearer after a readiness condition.',
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
      industry_assumption: false,
      materiality: 'HIGH',
      blocking: true
    }
  ]
}, { now: '2026-09-27T20:00:00Z' });

assert.equal(turn1.receipt.testimony_preserved, true);
assert.equal(turn1.receipt.discovery.status, 'ACCEPTED');
assert.equal(turn1.receipt.next_question.operator, 'BOUND');
assert.equal(turn1.receipt.next_question.discovery_lens, 'BOUNDARY');
assert.equal(turn1.receipt.next_question.industry_assumption, false);

const resumed = resumeRelay(turn1.relay, { session_id: 'SESSION-B' });
assert.equal(resumed.next_question.operator, 'BOUND');
assert.ok(resumed.next_question.supporting_refs.includes('T-001'));
assert.ok(resumed.orientation.core_rules.some(r => /Industry label/i.test(r)));
assert.ok(resumed.evidence_refs.includes('T-001'));

// Invalid downstream discovery cannot erase testimony already preserved.
const bad = processRelayTurn(turn1.relay, {
  turn_id: '002',
  session_id: 'SESSION-B',
  human_input: 'We also have another approval path.',
  discovery_observations: [{
    observation_id: 'O-BAD',
    discovery_lens: 'SOURCE',
    description: 'An unsupported source claim.',
    supporting_refs: ['MISSING-REF'],
    industry_assumption: false
  }]
}, { now: '2026-09-27T20:01:00Z' });

assert.equal(bad.receipt.discovery.status, 'REJECTED');
assert.ok(bad.relay.workspace.testimony.some(t => t.testimony_id === 'T-002'));
assert.ok(!bad.relay.workspace.discovery_observations.some(o => o.observation_id === 'O-BAD'));

// Derived records are not a substitute for preserved source/testimony evidence.
const derivedOnly = processRelayTurn(turn1.relay, {
  turn_id: '003',
  session_id: 'SESSION-B',
  human_input: 'That boundary is the important part.',
  discovery_observations: [{
    observation_id: 'O-DERIVED',
    discovery_lens: 'SOURCE',
    description: 'Attempts to ground a new discovery observation only in a prior derived gap.',
    supporting_refs: ['DG-O-BOUNDARY'],
    industry_assumption: false
  }]
}, { now: '2026-09-27T20:01:30Z' });

assert.equal(derivedOnly.receipt.testimony_preserved, true);
assert.equal(derivedOnly.receipt.discovery.status, 'REJECTED');
assert.ok(derivedOnly.receipt.discovery.errors.some(e => /preserved source\/testimony evidence/i.test(e)));
assert.ok(derivedOnly.relay.workspace.testimony.some(t => t.testimony_id === 'T-003'));
assert.ok(!derivedOnly.relay.workspace.discovery_observations.some(o => o.observation_id === 'O-DERIVED'));

// Stale carrier context may append testimony but cannot apply discovery or adjudication work.
const stale = processRelayTurn(turn1.relay, {
  turn_id: '004',
  session_id: 'SESSION-STALE',
  expected_workspace_version: 'relay-0',
  human_input: 'This answer came from a stale session.',
  discovery_observations: [{
    observation_id: 'O-STALE',
    discovery_lens: 'BOUNDARY',
    description: 'A stale carrier tries to submit a boundary observation.',
    supporting_refs: ['$turn_testimony'],
    industry_assumption: false
  }],
  interpretation_plan: {
    plan_id: 'P-STALE',
    case_id: 'C-STALE',
    testimony_refs: ['$turn_testimony'],
    candidate_unknowns: [{ unknown_id: 'U-STALE', description: 'Should never be applied from stale context.' }]
  }
}, { now: '2026-09-27T20:01:45Z' });

assert.equal(stale.receipt.testimony_preserved, true);
assert.equal(stale.receipt.stale_context, true);
assert.equal(stale.receipt.discovery.status, 'NOT_SUBMITTED');
assert.equal(stale.receipt.adjudication.status, 'STALE_CONTEXT');
assert.ok(stale.relay.workspace.testimony.some(t => t.testimony_id === 'T-004'));
assert.ok(!stale.relay.workspace.discovery_observations.some(o => o.observation_id === 'O-STALE'));
assert.ok(!stale.relay.workspace.unknowns.some(u => u.unknown_id === 'U-STALE'));

// A Relay created from an existing Relay checkpoint must not regress its version sequence.
const checkpointRelay = createMockRelay({
  workspace_id: 'W-CHECKPOINT',
  workspace_version: 'relay-7',
  protocol_version: '0.1',
  status: 'DISCOVERY',
  boundary_status: 'PROVISIONAL',
  provisional_field: 'existing checkpoint'
}, { relay_id: 'R-CHECKPOINT' });

assert.equal(checkpointRelay.sequence, 7);
const checkpointTurn = processRelayTurn(checkpointRelay, {
  turn_id: '008',
  expected_workspace_version: 'relay-7',
  human_input: 'Continue from the existing checkpoint.'
}, { now: '2026-09-27T20:01:50Z' });
assert.equal(checkpointTurn.receipt.resulting_workspace_version, 'relay-8');

// AI may propose a truth-changing authority interpretation, but Relay must leave it for confirmation.
const authorityBase = createMockRelay({
  workspace_id: 'W-AUTH',
  protocol_version: '0.1',
  status: 'RECONCILIATION',
  boundary_status: 'PROVISIONAL',
  provisional_subject: { label: 'Program', subject_ref: 'E1' },
  provisional_field: 'approval authority',
  assertions: [{
    assertion_id: 'A300',
    stage: 'ESTABLISHED',
    kind: 'authority_relation',
    materiality: 'HIGH',
    basis_refs: ['T-BASE'],
    interpretation_note: 'Approval authority is not yet bounded.'
  }],
  testimony: [{
    testimony_id: 'T-BASE',
    record_type: 'testimony',
    content: 'I normally approve them.',
    representation: 'EXACT',
    source_refs: []
  }]
}, { relay_id: 'R-AUTH' });

const authorityTurn = processRelayTurn(authorityBase, {
  turn_id: '101',
  human_input: 'Ricardo can approve them once the team is in Argentina, but before that I have to approve it.',
  interpretation_plan: {
    plan_id: 'P101',
    case_id: 'C101',
    testimony_refs: ['$turn_testimony'],
    candidate_assertions: [{
      assertion_id: 'A301',
      kind: 'authority_relation',
      description: 'Approval authority changes by stage/location.',
      basis_refs: ['$turn_testimony'],
      proposed_disposition: 'SCOPE',
      affected_refs: ['A300'],
      reason_code: 'AUTHORITY_CLARIFIED'
    }]
  },
  authority: 'AI_RECOMMENDATION'
}, { now: '2026-09-27T20:02:00Z' });

assert.equal(authorityTurn.receipt.adjudication.status, 'NEEDS_ADJUDICATION');
assert.equal(authorityTurn.receipt.adjudication.requires_confirmation.length, 1);
assert.ok(authorityTurn.relay.workspace.adjudication_cases.some(c => c.case_id === 'C101' && c.status === 'ADJUDICATING'));

const freshAuthoritySession = resumeRelay(authorityTurn.relay, { session_id: 'SESSION-C' });
assert.ok(freshAuthoritySession.blockers.some(b => b.code === 'ADJUDICATION_CASE_OPEN'));
assert.equal(freshAuthoritySession.next_question.operator, 'VERIFY');

// Idempotent replay returns the prior receipt and does not duplicate testimony.
const replay = processRelayTurn(turn1.relay, {
  turn_id: '001',
  human_input: 'Once a job is ready, the crew lead takes over. Anything above the normal spend limit comes back to me for approval.'
});
assert.equal(replay.replayed, true);
assert.equal(replay.relay.workspace.testimony.filter(t => t.testimony_id === 'T-001').length, 1);

const audit = relayAudit(turn1.relay);
assert.equal(audit.testimony_count, 1);
assert.equal(audit.discovery_observation_count, 2);
assert.equal(audit.discovery_gap_count, 2);

console.log('Foundry mock Relay self-test passed.');
