// Atlas Ledger Foundry reference engines v0.1
// Pure, storage-free reference logic. No database access and no Atlas Reality writes.

import { buildQuestionPlan } from './question-operators.mjs';

const MATERIALITY = { LOW: 5, MEDIUM: 20, HIGH: 50, CRITICAL: 80 };
const PRIORITY_BASE = { P0: 1000, P1: 900, P2: 800, P3: 700, P4: 600, P5: 500, P6: 400, P7: 300 };

function ref(id, type, reason, priorityClass, extra = {}) {
  return { id, type, reason, priorityClass, ...extra };
}

function inquiry(record) { return record?.inquiry ?? record ?? {}; }
function assertionKind(a) { return String(a?.kind ?? a?.assertion_kind ?? a?.predicate ?? '').toLowerCase(); }
function assertionBasis(a) { return a?.basis_refs ?? a?.provenance?.basis_refs ?? []; }
function assertionNote(a) { return a?.interpretation_note ?? a?.provenance?.interpretation_note ?? null; }
function closureState(c) { return c?.state ?? c?.status ?? 'NOT_YET_RECONCILED'; }
function closureLabel(c) { return c?.scope_label ?? c?.label ?? c?.domain ?? c?.scope_key ?? c?.closure_id ?? 'this domain'; }
function closureMaterial(c) {
  if (typeof c?.material === 'boolean') return c.material;
  if (c?.materiality === 'MATERIAL') return true;
  return !!c?.blocking;
}
function closureCollection(c) { return c?.scope_kind === 'COLLECTION' || c?.collection === true; }
function inverseChecked(c) { return c?.inverse_completeness_checked ?? c?.inverse_checked ?? false; }
function ledgerClassification(l) { return l?.classification ?? l?.status ?? 'UNRESOLVED'; }
function ledgerName(l) { return l?.working_name ?? l?.label ?? l?.ledger_candidate_id ?? 'this field'; }

function inferUnknownType(u) {
  const q = inquiry(u);
  const k = String(q.uncertainty_kind ?? '').toLowerCase();
  if (k === 'applicability') return 'gate';
  if (k === 'source' || k === 'provenance') return 'provenance';
  if (k === 'completeness') return 'completeness';
  if (k === 'confirmation') return 'verification';
  if (k === 'function') return 'function';
  if (k === 'scope') return 'boundary';
  if (k === 'trigger') return 'transition';
  if (k === 'exception') return 'exception';
  if (k === 'assumption') return 'counterfactual';
  if (k === 'refresh') return 'signpost';
  return 'unknown';
}

function inferAssertionType(a) {
  const q = inquiry(a);
  const k = assertionKind(a);
  if (q.needs_function_definition || q.uncertainty_kind === 'function') return 'function';
  if (q.needs_scope || q.uncertainty_kind === 'scope') return 'boundary';
  if (q.needs_trigger || q.uncertainty_kind === 'trigger') return 'transition';
  if (q.needs_exception || q.uncertainty_kind === 'exception') return 'exception';
  if (q.needs_signpost || q.uncertainty_kind === 'refresh') return 'signpost';
  if (q.needs_confirmation || q.uncertainty_kind === 'confirmation') return 'verification';
  if (/authority|responsib|custody|jurisdiction|permission/.test(k)) return 'authority';
  if (/identity|continuity|same_as|different_from/.test(k)) return 'identity';
  if (/event|transition|state|rule|condition/.test(k)) return 'transition';
  return 'assertion';
}

