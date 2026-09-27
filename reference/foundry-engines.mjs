// Atlas Ledger Foundry reference engines v0.1
// Pure, storage-free reference logic. No database access and no Atlas Reality writes.

const MATERIALITY = { LOW: 5, MEDIUM: 20, HIGH: 50, CRITICAL: 80 };

function ref(id, type, reason, priorityClass, extra = {}) {
  return { id, type, reason, priorityClass, ...extra };
}

export function collectQuestionCandidates(workspace) {
  const out = [];

  for (const c of workspace.contradictions ?? []) {
    if (c.status !== 'OPEN') continue;
    out.push(ref(c.contradiction_id, 'contradiction', c.description ?? 'Open contradiction', c.blocking ? 'P1' : 'P7', {
      blocking: !!c.blocking,
      materiality: c.blocking ? 'CRITICAL' : 'MEDIUM',
      related_refs: c.record_refs ?? []
    }));
  }

  for (const u of workspace.unknowns ?? []) {
    if (u.status !== 'OPEN') continue;
    out.push(ref(u.unknown_id, 'unknown', u.description, u.blocking ? 'P1' : 'P7', {
      blocking: !!u.blocking,
      materiality: u.materiality ?? 'MEDIUM',
      domain: u.domain ?? null,
      related_refs: u.basis_refs ?? []
    }));
  }

  for (const l of workspace.ledger_candidates ?? []) {
    if (l.status === 'UNRESOLVED' || l.classification === 'UNRESOLVED' || !l.classification) {
      out.push(ref(l.ledger_candidate_id, 'topology', `Determine how ${l.label ?? 'this field'} relates to the current Ledger.`, 'P2', {
        blocking: !!l.blocking,
        materiality: l.blocking ? 'HIGH' : 'MEDIUM',
        related_refs: l.basis_refs ?? []
      }));
    }
  }

  for (const a of workspace.assertions ?? []) {
    if (a.stage === 'NEEDS_CLARIFICATION' || a.stage === 'CONFLICTED') {
      const kind = String(a.kind ?? '').toLowerCase();
      const authority = /authority|responsib|custody|jurisdiction|permission/.test(kind);
      const identity = /identity|continuity|same_as|different_from/.test(kind);
      const transition = /event|transition|state|rule|condition|exception/.test(kind);
      out.push(ref(a.assertion_id, authority ? 'authority' : identity ? 'identity' : transition ? 'transition' : 'assertion',
        a.interpretation_note ?? `Clarify ${a.kind ?? 'assertion'}.`,
        authority ? 'P3' : identity ? 'P3' : transition ? 'P4' : 'P7', {
          blocking: a.stage === 'CONFLICTED',
          materiality: a.materiality ?? 'HIGH',
          related_refs: a.basis_refs ?? []
        }));
    }
  }

  for (const c of workspace.closure ?? []) {
    if (['KNOWN_INCOMPLETE', 'UNRESOLVED', 'NOT_YET_RECONCILED'].includes(c.status)) {
      out.push(ref(c.closure_id, 'closure', `Close or explicitly classify ${c.label ?? c.domain ?? 'this material domain'}.`, 'P5', {
        blocking: c.materiality === 'MATERIAL' || c.blocking === true,
        materiality: c.materiality_level ?? (c.materiality === 'MATERIAL' ? 'HIGH' : 'MEDIUM'),
        related_refs: c.basis_refs ?? []
      }));
    }
  }

  for (const ac of workspace.acceptance_cases ?? []) {
    if (['FAIL', 'UNRESOLVED'].includes(ac.status)) {
      out.push(ref(ac.case_id, 'acceptance', `Resolve the operating-law gap exposed by: ${ac.scenario}`, 'P4', {
        blocking: true,
        materiality: 'HIGH',
        related_refs: ac.basis_refs ?? []
      }));
    }
  }

  return out;
}

export function scoreQuestionCandidate(c) {
  let score = 0;
  if (c.blocking) score += 100;
  score += MATERIALITY[c.materiality] ?? 0;
  if (c.type === 'topology') score += 45;
  if (c.type === 'authority') score += 40;
  if (c.type === 'identity') score += 40;
  if (c.type === 'transition') score += 35;
  if (c.type === 'closure') score += 30;
  if (c.type === 'acceptance') score += 25;
  if (c.type === 'provenance') score += 20;
  return score;
}

