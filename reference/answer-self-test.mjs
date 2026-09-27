import assert from 'node:assert/strict';
import { openCase, processInterpretation, deriveProposedDispositions, adjudicateDispositions } from './answer-processing.mjs';

const workspace = {
  workspace_id:'W500', protocol_version:'0.1',
  testimony:[{testimony_id:'T500',content:"Ricardo can approve them once the team is actually in Argentina, but before that I have to approve it."}],
  sources:[],
  assertions:[
    {assertion_id:'A300',stage:'ESTABLISHED',assertion_kind:'AUTHORITY',subject_ref:'DAVID',predicate:'approves_receiving_organizations',materiality:'HIGH',provenance:{basis_type:'TESTIMONY',basis_refs:['TOLD']}},
    {assertion_id:'A310',stage:'ESTABLISHED',assertion_kind:'RULE',subject_ref:'PROGRAM',predicate:'approval_path',materiality:'HIGH',provenance:{basis_type:'DERIVATION',basis_refs:['A300']}}
  ]
};

const caseRecord = openCase({workspace_id:'W500',case_id:'K500',testimony_refs:['T500'],topic:'Argentina receiving-organization approval authority',question_ref:'Q500',question_operator:'BOUND'},{now:'2026-09-27T18:00:00Z'});

const plan = {
  plan_id:'P500',workspace_id:'W500',case_id:'K500',question_ref:'Q500',question_operator:'BOUND',testimony_refs:['T500'],
  findings:[{finding_id:'F1',kind:'AUTHORITY',description:'Approval bearer differs by stage.',basis_refs:['T500']}],
  candidate_assertions:[
    {assertion_id:'A501',description:'David carries approval authority before the Argentina-stage transition.',basis_refs:['T500'],proposed_disposition:'SCOPE',reason_code:'AUTHORITY_CLARIFIED',disposition_reason:'Earlier authority assertion appears overbroad and should be scoped.',affected_refs:['A300']},
    {assertion_id:'A502',description:'Ricardo carries approval authority after the Argentina-stage transition.',basis_refs:['T500'],proposed_disposition:'SCOPE',reason_code:'AUTHORITY_CLARIFIED',disposition_reason:'Testimony introduces a distinct scoped bearer after a transition.',affected_refs:['A300']}
  ],
  candidate_unknowns:[{unknown_id:'U501',description:'What exactly constitutes being "actually in Argentina" for the authority transition?',basis_refs:['T500']}],
  candidate_contradictions:[],candidate_discrepancies:[{discrepancy_id:'DS501',kind:'SCOPE_DIFFERENCE',existing_refs:['A300'],new_refs:['T500']}],candidate_signals:[],competing_interpretations:[],proposed_dependency_roots:['A300'],created_at:'2026-09-27T18:00:01Z'
};

const aiResult = processInterpretation(workspace,caseRecord,plan,{authority:'AI_RECOMMENDATION',now:'2026-09-27T18:00:02Z'});
assert.equal(aiResult.status,'NEEDS_ADJUDICATION');
assert.equal(aiResult.dispositions.filter(d=>d.type==='SCOPE').every(d=>d.status==='REQUIRES_CONFIRMATION'),true);
assert.equal(aiResult.dispositions.find(d=>d.type==='OPEN_UNKNOWN').status,'AUTHORIZED');
assert.equal(aiResult.structural_delta.gain.new_unknown_count,1);
assert.ok(aiResult.structural_delta.gain.residual_uncertainty_explicit >= 1);

const principalResult = processInterpretation(workspace,caseRecord,plan,{authority:'PRINCIPAL_CONFIRMATION',now:'2026-09-27T18:00:03Z'});
assert.equal(principalResult.status,'ADJUDICATED');
assert.equal(principalResult.dispositions.filter(d=>d.type==='SCOPE').every(d=>d.status==='AUTHORIZED'),true);
assert.ok(principalResult.dependency_impacts.some(i=>i.dependent_ref==='A310' && i.outcome==='REOPEN'));
assert.ok(principalResult.structural_delta.gain.distinctions_made_explicit >= 2);
assert.ok(principalResult.structural_delta.gain.dependency_risk_exposed >= 1);

const signalPlan = {...plan,plan_id:'P600',case_id:'K600',candidate_assertions:[],candidate_unknowns:[],candidate_discrepancies:[],candidate_signals:[{signal_id:'S600',description:'Sharon may have started approving some cases herself.',basis_refs:['T500']}],proposed_dependency_roots:[]};
const signalDispositions = adjudicateDispositions(deriveProposedDispositions(signalPlan,{authority:'AI_RECOMMENDATION'}),{authority:'AI_RECOMMENDATION'});
assert.equal(signalDispositions.length,1);
assert.equal(signalDispositions[0].type,'OPEN_SIGNAL');
assert.equal(signalDispositions[0].status,'AUTHORIZED');

const noChangePlan = {...plan,plan_id:'P700',case_id:'K700',candidate_assertions:[],candidate_unknowns:[],candidate_discrepancies:[],candidate_signals:[],proposed_dispositions:[{type:'NO_CHANGE',reason_code:'ALREADY_REPRESENTED',reason:'The testimony repeats established structure without changing its scope.',basis_refs:['T500'],affected_refs:['A300']}],proposed_dependency_roots:[]};
const noChangeCase = openCase({workspace_id:'W500',case_id:'K700',testimony_refs:['T500'],topic:'Repeated authority description'});
const noChange = processInterpretation(workspace,noChangeCase,noChangePlan,{authority:'AI_RECOMMENDATION'});
assert.equal(noChange.status,'ADJUDICATED');
assert.equal(noChange.dispositions[0].type,'NO_CHANGE');
assert.equal(noChange.dispositions[0].status,'AUTHORIZED');
assert.ok(noChange.structural_delta.changes.some(c=>c.action==='NO_CHANGE'));

console.log('Foundry answer-processing self-test passed.');