export function collectQuestionCandidates(workspace) {
  const out = [];

  for (const a of workspace.assertions ?? []) {
    if (a.stage === 'ESTABLISHED' && ['HIGH', 'CRITICAL'].includes(a.materiality) && assertionBasis(a).length === 0) {
      out.push(ref(a.assertion_id, 'provenance', `Material established assertion ${a.assertion_id} lacks a preserved basis.`, 'P0', {
        blocking: true,
        materiality: a.materiality,
        kind: assertionKind(a),
        related_refs: []
      }));
    }
  }

  for (const c of workspace.contradictions ?? []) {
    if (c.status !== 'OPEN') continue;
    out.push(ref(c.contradiction_id, 'contradiction', c.description ?? 'Open contradiction', c.blocking ? 'P1' : 'P7', {
      blocking: !!c.blocking,
      materiality: c.materiality ?? (c.blocking ? 'CRITICAL' : 'MEDIUM'),
      related_refs: c.record_refs ?? [],
      uncertainty_kind: 'competing_models'
    }));
  }

  for (const u of workspace.unknowns ?? []) {
    if (u.status !== 'OPEN') continue;
    const q = inquiry(u);
    out.push(ref(u.unknown_id, inferUnknownType(u), u.description, u.blocking ? 'P1' : 'P7', {
      blocking: !!u.blocking,
      materiality: u.materiality ?? 'MEDIUM',
      domain: u.domain ?? null,
      subject_label: u.subject_label ?? null,
      uncertainty_kind: q.uncertainty_kind ?? null,
      operator_hint: q.operator_hint ?? null,
      evidence_standard: q.evidence_standard ?? null,
      related_refs: u.basis_refs ?? []
    }));
  }

  for (const l of workspace.ledger_candidates ?? []) {
    const classification = ledgerClassification(l);
    if (classification === 'UNRESOLVED' || !classification) {
      const name = ledgerName(l);
      out.push(ref(l.ledger_candidate_id, 'topology', `Determine how ${name} relates to the current Ledger.`, 'P2', {
        blocking: !!l.blocking,
        materiality: l.blocking ? 'HIGH' : 'MEDIUM',
        label: name,
        subject_label: name,
        related_refs: l.basis_refs ?? [],
        uncertainty_kind: 'competing_models'
      }));
    }
  }

  for (const a of workspace.assertions ?? []) {
    const q = inquiry(a);
    if (a.stage === 'NEEDS_CLARIFICATION' || a.stage === 'CONFLICTED' || (a.stage === 'CANDIDATE' && q.needs_confirmation)) {
      const type = inferAssertionType(a);
      const authority = type === 'authority';
      const identity = type === 'identity';
      const transition = ['transition', 'exception'].includes(type);
      out.push(ref(a.assertion_id, type, assertionNote(a) ?? `Clarify ${a.assertion_kind ?? a.predicate ?? 'assertion'}.`,
        authority || identity ? 'P3' : transition ? 'P4' : type === 'boundary' ? 'P3' : type === 'verification' ? 'P3' : type === 'function' ? 'P3' : 'P7', {
          blocking: a.stage === 'CONFLICTED',
          materiality: a.materiality ?? 'HIGH',
          kind: assertionKind(a),
          subject_label: a.subject_label ?? a.subject_ref ?? null,
          uncertainty_kind: q.uncertainty_kind ?? null,
          operator_hint: q.operator_hint ?? null,
          needs_function_definition: !!q.needs_function_definition,
          needs_scope: !!q.needs_scope,
          needs_trigger: !!q.needs_trigger,
          needs_exception: !!q.needs_exception,
          needs_confirmation: !!q.needs_confirmation,
          evidence_standard: q.evidence_standard ?? null,
          related_refs: assertionBasis(a)
        }));
    }

    if (a.stage === 'ESTABLISHED' && q.needs_signpost === true) {
      out.push(ref(a.assertion_id, 'signpost', assertionNote(a) ?? `Established claim ${a.assertion_id} needs an observable refresh trigger.`, 'P6', {
        blocking: false,
        materiality: a.materiality ?? 'MEDIUM',
        kind: assertionKind(a),
        subject_label: a.subject_label ?? a.subject_ref ?? null,
        needs_signpost: true,
        related_refs: assertionBasis(a)
      }));
    }
  }

  for (const c of workspace.closure ?? []) {
    const state = closureState(c);
    if (!['KNOWN_INCOMPLETE', 'UNRESOLVED', 'NOT_YET_RECONCILED'].includes(state)) continue;
    const shouldInvert = closureCollection(c) && inverseChecked(c) !== true && (c.known_member_count ?? 0) > 0;
    const label = closureLabel(c);
    out.push(ref(c.closure_id, shouldInvert ? 'completeness' : 'closure',
      shouldInvert
        ? `Test whether ${label} contains silent omissions by checking from reality back toward the represented list.`
        : `Close or explicitly classify ${label}.`,
      'P5', {
        blocking: closureMaterial(c) || c.blocking === true,
        materiality: closureMaterial(c) ? 'HIGH' : 'MEDIUM',
        label,
        subject_label: label,
        inverse_check_required: shouldInvert,
        related_refs: c.basis_refs ?? []
      }));
  }

  for (const ac of workspace.acceptance_cases ?? []) {
    if (['FAIL', 'UNRESOLVED'].includes(ac.status)) {
      out.push(ref(ac.case_id, 'counterfactual', `Resolve the operating-law gap exposed by: ${ac.scenario}`, 'P4', {
        blocking: true,
        materiality: 'HIGH',
        subject_label: ac.subject_label ?? 'this scenario',
        related_refs: ac.basis_refs ?? [],
        uncertainty_kind: 'assumption'
      }));
    }
  }

  if ((workspace.status === 'DISCOVERY' || !workspace.status) && out.length === 0 &&
      (workspace.assertions ?? []).length === 0 && (workspace.testimony ?? []).length === 0) {
    out.push(ref('WORKSPACE_DISCOVERY', 'narrative', 'The field has not yet been described enough to form a candidate reality map.', 'P7', {
      blocking: false,
      materiality: 'MEDIUM',
      subject_label: workspace.provisional_field ?? workspace.provisional_subject?.label ?? 'this field',
      uncertainty_kind: 'open_field',
      related_refs: []
    }));
  }

  return out;
}

export function scoreQuestionCandidate(c) {
  let score = PRIORITY_BASE[c.priorityClass] ?? 0;
  if (c.blocking) score += 100;
  score += MATERIALITY[c.materiality] ?? 0;
  if (c.type === 'topology') score += 45;
  if (c.type === 'authority') score += 40;
  if (c.type === 'identity') score += 40;
  if (c.type === 'transition') score += 35;
  if (c.type === 'exception') score += 35;
  if (c.type === 'closure' || c.type === 'completeness') score += 30;
  if (c.type === 'counterfactual') score += 25;
  if (c.type === 'provenance') score += 20;
  return score;
}

