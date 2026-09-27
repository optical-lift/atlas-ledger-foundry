// Atlas Ledger Foundry mock Relay v0.1
// In-memory, carrier-independent orchestration reference.
// No database, network, Supabase, MCP, or canonical Atlas Reality writes.

import { buildSessionContext } from './session-context.mjs';
import { buildDiscoveryGaps, validateDiscoveryObservation } from './discovery-grammar.mjs';
import { openCase, processInterpretation } from './answer-processing.mjs';

const COLLECTIONS = [
  'sources','testimony','discovery_observations','discovery_gaps','assertions','unknowns',
  'contradictions','discrepancies','signals','ledger_candidates','closure','acceptance_cases',
  'adjudication_cases','dispositions','dependency_impacts','structural_deltas'
];

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function ensureWorkspace(input = {}) {
  const workspace = clone(input);
  for (const key of COLLECTIONS) if (!Array.isArray(workspace[key])) workspace[key] = [];
  workspace.workspace_id ??= 'workspace';
  workspace.protocol_version ??= '0.1';
  workspace.status ??= 'DISCOVERY';
  workspace.boundary_status ??= 'UNRESOLVED';
  workspace.workspace_version ??= 'relay-0';
  return workspace;
}

function stableId(record) {
  return record?.source_id ?? record?.testimony_id ?? record?.observation_id ?? record?.id ??
    record?.assertion_id ?? record?.unknown_id ?? record?.contradiction_id ??
    record?.discrepancy_id ?? record?.signal_id ?? record?.ledger_candidate_id ??
    record?.closure_id ?? record?.case_id ?? record?.disposition_id ??
    record?.impact_id ?? record?.delta_id ?? null;
}

function preservedEvidenceRefs(workspace) {
  return new Set([
    ...(workspace.sources ?? []).map(s => s?.source_id),
    ...(workspace.testimony ?? []).map(t => t?.testimony_id)
  ].filter(Boolean));
}

function discoveryObservationRefs(workspace, batchObservationIds = new Set()) {
  return new Set([
    ...(workspace.discovery_observations ?? []).map(o => o?.observation_id),
    ...batchObservationIds
  ].filter(Boolean));
}

function relaySequenceFromWorkspace(workspace) {
  const match = /^relay-(\d+)$/.exec(String(workspace?.workspace_version ?? ''));
  return match ? Number(match[1]) : 0;
}

function replaceTurnAlias(value, testimonyId) {
  if (value === '$turn_testimony') return testimonyId;
  if (Array.isArray(value)) return value.map(v => replaceTurnAlias(v, testimonyId));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, replaceTurnAlias(v, testimonyId)]));
  }
  return value;
}

function appendUnique(records, additions, idKey) {
  const seen = new Set(records.map(r => r?.[idKey]).filter(Boolean));
  for (const item of additions ?? []) {
    const id = item?.[idKey];
    if (id && seen.has(id)) continue;
    records.push(clone(item));
    if (id) seen.add(id);
  }
}

function normalizeCandidateRecords(workspace, plan) {
  appendUnique(workspace.unknowns, (plan.candidate_unknowns ?? []).map(u => ({
    ...u,
    status: u.status ?? 'OPEN',
    basis_refs: u.basis_refs ?? plan.testimony_refs ?? []
  })), 'unknown_id');

  appendUnique(workspace.contradictions, (plan.candidate_contradictions ?? []).map(c => ({
    ...c,
    status: c.status ?? 'OPEN',
    record_refs: c.record_refs ?? c.basis_refs ?? plan.testimony_refs ?? []
  })), 'contradiction_id');

  appendUnique(workspace.discrepancies, (plan.candidate_discrepancies ?? []).map(d => ({
    ...d,
    status: d.status ?? 'OPEN',
    new_refs: d.new_refs ?? d.basis_refs ?? plan.testimony_refs ?? []
  })), 'discrepancy_id');

  appendUnique(workspace.signals, (plan.candidate_signals ?? []).map(s => ({
    ...s,
    status: s.status ?? 'DETECTED',
    basis_refs: s.basis_refs ?? plan.testimony_refs ?? []
  })), 'signal_id');

  appendUnique(workspace.assertions, (plan.candidate_assertions ?? []).map(a => ({
    ...a,
    stage: a.stage ?? 'CANDIDATE',
    basis_refs: a.basis_refs ?? a.provenance?.basis_refs ?? plan.testimony_refs ?? []
  })), 'assertion_id');
}

function appendAdjudication(workspace, result) {
  if (!result) return;
  const caseRecord = result.status === 'REJECTED'
    ? { ...result.case, status: 'REJECTED', residual_issue_refs: [], closed_at: result.case?.closed_at ?? null }
    : result.case;
  appendUnique(workspace.adjudication_cases, [caseRecord], 'case_id');
  appendUnique(workspace.dispositions, result.dispositions ?? [], 'disposition_id');
  appendUnique(workspace.dependency_impacts, result.dependency_impacts ?? [], 'impact_id');
  appendUnique(workspace.structural_deltas, result.structural_delta ? [result.structural_delta] : [], 'delta_id');
  if (result.status !== 'REJECTED') normalizeCandidateRecords(workspace, result.interpretation ?? {});
}

