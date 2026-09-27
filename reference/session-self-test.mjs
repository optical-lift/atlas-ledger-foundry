import assert from 'node:assert/strict';
import { buildSessionContext } from './session-context.mjs';

const workspace = {
  workspace_id: 'W300',
  workspace_version: 'checkpoint-12',
  protocol_version: '0.1',
  status: 'RECONCILIATION',
  provisional_subject: { label: 'Community Program', subject_ref: 'E001' },
  provisional_field: 'Receiving organizations, team travel, activities, and approval authority',
  boundary_status: 'PROVISIONAL',
  sources: [{ source_id: 'S300', record_type: 'source', source_kind: 'conversation', label: 'Current principal conversation', status: 'PROCESSED' }],
  testimony: [{ testimony_id: 'T300', record_type: 'testimony', content: "I usually approve them, but Ricardo can do it when they're in Argentina.", representation: 'EXACT', source_refs: ['S300'] }],
  assertions: [
    { assertion_id: 'A300', stage: 'NEEDS_CLARIFICATION', kind: 'authority_relation', materiality: 'HIGH', basis_refs: ['T300'], interpretation_note: 'Approval authority may be conditional on location, delegation, or stage of work.' },
    { assertion_id: 'A301', stage: 'ESTABLISHED', kind: 'authority_context', materiality: 'HIGH', basis_refs: ['T300'], interpretation_note: 'Ricardo participates in approval activity.' },
    { assertion_id: 'A399', stage: 'ESTABLISHED', kind: 'historical_detail', materiality: 'LOW', basis_refs: ['S300'] }
  ],
  unknowns: [], contradictions: [], closure: [], ledger_candidates: [], acceptance_cases: []
};

const packet = buildSessionContext(workspace, {
  session_id: 'SESSION-300',
  generated_at: '2026-09-27T17:30:00Z'
});

assert.equal(packet.workspace_id, 'W300');
assert.equal(packet.workspace_version, 'checkpoint-12');
assert.equal(packet.next_question.related_refs[0], 'A300');
assert.ok(packet.orientation.core_rules.includes('Unknown is not none.'));
assert.equal(packet.omissions_notice.packet_is_partial, true);
assert.ok(packet.established_projection.some(a => a.assertion_id === 'A301'));
assert.ok(!packet.established_projection.some(a => a.assertion_id === 'A399'));
assert.ok(packet.evidence_refs.includes('T300'));
assert.ok(!packet.allowed_operations.includes('execute_sql'));

console.log('Foundry session projection self-test passed.');
