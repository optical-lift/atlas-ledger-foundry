// Atlas Ledger Foundry answer-processing reference v0.1
// Storage-free reference logic for interpretation gating, adjudication,
// dependency impact, and structural delta construction.

const MUTATING = new Set([
  'CONFIRM','SUPERSEDE','CORRECT','SCOPE','TEMPORALIZE','CONDITIONALIZE','SPLIT','MERGE',
  'RESOLVE_UNKNOWN','PARTIALLY_RESOLVE','RESOLVE_CONTRADICTION','VALIDATE_SIGNAL','REFUTE_SIGNAL','REOPEN'
]);
const CONSERVATIVE = new Set(['OPEN_UNKNOWN','OPEN_CONTRADICTION','OPEN_SIGNAL','REQUEST_MORE_EVIDENCE','ESCALATE','NO_CHANGE']);

export const DISPOSITION_TYPES = Object.freeze([
  'CONFIRM','SUPERSEDE','CORRECT','SCOPE','TEMPORALIZE','CONDITIONALIZE','SPLIT','MERGE',
  'OPEN_UNKNOWN','RESOLVE_UNKNOWN','PARTIALLY_RESOLVE','OPEN_CONTRADICTION','RESOLVE_CONTRADICTION',
  'OPEN_SIGNAL','VALIDATE_SIGNAL','REFUTE_SIGNAL','REQUEST_MORE_EVIDENCE','ESCALATE','NO_CHANGE','REOPEN'
]);

export const REASON_CODES = Object.freeze([
  'NEW_INFORMATION','SCOPE_CLARIFIED','TEMPORAL_CHANGE','IDENTITY_SPLIT','IDENTITY_MERGE',
  'AUTHORITY_CLARIFIED','SOURCE_CORRECTED','EXCEPTION_DISCOVERED','RULE_NOT_CURRENT',
  'DUPLICATE_REPRESENTATION','CONTRADICTED_BY_HIGHER_AUTHORITY','INSUFFICIENT_EVIDENCE',
  'NON_MATERIAL_DIFFERENCE','ALREADY_REPRESENTED','DEPENDENCY_INVALIDATED','DEPENDENCY_NEEDS_REVIEW',
  'USER_CORRECTION','NO_STRUCTURAL_EFFECT','OTHER'
]);

function assertionId(a) { return a?.assertion_id ?? null; }
function basisRefs(a) { return a?.basis_refs ?? a?.provenance?.basis_refs ?? []; }
function now(options) { return options?.now ?? '1970-01-01T00:00:00.000Z'; }

export function openCase({ workspace_id, case_id, testimony_refs, topic, question_ref = null, question_operator = null, subject_ref = null }, options = {}) {
  if (!workspace_id || !case_id || !testimony_refs?.length || !topic) throw new Error('case requires workspace_id, case_id, testimony_refs, and topic');
  return {
    case_id, workspace_id, topic, subject_ref, status: 'OPEN', origin_refs: [...new Set(testimony_refs)],
    question_ref, question_operator, finding_refs: [], discrepancy_refs: [], signal_refs: [],
    competing_interpretations: [], disposition_refs: [], dependency_impact_refs: [], structural_delta_ref: null,
    residual_issue_refs: [], opened_at: now(options), closed_at: null, closure_basis_refs: [], supersedes_case_id: null
  };
}

export function validateInterpretationPlan(plan, workspace = {}) {
  const errors = [];
  if (!plan?.plan_id) errors.push('missing plan_id');
  if (!plan?.case_id) errors.push('missing case_id');
  if (!plan?.testimony_refs?.length) errors.push('interpretation must cite preserved testimony');
  const known = new Set([
    ...(workspace.testimony ?? []).map(t => t.testimony_id),
    ...(workspace.sources ?? []).map(s => s.source_id),
    ...(workspace.assertions ?? []).map(a => a.assertion_id)
  ].filter(Boolean));
  for (const ref of plan?.testimony_refs ?? []) {
    if (known.size && !known.has(ref)) errors.push(`unknown testimony/source basis ${ref}`);
  }
  for (const a of plan?.candidate_assertions ?? []) {
    const refs = a.basis_refs ?? a.provenance?.basis_refs ?? [];
    if (!refs.length) errors.push(`candidate assertion ${a.assertion_id ?? '(unidentified)'} lacks basis_refs`);
  }
  return { valid: errors.length === 0, errors };
}

