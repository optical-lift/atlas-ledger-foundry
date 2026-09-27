// Foundry session projection v0.1
// Pure, storage-free projection logic. No persistence or Atlas Reality writes.

import { selectNextQuestion, runReadinessCheck } from './foundry-engines.mjs';

const CORE_RULES = [
  'Function before inherited label.',
  'Source is not carrier.',
  'Evidence, interpretation, and reality are distinct.',
  'Role is not bearer.',
  'Access or capability is not authority.',
  'State is not event.',
  'Operation is not outcome.',
  'Possibility, permission, requirement, expectation, and occurrence are distinct.',
  'Unknown is not none.',
  'Similarity is not identity.',
  'Successful outcome does not establish lawful method.',
  'A new named thing is not automatically a new Ledger.',
  'Faithful incompleteness is superior to invented completeness.'
];

function byId(records = []) {
  return new Map(records.filter(Boolean).map(r => [
    r.assertion_id ?? r.testimony_id ?? r.source_id ?? r.unknown_id ?? r.contradiction_id ?? r.closure_id ?? r.ledger_candidate_id ?? r.case_id,
    r
  ]));
}

function stableId(record) {
  return record?.assertion_id ?? record?.testimony_id ?? record?.source_id ?? record?.unknown_id ?? record?.contradiction_id ?? record?.closure_id ?? record?.ledger_candidate_id ?? record?.case_id ?? null;
}

export function collectRelevantRecords(workspace, relatedRefs = []) {
  const collections = [
    ...(workspace.sources ?? []),
    ...(workspace.testimony ?? []),
    ...(workspace.assertions ?? []),
    ...(workspace.unknowns ?? []),
    ...(workspace.contradictions ?? []),
    ...(workspace.closure ?? []),
    ...(workspace.ledger_candidates ?? []),
    ...(workspace.acceptance_cases ?? [])
  ];
  const index = byId(collections);
  const selected = new Map();
  const queue = [...new Set(relatedRefs.filter(Boolean))];

  while (queue.length) {
    const id = queue.shift();
    if (selected.has(id)) continue;
    const record = index.get(id);
    if (!record) continue;
    selected.set(id, record);

    for (const ref of [
      ...(record.basis_refs ?? []),
      ...(record.record_refs ?? []),
      ...(record.source_refs ?? []),
      ...(record.testimony_refs ?? [])
    ]) {
      if (!selected.has(ref)) queue.push(ref);
    }
  }

  return [...selected.values()];
}

export function buildSessionContext(workspace, options = {}) {
  const next = selectNextQuestion(workspace);
  const readiness = runReadinessCheck(workspace);
  const relatedRefs = next.primary?.related_refs ?? [];
  const neighborhood = collectRelevantRecords(workspace, relatedRefs);

  const establishedProjection = (workspace.assertions ?? [])
    .filter(a => a.stage === 'ESTABLISHED')
    .filter(a => {
      if (!relatedRefs.length) return ['HIGH', 'CRITICAL'].includes(a.materiality);
      const id = stableId(a);
      return relatedRefs.includes(id) || (a.basis_refs ?? []).some(r => relatedRefs.includes(r));
    })
    .map(a => ({ ...a }));

  const unresolvedProjection = neighborhood.filter(r => {
    if (r.status === 'OPEN' || r.status === 'UNRESOLVED' || r.status === 'KNOWN_INCOMPLETE' || r.status === 'NOT_YET_RECONCILED') return true;
    if (r.stage === 'NEEDS_CLARIFICATION' || r.stage === 'CONFLICTED') return true;
    return false;
  });

  const evidenceRefs = [...new Set(neighborhood.flatMap(r => [
    ...(r.basis_refs ?? []),
    ...(r.source_refs ?? []),
    ...(r.testimony_refs ?? []),
    ['source', 'testimony'].includes(r.record_type) ? stableId(r) : null
  ]).filter(Boolean))];

  return {
    session_id: options.session_id ?? `session-${workspace.workspace_id ?? 'workspace'}`,
    workspace_id: workspace.workspace_id ?? 'workspace',
    workspace_version: options.workspace_version ?? workspace.workspace_version ?? workspace.updated_at ?? 'unversioned',
    protocol_version: workspace.protocol_version ?? '0.1',
    governing_order_version: options.governing_order_version ?? '0.1',
    generated_at: options.generated_at ?? new Date(0).toISOString(),
    workspace_status: workspace.status ?? 'DISCOVERY',
    provisional_subject: workspace.provisional_subject ?? { label: 'Unresolved subject', subject_ref: null },
    provisional_field: workspace.provisional_field ?? 'Unresolved field',
    boundary_status: workspace.boundary_status ?? 'UNRESOLVED',
    orientation: {
      north_star: 'Discover and preserve the structure actually present in the human\'s reality. Do not manufacture completeness.',
      core_rules: CORE_RULES
    },
    blockers: readiness.blockers,
    established_projection: establishedProjection,
    unresolved_projection: unresolvedProjection,
    evidence_refs: evidenceRefs,
    next_question: next.primary,
    alternate_questions: next.alternates ?? [],
    allowed_operations: options.allowed_operations ?? [
      'get_relevant_evidence',
      'get_governing_rule',
      'record_testimony',
      'submit_candidate_assertions',
      'record_unknown',
      'record_contradiction',
      'record_ledger_candidate',
      'get_next_question'
    ],
    omissions_notice: {
      packet_is_partial: true,
      message: 'This session packet is a governed projection, not the whole Foundry workspace. Request relevant evidence before assuming omitted records do not exist.',
      omitted_categories: options.omitted_categories ?? ['unrelated low-materiality history', 'unrelated evidence', 'private evaluation material']
    }
  };
}