function makeQuestion(c) {
  switch (c.type) {
    case 'contradiction': return `I have two pieces of information that do not currently fit together: ${c.reason} Which one is current, or what distinction makes both true?`;
    case 'unknown': return `I need to resolve this before the Ledger can safely operate: ${c.reason} What is true here?`;
    case 'topology': return `${c.reason} What is its relationship to the current field: part of it, separately governed, or related but external?`;
    case 'authority': return `I need to distinguish authority from execution here. ${c.reason} Who can actually decide, and under what scope or condition?`;
    case 'identity': return `I need to know whether these refer to the same continuing thing or to distinct things. ${c.reason}`;
    case 'transition': return `What event or condition changes this state, and what becomes required or possible afterward? ${c.reason}`;
    case 'closure': return `${c.reason} Have all materially relevant current members been accounted for, or is something still missing?`;
    case 'acceptance': return `${c.reason} What should happen in that situation, and who has authority to decide it?`;
    default: return c.reason;
  }
}

export function selectNextQuestion(workspace) {
  const ranked = collectQuestionCandidates(workspace)
    .map(c => ({ ...c, score: scoreQuestionCandidate(c) }))
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));

  if (!ranked.length) return { status: 'NO_MATERIAL_QUESTION', primary: null, alternates: [] };

  const [primary, ...rest] = ranked;
  return {
    status: 'QUESTION_AVAILABLE',
    primary: {
      question: makeQuestion(primary),
      reason: primary.reason,
      priority_class: primary.priorityClass,
      score: primary.score,
      related_refs: [primary.id, ...(primary.related_refs ?? [])],
      expected_structural_gain: primary.type
    },
    alternates: rest.slice(0, 2).map(c => ({
      question: makeQuestion(c),
      reason: c.reason,
      priority_class: c.priorityClass,
      score: c.score,
      related_refs: [c.id, ...(c.related_refs ?? [])]
    }))
  };
}

function blocker(code, message, refs = []) { return { code, message, refs }; }

export function runReadinessCheck(workspace) {
  const blockers = [];
  const warnings = [];
  const nonBlockingUnknowns = [];

  if (workspace.boundary_status !== 'SUFFICIENTLY_BOUNDED') {
    blockers.push(blocker('BOUNDARY_UNRESOLVED', 'Ledger boundary is not sufficiently bounded.'));
  }

  for (const c of workspace.closure ?? []) {
    if (['KNOWN_INCOMPLETE', 'UNRESOLVED', 'NOT_YET_RECONCILED'].includes(c.status) && (c.materiality === 'MATERIAL' || c.blocking === true)) {
      blockers.push(blocker('MATERIAL_CLOSURE_OPEN', `${c.label ?? c.domain ?? c.closure_id} is not closed.`, [c.closure_id]));
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
    if ((l.status === 'UNRESOLVED' || l.classification === 'UNRESOLVED' || !l.classification) && l.blocking) {
      blockers.push(blocker('BLOCKING_TOPOLOGY', `${l.label ?? l.ledger_candidate_id} has unresolved Ledger topology.`, [l.ledger_candidate_id]));
    }
  }

  for (const a of workspace.assertions ?? []) {
    if (a.stage === 'ESTABLISHED' && (a.materiality === 'HIGH' || a.materiality === 'CRITICAL') && !(a.basis_refs?.length)) {
      blockers.push(blocker('MISSING_PROVENANCE', `Material established assertion ${a.assertion_id} has no preserved basis.`, [a.assertion_id]));
    }
  }

  for (const ac of workspace.acceptance_cases ?? []) {
    if (['FAIL', 'UNRESOLVED', 'NOT_RUN'].includes(ac.status) && ac.required !== false) {
      blockers.push(blocker('ACCEPTANCE_NOT_PASSING', `Acceptance case ${ac.case_id} is ${ac.status}.`, [ac.case_id]));
    }
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
