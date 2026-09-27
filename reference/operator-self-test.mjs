import assert from 'node:assert/strict';
import { buildQuestionPlan, OPERATOR_NAMES } from './question-operators.mjs';
import { selectNextQuestion, runReadinessCheck } from './foundry-engines.mjs';

const cases = [
  ['NARRATE', { id:'N1', type:'narrative', reason:'New field', subject_label:'a new program' }],
  ['GATE', { id:'G1', type:'gate', reason:'Whether vendors exist', subject_label:'outside vendors' }],
  ['DISCRIMINATE', { id:'D1', type:'contradiction', reason:'Two accounts disagree', blocking:true, materiality:'HIGH' }],
  ['TRACE', { id:'T1', type:'provenance', reason:'Find the source', materiality:'MEDIUM' }],
  ['INVERT', { id:'I1', type:'completeness', reason:'Check omitted people', subject_label:'decision-makers' }],
  ['VERIFY', { id:'V1', type:'verification', reason:'Alex has final approval authority' }],
  ['DEFINE_BY_FUNCTION', { id:'F1', type:'function', reason:'The user calls this person a manager', subject_label:'manager' }],
  ['BOUND', { id:'B1', type:'boundary', reason:'Approval authority scope is unclear' }],
  ['TRIGGER', { id:'TR1', type:'transition', reason:'When approved becomes scheduled' }],
  ['EXCEPTION', { id:'E1', type:'exception', reason:'Normal approval rule may be overridden' }],
  ['COUNTERFACTUAL', { id:'C1', type:'counterfactual', reason:'This program appears independently governed' }],
  ['SIGNPOST', { id:'S1', type:'signpost', reason:'Alex currently has final authority' }],
  ['CLOSE', { id:'CL1', type:'closure', reason:'Close the current locations collection', subject_label:'current locations' }],
  ['ESCALATE', { id:'ES1', type:'provenance', reason:'Who can bind the organization to a large obligation', blocking:true, materiality:'CRITICAL' }]
];

for (const [expected, candidate] of cases) {
  const plan = buildQuestionPlan(candidate);
  assert.equal(plan.operator, expected, `${candidate.id} expected ${expected}, got ${plan.operator}`);
  assert.ok(plan.question.length > 20);
  assert.ok(OPERATOR_NAMES.includes(plan.operator));
}

const topology = selectNextQuestion({
  protocol_version:'0.1', boundary_status:'PROVISIONAL', status:'RECONCILIATION', contradictions:[], unknowns:[], assertions:[], closure:[], acceptance_cases:[],
  ledger_candidates:[{ledger_candidate_id:'L1', label:'Related Program', status:'UNRESOLVED', blocking:true}]
});
assert.equal(topology.primary.operator, 'DISCRIMINATE');

const inverse = selectNextQuestion({
  protocol_version:'0.1', boundary_status:'SUFFICIENTLY_BOUNDED', status:'CLOSURE', contradictions:[], unknowns:[], assertions:[], ledger_candidates:[], acceptance_cases:[],
  closure:[{closure_id:'CL2', label:'Current people', status:'NOT_YET_RECONCILED', materiality:'MATERIAL', collection:true, known_member_count:4, inverse_checked:false}]
});
assert.equal(inverse.primary.operator, 'INVERT');

const close = selectNextQuestion({
  protocol_version:'0.1', boundary_status:'SUFFICIENTLY_BOUNDED', status:'CLOSURE', contradictions:[], unknowns:[], assertions:[], ledger_candidates:[], acceptance_cases:[],
  closure:[{closure_id:'CL3', label:'Current people', status:'NOT_YET_RECONCILED', materiality:'MATERIAL', collection:true, known_member_count:4, inverse_checked:true}]
});
assert.equal(close.primary.operator, 'CLOSE');

const signpost = selectNextQuestion({
  protocol_version:'0.1', boundary_status:'SUFFICIENTLY_BOUNDED', status:'RECONCILIATION', contradictions:[], unknowns:[], closure:[], ledger_candidates:[], acceptance_cases:[],
  assertions:[{assertion_id:'A1', stage:'ESTABLISHED', kind:'authority_relation', materiality:'HIGH', basis_refs:['T1'], needs_signpost:true, interpretation_note:'Alex currently has final approval authority.'}]
});
assert.equal(signpost.primary.operator, 'SIGNPOST');

const readiness = runReadinessCheck({
  protocol_version:'0.1', boundary_status:'SUFFICIENTLY_BOUNDED', contradictions:[], unknowns:[], ledger_candidates:[], acceptance_cases:[],
  assertions:[{assertion_id:'A2', stage:'ESTABLISHED', kind:'authority_relation', materiality:'HIGH', basis_refs:['T2']}],
  closure:[{closure_id:'CL4', label:'Current people', status:'CLOSED_COMPLETE', materiality:'MATERIAL', collection:true, inverse_checked:false}]
});
assert.equal(readiness.ready, false);
assert.ok(readiness.blockers.some(b => b.code === 'COMPLETENESS_NOT_INVERTED'));

console.log('Foundry question operator self-test passed.');