function proposedDisposition(input, plan, options, i) {
  return {
    disposition_id: input.disposition_id ?? `${plan.case_id}-D${String(i + 1).padStart(3,'0')}`,
    workspace_id: plan.workspace_id,
    case_id: plan.case_id,
    type: input.type,
    reason_code: input.reason_code ?? 'NEW_INFORMATION',
    reason: input.reason ?? `Proposed ${input.type} from interpretation ${plan.plan_id}.`,
    basis_refs: [...new Set(input.basis_refs?.length ? input.basis_refs : plan.testimony_refs)],
    affected_refs: [...new Set(input.affected_refs ?? [])],
    authority: options.authority ?? 'AI_RECOMMENDATION',
    status: 'PROPOSED',
    resulting_refs: [...new Set(input.resulting_refs ?? [])],
    decided_at: now(options),
    applied_at: null
  };
}

export function deriveProposedDispositions(plan, options = {}) {
  const out = [];
  for (const u of plan.candidate_unknowns ?? []) out.push({ type:'OPEN_UNKNOWN', reason_code:'NEW_INFORMATION', reason:u.reason ?? u.description ?? 'Testimony exposed an explicit unknown.', affected_refs:[u.unknown_id].filter(Boolean), resulting_refs:[u.unknown_id].filter(Boolean), basis_refs:u.basis_refs });
  for (const c of plan.candidate_contradictions ?? []) out.push({ type:'OPEN_CONTRADICTION', reason_code:'NEW_INFORMATION', reason:c.reason ?? c.description ?? 'Testimony exposed incompatible representations.', affected_refs:[c.contradiction_id].filter(Boolean), resulting_refs:[c.contradiction_id].filter(Boolean), basis_refs:c.basis_refs ?? c.record_refs });
  for (const s of plan.candidate_signals ?? []) out.push({ type:'OPEN_SIGNAL', reason_code:'NEW_INFORMATION', reason:s.reason ?? s.description ?? 'Testimony indicates a condition that requires investigation.', affected_refs:[s.signal_id].filter(Boolean), resulting_refs:[s.signal_id].filter(Boolean), basis_refs:s.basis_refs });
  for (const a of plan.candidate_assertions ?? []) {
    if (!a.proposed_disposition) continue;
    out.push({ type:a.proposed_disposition, reason_code:a.reason_code ?? 'NEW_INFORMATION', reason:a.disposition_reason ?? a.description ?? `Candidate assertion ${a.assertion_id ?? ''} proposes ${a.proposed_disposition}.`, affected_refs:a.affected_refs ?? [], resulting_refs:[a.assertion_id].filter(Boolean), basis_refs:a.basis_refs ?? a.provenance?.basis_refs });
  }
  for (const x of plan.proposed_dispositions ?? []) out.push(x);
  return out.map((d, i) => proposedDisposition(d, plan, options, i));
}

export function adjudicateDispositions(dispositions, options = {}) {
  const authority = options.authority ?? 'AI_RECOMMENDATION';
  const corroborated = new Set(options.corroborated_refs ?? []);
  return dispositions.map(d => {
    let status = d.status ?? 'PROPOSED';
    if (!DISPOSITION_TYPES.includes(d.type)) return { ...d, authority, status:'REJECTED', reason:`Unsupported disposition type ${d.type}.` };
    if (CONSERVATIVE.has(d.type)) status = 'AUTHORIZED';
    if (MUTATING.has(d.type)) {
      if (authority === 'PRINCIPAL_CONFIRMATION' || authority === 'AUTHORITATIVE_SOURCE' || authority === 'GOVERNED_RECONCILIATION' || authority === 'SERVICE_RULE') status = 'AUTHORIZED';
      else status = 'REQUIRES_CONFIRMATION';
    }
    if (d.type === 'ESCALATE') status = 'REQUIRES_ESCALATION';
    if (d.type === 'NO_CHANGE') status = 'AUTHORIZED';
    if (d.type === 'CONFIRM' && d.affected_refs.some(r => corroborated.has(r))) status = 'AUTHORIZED';
    return { ...d, authority, status };
  });
}