function questionProjection(c) {
  const plan = buildQuestionPlan(c);
  return {
    question: plan.question,
    reason: c.reason,
    priority_class: c.priorityClass,
    score: c.score,
    related_refs: [c.id, ...(c.related_refs ?? [])],
    expected_structural_gain: plan.expected_structural_gain,
    operator: plan.operator,
    operator_modifiers: plan.modifiers,
    wrapped_operator: plan.wrapped_operator,
    operator_reason: plan.operator_reason,
    next_operator_candidates: plan.next_operators
  };
}

export function selectNextQuestion(workspace) {
  const ranked = collectQuestionCandidates(workspace)
    .map(c => ({ ...c, score: scoreQuestionCandidate(c) }))
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));

  if (!ranked.length) return { status: 'NO_MATERIAL_QUESTION', primary: null, alternates: [] };
  const [primary, ...rest] = ranked;
  return { status: 'QUESTION_AVAILABLE', primary: questionProjection(primary), alternates: rest.slice(0, 2).map(questionProjection) };
}

function blocker(code, message, refs = []) { return { code, message, refs }; }

export function runReadinessCheck(workspace) {
  const blockers = [];
  const warnings = [];
  const nonBlockingUnknowns = [];

  if (workspace.boundary_status !== 'SUFFICIENTLY_BOUNDED') blockers.push(blocker('BOUNDARY_UNRESOLVED', 'Ledger boundary is not sufficiently bounded.'));

  for (const c of workspace.closure ?? []) {
    const state = closureState(c);
    const material = closureMaterial(c);
    if (['KNOWN_INCOMPLETE', 'UNRESOLVED', 'NOT_YET_RECONCILED'].includes(state) && (material || c.blocking === true)) {
      blockers.push(blocker('MATERIAL_CLOSURE_OPEN', `${closureLabel(c)} is not closed.`, [c.closure_id]));
    }
    if (closureCollection(c) && state === 'CLOSED_COMPLETE' && material && inverseChecked(c) !== true) {
      blockers.push(blocker('COMPLETENESS_NOT_INVERTED', `${closureLabel(c)} was closed without a reality-to-record completeness check.`, [c.closure_id]));
    }
  }

  for (const u of workspace.unknowns ?? []) {
    if (u.status !== 'OPEN') continue;
    if (u.blocking) blockers.push(blocker('BLOCKING_UNKNOWN', u.description, [u.unknown_id]));
    else nonBlockingUnknowns.push({ unknown_id: u.unknown_id, description: u.description, materiality: u.materiality });
  }

  for (const c of workspace.contradictions ?? []) {
    if (c.status === 'OPEN' && c.blocking) blockers.push(blocker('BLOCKING_CONTRADICTION', c.description ?? 'Blocking contradiction remains open.', [c.contradiction_id]));
  }

  for (const l of workspace.ledger_candidates ?? []) {
    if (ledgerClassification(l) === 'UNRESOLVED' && l.blocking) {
      blockers.push(blocker('BLOCKING_TOPOLOGY', `${ledgerName(l)} has unresolved Ledger topology.`, [l.ledger_candidate_id]));
    }
  }

  for (const a of workspace.assertions ?? []) {
    const q = inquiry(a);
    if (a.stage === 'ESTABLISHED' && ['HIGH', 'CRITICAL'].includes(a.materiality) && assertionBasis(a).length === 0) {
      blockers.push(blocker('MISSING_PROVENANCE', `Material established assertion ${a.assertion_id} has no preserved basis.`, [a.assertion_id]));
    }
    if (a.stage === 'ESTABLISHED' && a.materiality === 'CRITICAL' && q.verification_required === true && q.verified !== true) {
      blockers.push(blocker('CRITICAL_ASSERTION_UNVERIFIED', `Critical assertion ${a.assertion_id} still requires governed verification.`, [a.assertion_id]));
    }
  }

  for (const ac of workspace.acceptance_cases ?? []) {
    if (['FAIL', 'UNRESOLVED', 'NOT_RUN'].includes(ac.status) && ac.required !== false) {
      blockers.push(blocker('ACCEPTANCE_NOT_PASSING', `Acceptance case ${ac.case_id} is ${ac.status}.`, [ac.case_id]));
    }
  }

  if (!(workspace.assertions ?? []).some(a => a.stage === 'ESTABLISHED' && /authority|responsib|custody|jurisdiction/.test(assertionKind(a)))) {
    warnings.push({ code: 'AUTHORITY_COVERAGE_NOT_DEMONSTRATED', message: 'No established authority/responsibility assertion is visible in this snapshot.' });
  }

  const next = selectNextQuestion(workspace);
  return {
    ready: blockers.length === 0,
    blockers,
    warnings,
    non_blocking_unknowns: nonBlockingUnknowns,
    recommended_next_work: blockers.length ? next.primary : null,
    evaluated_protocol_version: workspace.protocol_version ?? '0.1'
  };
}
