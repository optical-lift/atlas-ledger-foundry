// Atlas Ledger Foundry reference engines v0.1
// Pure, storage-free reference logic. No database access and no Atlas Reality writes.

import { buildQuestionPlan } from './question-operators.mjs';

const MATERIALITY = { LOW: 5, MEDIUM: 20, HIGH: 50, CRITICAL: 80 };
const PRIORITY_BASE = { P0: 1000, P1: 900, P2: 800, P3: 700, P4: 600, P5: 500, P6: 400, P7: 300 };

function ref(id, type, reason, priorityClass, extra = {}) {
  return { id, type, reason, priorityClass, ...extra };
}

function inferUnknownType(u) {
  const k = String(u.uncertainty_kind ?? '').toLowerCase();
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
  const k = String(a.kind ?? '').toLowerCase();
  if (a.needs_function_definition || a.uncertainty_kind === 'function') return 'function';
  if (a.needs_scope || a.uncertainty_kind === 'scope') return 'boundary';
  if (a.needs_trigger || a.uncertainty_kind === 'trigger') return 'transition';
  if (a.needs_exception || a.uncertainty_kind === 'exception') return 'exception';
  if (a.needs_signpost || a.uncertainty_kind === 'refresh') return 'signpost';
  if (a.needs_confirmation || a.uncertainty_kind === 'confirmation') return 'verification';
  if (/authority|responsib|custody|jurisdiction|permission/.test(k)) return 'authority';
  if (/identity|continuity|same_as|different_from/.test(k)) return 'identity';
  if (/event|transition|state|rule|condition/.test(k)) return 'transition';
  return 'assertion';
}

