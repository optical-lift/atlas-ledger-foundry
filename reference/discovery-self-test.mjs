import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildDiscoveryGaps, discoverySignature, validateDiscoveryObservation } from './discovery-grammar.mjs';
import { buildQuestionPlan, OPERATOR_NAMES } from './question-operators.mjs';
import { selectNextQuestion, runReadinessCheck } from './foundry-engines.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('../fixtures/canon-discovery-cross-domain.json', import.meta.url), 'utf8'));
const [a,b] = fixture.cases;

for (const c of fixture.cases) {
  for (const observation of c.observations) {
    const check = validateDiscoveryObservation(observation);
    assert.equal(check.valid, true, `${c.case_id} observation invalid: ${check.errors.join(', ')}`);
  }
}

const ag = buildDiscoveryGaps(a.observations);
const bg = buildDiscoveryGaps(b.observations);

assert.deepEqual(ag.map(g=>g.discovery_lens), fixture.expected.lens_sequence);
assert.deepEqual(bg.map(g=>g.discovery_lens), fixture.expected.lens_sequence);
assert.deepEqual(ag.map(g=>buildQuestionPlan(g).operator), fixture.expected.operator_sequence);
assert.deepEqual(bg.map(g=>buildQuestionPlan(g).operator), fixture.expected.operator_sequence);
assert.deepEqual(ag.map(discoverySignature), bg.map(discoverySignature));
assert.ok(ag.every(g=>g.industry_assumption===false));
assert.ok(bg.every(g=>g.industry_assumption===false));
assert.ok(OPERATOR_NAMES.includes('REPAIR'));

const workspace = gaps => ({
  protocol_version:'0.1',
  status:'DISCOVERY',
  boundary_status:'PROVISIONAL',
  discovery_gaps:gaps,
  testimony:[{testimony_id:'T-SEED'}],
  assertions:[],
  contradictions:[],
  unknowns:[],
  discrepancies:[],
  signals:[],
  dependency_impacts:[],
  adjudication_cases:[],
  dispositions:[],
  closure:[],
  ledger_candidates:[],
  acceptance_cases:[]
});

const aq = selectNextQuestion(workspace(ag));
const bq = selectNextQuestion(workspace(bg));
assert.equal(aq.primary.discovery_lens, 'CUSTODY');
assert.equal(bq.primary.discovery_lens, 'CUSTODY');
assert.equal(aq.primary.operator, bq.primary.operator);
assert.equal(aq.primary.priority_class, bq.primary.priority_class);
assert.equal(aq.primary.industry_assumption, false);
assert.ok(aq.primary.supporting_refs.length > 0);

const badReadiness = runReadinessCheck(workspace([{
  id:'DG-BAD',
  type:'function',
  reason:'Industry says managers approve.',
  priorityClass:'P3',
  discovery_lens:'FUNCTION',
  supporting_refs:['T-SEED'],
  industry_assumption:true
}]));
assert.ok(badReadiness.blockers.some(b=>b.code==='INVALID_DISCOVERY_GAP'));

assert.throws(
  ()=>buildDiscoveryGaps([{observation_id:'BAD',discovery_lens:'FUNCTION',description:'Industry stereotype',supporting_refs:['T1'],industry_assumption:true}]),
  /industry_assumption/
);
assert.throws(
  ()=>buildDiscoveryGaps([{observation_id:'BAD2',discovery_lens:'FUNCTION',description:'Unsupported observation',supporting_refs:[],industry_assumption:false}]),
  /preserved evidence/
);

console.log('Foundry canon discovery self-test passed.');