export function analyzeDependencyImpact(workspace, changedRefs, case_id, options = {}) {
  const assertions = workspace.assertions ?? [];
  const assertionIds = new Set(assertions.map(assertionId).filter(Boolean));
  const changed = new Set(changedRefs);
  const queue = [...changed];
  const seen = new Set();
  const impacts = [];
  let n = 1;

  while (queue.length) {
    const root = queue.shift();
    if (seen.has(root)) continue;
    seen.add(root);
    for (const dep of assertions) {
      const depId = assertionId(dep);
      if (!depId || changed.has(depId)) continue;
      const refs = basisRefs(dep);
      if (!refs.includes(root)) continue;
      const independent = refs.filter(r => r !== root && !changed.has(r));
      const independentNonAssertion = independent.filter(r => !assertionIds.has(r));
      const outcome = independentNonAssertion.length ? 'RECHECK_REQUIRED' : 'REOPEN';
      impacts.push({
        impact_id:`${case_id}-I${String(n++).padStart(3,'0')}`, workspace_id:workspace.workspace_id ?? 'workspace', case_id,
        changed_ref:root, dependent_ref:depId, outcome,
        reason: independentNonAssertion.length
          ? `${depId} depended on changed assertion ${root} but retains additional non-assertion basis that must be re-evaluated.`
          : `${depId} depended materially on changed assertion ${root} and lacks visible independent basis.`,
        basis_refs:[...refs], independent_basis_refs:independent, blocking:dep.materiality === 'CRITICAL', evaluated_at:now(options)
      });
      queue.push(depId);
    }
  }
  return impacts;
}

function actionFor(type) {
  const map = {
    CONFIRM:'CONFIRM', SUPERSEDE:'SUPERSEDE', CORRECT:'SUPERSEDE', SCOPE:'SCOPE', TEMPORALIZE:'TEMPORALIZE',
    CONDITIONALIZE:'CONDITIONALIZE', SPLIT:'SPLIT', MERGE:'MERGE', OPEN_UNKNOWN:'OPEN', RESOLVE_UNKNOWN:'RESOLVE',
    PARTIALLY_RESOLVE:'PARTIALLY_RESOLVE', OPEN_CONTRADICTION:'OPEN', RESOLVE_CONTRADICTION:'RESOLVE', OPEN_SIGNAL:'OPEN',
    VALIDATE_SIGNAL:'VALIDATE', REFUTE_SIGNAL:'REFUTE', NO_CHANGE:'NO_CHANGE', REOPEN:'REOPEN'
  };
  return map[type] ?? null;
}