export function collectQuestionCandidates(workspace) {
  const out = [];

  for (const a of workspace.assertions ?? []) {
    if (a.stage === 'ESTABLISHED' && ['HIGH', 'CRITICAL'].includes(a.materiality) && !(a.basis_refs?.length)) {
      out.push(ref(a.assertion_id, 'provenance', `Material established assertion ${a.assertion_id} lacks a preserved basis.`, 'P0', {
        blocking: true,
        materiality: a.materiality,
        kind: a.kind,
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
    out.push(ref(u.unknown_id, inferUnknownType(u), u.description, u.blocking ? 'P1' : (u.priority_class ?? 'P7'), {
      blocking: !!u.blocking,
      materiality: u.materiality ?? 'MEDIUM',
      domain: u.domain ?? null,
      subject_label: u.subject_label ?? null,
      uncertainty_kind: u.uncertainty_kind ?? null,
      operator_hint: u.operator_hint ?? null,
      evidence_standard: u.evidence_standard ?? null,
      related_refs: u.basis_refs ?? []
    }));
  }

  for (const l of workspace.ledger_candidates ?? []) {
    if (l.status === 'UNRESOLVED' || l.classification === 'UNRESOLVED' || !l.classification) {
      out.push(ref(l.ledger_candidate_id, 'topology', `Determine how ${l.label ?? 'this field'} relates to the current Ledger.`, 'P2', {
        blocking: !!l.blocking,
        materiality: l.blocking ? 'HIGH' : 'MEDIUM',
        label: l.label,
        subject_label: l.label,
        related_refs: l.basis_refs ?? [],
        uncertainty_kind: 'competing_models'
      }));
    }
  }

  for (const a of workspace.assertions ?? []) {
    if (a.stage === 'NEEDS_CLARIFICATION' || a.stage === 'CONFLICTED' || (a.stage === 'CANDIDATE' && a.needs_confirmation)) {
      const type = inferAssertionType(a);
      const authority = type === 'authority';
      const identity = type === 'identity';
      const transition = ['transition', 'exception'].includes(type);
      out.push(ref(a.assertion_id, type, a.interpretation_note ?? `Clarify ${a.kind ?? 'assertion'}.`,
        authority || identity ? 'P3' : transition ? 'P4' : type === 'boundary' ? 'P3' : type === 'verification' ? 'P3' : type === 'function' ? 'P3' : 'P7', {
          blocking: a.stage === 'CONFLICTED',
          materiality: a.materiality ?? 'HIGH',
          kind: a.kind,
          subject_label: a.subject_label ?? a.label ?? null,
          uncertainty_kind: a.uncertainty_kind ?? null,
          operator_hint: a.operator_hint ?? null,
          needs_function_definition: !!a.needs_function_definition,
          needs_scope: !!a.needs_scope,
          needs_trigger: !!a.needs_trigger,
          needs_exception: !!a.needs_exception,
          needs_confirmation: !!a.needs_confirmation,
          related_refs: a.basis_refs ?? []
        }));
    }

    if (a.stage === 'ESTABLISHED' && a.needs_signpost === true) {
      out.push(ref(a.assertion_id, 'signpost', a.interpretation_note ?? `Established claim ${a.assertion_id} needs an observable refresh trigger.`, 'P6', {
        blocking: false,
        materiality: a.materiality ?? 'MEDIUM',
        kind: a.kind,
        subject_label: a.subject_label ?? a.label ?? null,
        needs_signpost: true,
        related_refs: a.basis_refs ?? []
      }));
    }
  }

  for (const c of workspace.closure ?? []) {
    if (!['KNOWN_INCOMPLETE', 'UNRESOLVED', 'NOT_YET_RECONCILED'].includes(c.status)) continue;
    const shouldInvert = c.collection === true && c.inverse_checked !== true && c.known_member_count > 0;
    out.push(ref(c.closure_id, shouldInvert ? 'completeness' : 'closure',
      shouldInvert
        ? `Test whether ${c.label ?? c.domain ?? 'this collection'} contains silent omissions by checking from reality back toward the represented list.`
        : `Close or explicitly classify ${c.label ?? c.domain ?? 'this material domain'}.`,
      'P5', {
        blocking: c.materiality === 'MATERIAL' || c.blocking === true,
        materiality: c.materiality_level ?? (c.materiality === 'MATERIAL' ? 'HIGH' : 'MEDIUM'),
        label: c.label ?? c.domain,
        subject_label: c.label ?? c.domain,
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
  return {
    status: 'QUESTION_AVAILABLE',
    primary: questionProjection(primary),
    alternates: rest.slice(0, 2).map(questionProjection)
  };
}

function blocker(code, message, refs = []) { return { code, message, refs }; }

export function runReadinessCheck(workspace) {
  const blockers = [];
  const warnings = [];
  const nonBlockingUnknowns = [];

  if (workspace.boundary_status !== 'SUFFICIENTLY_BOUNDED') blockers.push(blocker('BOUNDARY_UNRESOLVED', 'Ledger boundary is not sufficiently bounded.'));

  for (const c of workspace.closure ?? []) {
    if (['KNOWN_INCOMPLETE', 'UNRESOLVED', 'NOT_YET_RECONCILED'].includes(c.status) && (c.materiality === 'MATERIAL' || c.blocking === true)) {
      blockers.push(blocker('MATERIAL_CLOSURE_OPEN', `${c.label ?? c.domain ?? c.closure_id} is not closed.`, [c.closure_id]));
    }
    if (c.collection === true && c.status === 'CLOSED_COMPLETE' && c.inverse_checked !== true) {
      blockers.push(blocker('COMPLETENESS_NOT_INVERTED', `${c.label ?? c.domain ?? c.closure_id} was closed without a reality-to-record completeness check.`, [c.closure_id]));
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
    if ((l.status === 'UNRESOLVED' || l.classification === 'UNRESOLVED' || !l.classification) && l.blocking) blockers.push(blocker('BLOCKING_TOPOLOGY', `${l.label ?? l.ledger_candidate_id} has unresolved Ledger topology.`, [l.ledger_candidate_id]));
  }

  for (const a of workspace.assertions ?? []) {
    if (a.stage === 'ESTABLISHED' && (a.materiality === 'HIGH' || a.materiality === 'CRITICAL') && !(a.basis_refs?.length)) {
      blockers.push(blocker('MISSING_PROVENANCE', `Material established assertion ${a.assertion_id} has no preserved basis.`, [a.assertion_id]));
    }
    if (a.stage === 'ESTABLISHED' && a.materiality === 'CRITICAL' && a.verification_required === true && a.verified !== true) {
      blockers.push(blocker('CRITICAL_ASSERTION_UNVERIFIED', `Critical assertion ${a.assertion_id} still requires governed verification.`, [a.assertion_id]));
    }
  }

  for (const ac of workspace.acceptance_cases ?? []) {
    if (['FAIL', 'UNRESOLVED', 'NOT_RUN'].includes(ac.status) && ac.required !== false) blockers.push(blocker('ACCEPTANCE_NOT_PASSING', `Acceptance case ${ac.case_id} is ${ac.status}.`, [ac.case_id]));
  }

  if (!(workspace.assertions ?? []).some(a => a.stage === 'ESTABLISHED' && /authority|responsib|custody|jurisdiction/.test(String(a.kind ?? '').toLowerCase()))) {
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