function validateObservationBasis(workspace, observation, batchObservationIds = new Set()) {
  const result = validateDiscoveryObservation(observation);
  const evidence = preservedEvidenceRefs(workspace);
  const invalidSupport = (observation.supporting_refs ?? []).filter(ref => !evidence.has(ref));
  if (invalidSupport.length) result.errors.push(`supporting_refs must resolve to preserved source/testimony evidence: ${invalidSupport.join(', ')}`);

  const observationRefs = discoveryObservationRefs(workspace, batchObservationIds);
  const clusterAllowed = new Set([...evidence, ...observationRefs]);
  const invalidCluster = (observation.cluster_refs ?? []).filter(ref => ref === observation.observation_id || !clusterAllowed.has(ref));
  if (invalidCluster.length) result.errors.push(`cluster_refs must resolve to preserved evidence or discovery observations other than self: ${invalidCluster.join(', ')}`);

  result.valid = result.errors.length === 0;
  return result;
}

function advanceVersion(relay) {
  relay.sequence += 1;
  relay.workspace.workspace_version = `relay-${relay.sequence}`;
  return relay.workspace.workspace_version;
}

function turnReceiptId(turnId) {
  return `receipt-${turnId}`;
}

export function createMockRelay(workspace = {}, options = {}) {
  const normalized = ensureWorkspace(workspace);
  const recoveredSequence = relaySequenceFromWorkspace(normalized);
  const requestedSequence = Number.isInteger(options.sequence) && options.sequence >= 0 ? options.sequence : recoveredSequence;
  const sequence = Math.max(recoveredSequence, requestedSequence);
  return {
    relay_id: options.relay_id ?? `relay-${normalized.workspace_id ?? 'workspace'}`,
    sequence,
    workspace: normalized,
    turn_receipts: [],
    created_at: options.created_at ?? '1970-01-01T00:00:00.000Z'
  };
}

export function resumeRelay(relay, options = {}) {
  return buildSessionContext(relay.workspace, {
    session_id: options.session_id ?? `${relay.relay_id}-session-${relay.sequence + 1}`,
    workspace_version: relay.workspace.workspace_version,
    generated_at: options.generated_at ?? '1970-01-01T00:00:00.000Z',
    governing_order_version: options.governing_order_version ?? '0.1'
  });
}

