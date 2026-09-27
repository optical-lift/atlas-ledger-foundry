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