export function buildStructuralDelta(workspace, caseRecord, dispositions, dependencyImpacts = [], options = {}) {
  const changes = [];
  const residual = [];
  let distinctions = 0, ambiguity = 0, certaintyRemoved = 0, provenance = 0, dependencyRisk = 0, residualExplicit = 0, newUnknowns = 0, resolvedUnknowns = 0;

  for (const d of dispositions) {
    if (['AUTHORIZED','APPLIED'].includes(d.status)) {
      const action = actionFor(d.type);
      if (action) {
        const targets = d.affected_refs.length ? d.affected_refs : d.resulting_refs;
        for (const ref of targets.length ? targets : [d.disposition_id]) changes.push({ action, record_type:d.type.includes('SIGNAL') ? 'SIGNAL' : d.type.includes('UNKNOWN') ? 'UNKNOWN' : d.type.includes('CONTRADICTION') ? 'CONTRADICTION' : 'ASSERTION', record_ref:ref, reason_ref:d.disposition_id, result_ref:d.resulting_refs[0] ?? null });
      }
      if (['SCOPE','TEMPORALIZE','CONDITIONALIZE','SPLIT','MERGE'].includes(d.type)) { distinctions++; ambiguity++; }
      if (['CORRECT','SUPERSEDE','REOPEN'].includes(d.type)) certaintyRemoved++;
      if (d.type === 'CONFIRM') provenance++;
      if (d.type === 'OPEN_UNKNOWN') { newUnknowns++; residualExplicit++; }
      if (d.type === 'RESOLVE_UNKNOWN') resolvedUnknowns++;
      if (d.type === 'PARTIALLY_RESOLVE') { resolvedUnknowns++; residualExplicit++; }
      if (['OPEN_CONTRADICTION','OPEN_SIGNAL'].includes(d.type)) residualExplicit++;
    } else {
      residual.push({ ref:d.disposition_id, description:d.reason, materiality:d.type === 'ESCALATE' ? 'CRITICAL' : 'HIGH', blocking:['REQUIRES_ESCALATION'].includes(d.status), recommended_operator:d.type === 'ESCALATE' ? 'ESCALATE' : 'VERIFY' });
    }
  }

  for (const i of dependencyImpacts) {
    if (i.outcome !== 'UNAFFECTED') dependencyRisk++;
    if (['RECHECK_REQUIRED','REOPEN','BLOCKED_PENDING_PARENT'].includes(i.outcome)) residual.push({ ref:i.impact_id, description:i.reason, materiality:i.blocking ? 'CRITICAL' : 'HIGH', blocking:!!i.blocking, recommended_operator:'TRACE' });
  }

  const gainSummary = `Made ${distinctions} structural distinction(s), reduced ${ambiguity} dangerous ambiguity point(s), exposed ${residualExplicit} explicit residual uncertainty item(s), and surfaced ${dependencyRisk} dependency impact(s). New unknowns are counted as explicit structure, not negative progress.`;
  return {
    delta_id: options.delta_id ?? `${caseRecord.case_id}-DELTA`, workspace_id:workspace.workspace_id ?? caseRecord.workspace_id, case_id:caseRecord.case_id,
    basis_refs:[...new Set(caseRecord.origin_refs ?? [])], changes, dependency_impacts:dependencyImpacts.map(i => i.impact_id), residual_gaps:residual,
    gain:{ dangerous_ambiguity_reduced:ambiguity, distinctions_made_explicit:distinctions, unsupported_certainty_removed:certaintyRemoved, provenance_strengthened:provenance, dependency_risk_exposed:dependencyRisk, residual_uncertainty_explicit:residualExplicit, new_unknown_count:newUnknowns, resolved_unknown_count:resolvedUnknowns, summary:gainSummary },
    created_at:now(options)
  };
}

export function processInterpretation(workspace, caseRecord, plan, options = {}) {
  const validation = validateInterpretationPlan(plan, workspace);
  if (!validation.valid) return { status:'REJECTED', validation, case:caseRecord, interpretation:plan, dispositions:[], dependency_impacts:[], structural_delta:null };
  const proposed = deriveProposedDispositions(plan, options);
  const dispositions = adjudicateDispositions(proposed, options);
  const changedRefs = dispositions
    .filter(d => ['AUTHORIZED','APPLIED'].includes(d.status) && ['SUPERSEDE','CORRECT','SCOPE','TEMPORALIZE','CONDITIONALIZE','SPLIT','MERGE','REOPEN'].includes(d.type))
    .flatMap(d => d.affected_refs);
  const impacts = analyzeDependencyImpact(workspace, changedRefs, caseRecord.case_id, options);
  const delta = buildStructuralDelta(workspace, caseRecord, dispositions, impacts, options);
  const blocked = dispositions.some(d => ['REQUIRES_CONFIRMATION','REQUIRES_ESCALATION'].includes(d.status));
  return { status:blocked ? 'NEEDS_ADJUDICATION' : 'ADJUDICATED', validation, case:{...caseRecord,status:blocked?'ADJUDICATING':'CLOSED'}, interpretation:plan, dispositions, dependency_impacts:impacts, structural_delta:delta };
}
