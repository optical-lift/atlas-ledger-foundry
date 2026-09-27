import assert from 'node:assert/strict';
import { selectNextQuestion, runReadinessCheck } from './foundry-engines.mjs';

const questionWorkspace = {
  protocol_version: '0.1',
  boundary_status: 'PROVISIONAL',
  contradictions: [{ contradiction_id: 'C001', status: 'OPEN', blocking: true, description: 'Two current accounts disagree about who can approve a receiving organization.', record_refs: ['A010','A011'] }],
  unknowns: [{ unknown_id: 'U001', status: 'OPEN', blocking: false, materiality: 'LOW', description: 'Exact historical date of a prior location change.' }],
  ledger_candidates: [{ ledger_candidate_id: 'L001', label: 'Related Program', status: 'UNRESOLVED', blocking: true }],
  assertions: [], closure: [], acceptance_cases: []
};

const next = selectNextQuestion(questionWorkspace);
assert.equal(next.status, 'QUESTION_AVAILABLE');
assert.equal(next.primary.related_refs[0], 'C001');
assert.equal(next.primary.priority_class, 'P1');

const notReady = runReadinessCheck({
  ...questionWorkspace,
  closure: [{ closure_id: 'CL001', label: 'Receiving organizations', status: 'NOT_YET_RECONCILED', materiality: 'MATERIAL' }],
  acceptance_cases: [{ case_id: 'AC001', scenario: 'A scheduled host becomes unavailable after travel is committed.', status: 'NOT_RUN' }]
});

assert.equal(notReady.ready, false);
for (const code of ['BOUNDARY_UNRESOLVED','BLOCKING_CONTRADICTION','BLOCKING_TOPOLOGY','MATERIAL_CLOSURE_OPEN','ACCEPTANCE_NOT_PASSING']) {
  assert.ok(notReady.blockers.some(b => b.code === code), `missing blocker ${code}`);
}

const ready = runReadinessCheck({
  protocol_version: '0.1',
  boundary_status: 'SUFFICIENTLY_BOUNDED',
  contradictions: [],
  unknowns: [{ unknown_id: 'U100', status: 'OPEN', blocking: false, materiality: 'LOW', description: 'Exact historical purchase date of a retired asset.' }],
  ledger_candidates: [],
  assertions: [{ assertion_id: 'A100', stage: 'ESTABLISHED', kind: 'authority_relation', materiality: 'HIGH', basis_refs: ['T100'] }],
  closure: [{ closure_id: 'CL100', label: 'People with current decision authority', status: 'CLOSED_COMPLETE', materiality: 'MATERIAL' }],
  acceptance_cases: [{ case_id: 'AC100', scenario: 'Primary decision-maker is unavailable.', status: 'PASS' }]
});

assert.equal(ready.ready, true);
assert.equal(ready.blockers.length, 0);
assert.equal(ready.non_blocking_unknowns.length, 1);

console.log('Foundry reference engine self-test passed.');