export function processRelayTurn(relayInput, turn, options = {}) {
  const relay = clone(relayInput);
  relay.workspace = ensureWorkspace(relay.workspace);
  relay.turn_receipts ??= [];

  if (!turn?.turn_id) throw new Error('turn_id is required');
  if (typeof turn?.human_input !== 'string' || !turn.human_input.trim()) throw new Error('human_input is required');

  const prior = relay.turn_receipts.find(r => r.turn_id === turn.turn_id);
  if (prior) {
    if (prior.human_input !== turn.human_input) throw new Error(`turn_id ${turn.turn_id} was already used with different testimony`);
    return { relay, receipt: clone(prior), replayed: true };
  }

  const preContext = resumeRelay(relay, {
    session_id: turn.session_id ?? `${relay.relay_id}-session-${relay.sequence + 1}`,
    generated_at: options.now ?? '1970-01-01T00:00:00.000Z'
  });

  // Stage A: preserve testimony before any discovery or interpretation.
  const testimonyId = turn.testimony_id ?? `T-${turn.turn_id}`;
  if (relay.workspace.testimony.some(t => t.testimony_id === testimonyId)) throw new Error(`duplicate testimony_id ${testimonyId}`);

  const testimony = {
    testimony_id: testimonyId,
    record_type: 'testimony',
    content: turn.human_input,
    representation: turn.representation ?? 'EXACT',
    source_refs: [...new Set(turn.source_refs ?? [])],
    question_ref: turn.question_ref ?? preContext.next_question?.related_refs?.[0] ?? null,
    question_operator: turn.question_operator ?? preContext.next_question?.operator ?? null,
    turn_id: turn.turn_id,
    captured_at: options.now ?? '1970-01-01T00:00:00.000Z'
  };
  relay.workspace.testimony.push(testimony);

  const receipt = {
    receipt_id: turnReceiptId(turn.turn_id),
    turn_id: turn.turn_id,
    human_input: turn.human_input,
    testimony_id: testimonyId,
    testimony_preserved: true,
    starting_workspace_version: relay.workspace.workspace_version,
    stale_context: false,
    discovery: { status: 'NOT_SUBMITTED', observation_refs: [], gap_refs: [], errors: [] },
    adjudication: { status: 'NOT_SUBMITTED', case_id: null, errors: [] },
    resulting_workspace_version: null,
    next_question: null
  };

  // Stale carrier context never gets overwrite/adjudication authority.
  if (turn.expected_workspace_version && turn.expected_workspace_version !== receipt.starting_workspace_version) {
    receipt.stale_context = true;
    receipt.adjudication.status = 'STALE_CONTEXT';
    receipt.adjudication.errors.push(`expected ${turn.expected_workspace_version}, current ${receipt.starting_workspace_version}`);
    receipt.resulting_workspace_version = advanceVersion(relay);
    receipt.next_question = resumeRelay(relay, { generated_at: options.now }).next_question;
    relay.turn_receipts.push(receipt);
    return { relay, receipt: clone(receipt), replayed: false };
  }

  // Canon Discovery: observations must be grounded in preserved source/testimony evidence, never industry assumptions.
  if ((turn.discovery_observations ?? []).length) {
    const observations = replaceTurnAlias(turn.discovery_observations, testimonyId);
    const batchIds = new Set(observations.map(o => o?.observation_id).filter(Boolean));
    const errors = [];
    for (const observation of observations) {
      const checked = validateObservationBasis(relay.workspace, observation, batchIds);
      if (!checked.valid) errors.push(`${observation.observation_id ?? '(unidentified)'}: ${checked.errors.join('; ')}`);
    }
    if (errors.length) {
      receipt.discovery.status = 'REJECTED';
      receipt.discovery.errors = errors;
      receipt.resulting_workspace_version = advanceVersion(relay);
      receipt.next_question = resumeRelay(relay, { generated_at: options.now }).next_question;
      relay.turn_receipts.push(receipt);
      return { relay, receipt: clone(receipt), replayed: false };
    }
    const gaps = buildDiscoveryGaps(observations).map(g => ({ ...g, status: g.status ?? 'OPEN' }));
    appendUnique(relay.workspace.discovery_observations, observations, 'observation_id');
    appendUnique(relay.workspace.discovery_gaps, gaps, 'id');
    receipt.discovery = {
      status: 'ACCEPTED',
      observation_refs: observations.map(o => o.observation_id),
      gap_refs: gaps.map(g => g.id),
      errors: []
    };
  }

  // Interpretation is optional, but if supplied it is adjudicated by service-like rules.
  if (turn.interpretation_plan) {
    const plan = replaceTurnAlias(turn.interpretation_plan, testimonyId);
    plan.workspace_id ??= relay.workspace.workspace_id;
    plan.plan_id ??= `${turn.turn_id}-PLAN`;
    plan.case_id ??= `${turn.turn_id}-CASE`;
    plan.testimony_refs = [...new Set(plan.testimony_refs?.length ? plan.testimony_refs : [testimonyId])];

    const caseRecord = openCase({
      workspace_id: relay.workspace.workspace_id,
      case_id: plan.case_id,
      testimony_refs: plan.testimony_refs,
      topic: turn.topic ?? preContext.next_question?.reason ?? 'Relay answer processing',
      question_ref: testimony.question_ref,
      question_operator: testimony.question_operator,
      subject_ref: turn.subject_ref ?? null
    }, { now: options.now });

    const result = processInterpretation(relay.workspace, caseRecord, plan, {
      authority: turn.authority ?? 'AI_RECOMMENDATION',
      corroborated_refs: turn.corroborated_refs ?? [],
      now: options.now,
      delta_id: turn.delta_id
    });

    appendAdjudication(relay.workspace, result);
    receipt.adjudication = {
      status: result.status,
      case_id: result.case?.case_id ?? caseRecord.case_id,
      disposition_refs: (result.dispositions ?? []).map(d => d.disposition_id),
      requires_confirmation: (result.dispositions ?? []).filter(d => d.status === 'REQUIRES_CONFIRMATION').map(d => d.disposition_id),
      requires_escalation: (result.dispositions ?? []).filter(d => d.status === 'REQUIRES_ESCALATION').map(d => d.disposition_id),
      structural_delta_ref: result.structural_delta?.delta_id ?? null,
      residual_refs: result.structural_delta?.residual_gaps?.map(g => g.ref).filter(Boolean) ?? [],
      errors: result.validation?.errors ?? []
    };
  }

  receipt.resulting_workspace_version = advanceVersion(relay);
  receipt.next_question = resumeRelay(relay, { generated_at: options.now }).next_question;
  relay.turn_receipts.push(receipt);
  return { relay, receipt: clone(receipt), replayed: false };
}

export function relayAudit(relay) {
  return {
    relay_id: relay.relay_id,
    workspace_id: relay.workspace.workspace_id,
    workspace_version: relay.workspace.workspace_version,
    testimony_count: relay.workspace.testimony?.length ?? 0,
    discovery_observation_count: relay.workspace.discovery_observations?.length ?? 0,
    discovery_gap_count: relay.workspace.discovery_gaps?.length ?? 0,
    adjudication_case_count: relay.workspace.adjudication_cases?.length ?? 0,
    structural_delta_count: relay.workspace.structural_deltas?.length ?? 0,
    turn_receipts: clone(relay.turn_receipts ?? [])
  };
}
