// Atlas Ledger Foundry canon-discovery reference v0.1
// Pure validation and candidate-generation logic.
// The AI notices supported structure; this module prevents industry templates
// from becoming ontology authority and turns observations into auditable gaps.

export const DISCOVERY_LENSES = Object.freeze([
  'FUNCTION','SOURCE','CARRIER','BOUNDARY','STATE','TRIGGER','CUSTODY','ACCESS',
  'PREPARATION','INTAKE','OUTCOME','BREACH','REPAIR','TIME','CONTINUITY','EXCEPTION'
]);

const CONTRACT = Object.freeze({
  FUNCTION:   { operator_hint:'DEFINE_BY_FUNCTION', priorityClass:'P3', uncertainty_kind:'function' },
  SOURCE:     { operator_hint:'TRACE',              priorityClass:'P3', uncertainty_kind:'source' },
  CARRIER:    { operator_hint:'TRACE',              priorityClass:'P3', uncertainty_kind:'provenance' },
  BOUNDARY:   { operator_hint:'BOUND',              priorityClass:'P3', uncertainty_kind:'scope' },
  STATE:      { operator_hint:'TRIGGER',            priorityClass:'P4', uncertainty_kind:'trigger' },
  TRIGGER:    { operator_hint:'TRIGGER',            priorityClass:'P4', uncertainty_kind:'trigger' },
  CUSTODY:    { operator_hint:'TRACE',              priorityClass:'P3', uncertainty_kind:'provenance' },
  ACCESS:     { operator_hint:'BOUND',              priorityClass:'P3', uncertainty_kind:'scope' },
  PREPARATION:{ operator_hint:'GATE',               priorityClass:'P4', uncertainty_kind:'applicability' },
  INTAKE:     { operator_hint:'TRACE',              priorityClass:'P4', uncertainty_kind:'source' },
  OUTCOME:    { operator_hint:'VERIFY',             priorityClass:'P4', uncertainty_kind:'confirmation' },
  BREACH:     { operator_hint:'DISCRIMINATE',       priorityClass:'P4', uncertainty_kind:'competing_models' },
  REPAIR:     { operator_hint:'REPAIR',             priorityClass:'P4', uncertainty_kind:'repair' },
  TIME:       { operator_hint:'BOUND',              priorityClass:'P4', uncertainty_kind:'scope' },
  CONTINUITY: { operator_hint:'DISCRIMINATE',       priorityClass:'P3', uncertainty_kind:'competing_models' },
  EXCEPTION:  { operator_hint:'EXCEPTION',          priorityClass:'P4', uncertainty_kind:'exception' }
});

const VALID = new Set(DISCOVERY_LENSES);

export function validateDiscoveryObservation(observation) {
  const errors = [];
  if (!observation?.observation_id) errors.push('missing observation_id');
  if (!VALID.has(observation?.discovery_lens)) errors.push(`unsupported discovery_lens ${observation?.discovery_lens ?? '(missing)'}`);
  if (!observation?.description) errors.push('missing description');
  if (!(observation?.supporting_refs ?? []).length) errors.push('discovery observation must cite preserved evidence');
  if (observation?.industry_assumption !== false) errors.push('industry_assumption must be explicitly false');
  return { valid: errors.length === 0, errors };
}

export function buildDiscoveryGap(observation) {
  const check = validateDiscoveryObservation(observation);
  if (!check.valid) throw new Error(check.errors.join('; '));
  const rule = CONTRACT[observation.discovery_lens];
  return {
    id: observation.gap_id ?? `DG-${observation.observation_id}`,
    type: observation.type ?? lensType(observation.discovery_lens),
    reason: observation.gap_reason ?? observation.description,
    priorityClass: observation.priorityClass ?? rule.priorityClass,
    blocking: !!observation.blocking,
    materiality: observation.materiality ?? 'MEDIUM',
    subject_label: observation.subject_label ?? null,
    discovery_lens: observation.discovery_lens,
    supporting_refs: [...new Set(observation.supporting_refs)],
    cluster_refs: [...new Set(observation.cluster_refs ?? [])],
    industry_assumption: false,
    operator_hint: observation.operator_hint ?? rule.operator_hint,
    uncertainty_kind: observation.uncertainty_kind ?? rule.uncertainty_kind,
    related_refs: [...new Set([...(observation.supporting_refs ?? []), ...(observation.cluster_refs ?? [])])]
  };
}

function lensType(lens) {
  const map = {
    FUNCTION:'function', SOURCE:'provenance', CARRIER:'provenance', BOUNDARY:'boundary',
    STATE:'transition', TRIGGER:'transition', CUSTODY:'authority', ACCESS:'boundary',
    PREPARATION:'gate', INTAKE:'provenance', OUTCOME:'verification', BREACH:'contradiction',
    REPAIR:'repair', TIME:'boundary', CONTINUITY:'identity', EXCEPTION:'exception'
  };
  return map[lens] ?? 'unknown';
}

export function buildDiscoveryGaps(observations = []) {
  return observations.map(buildDiscoveryGap);
}

export function validateDiscoveryGap(gap) {
  const errors = [];
  if (!gap?.id) errors.push('missing id');
  if (!VALID.has(gap?.discovery_lens)) errors.push(`unsupported discovery_lens ${gap?.discovery_lens ?? '(missing)'}`);
  if (!(gap?.supporting_refs ?? []).length) errors.push('discovery gap must retain supporting_refs');
  if (gap?.industry_assumption !== false) errors.push('industry_assumption must remain false');
  return { valid: errors.length === 0, errors };
}

export function discoverySignature(gap) {
  const check = validateDiscoveryGap(gap);
  if (!check.valid) throw new Error(check.errors.join('; '));
  return {
    discovery_lens: gap.discovery_lens,
    type: gap.type,
    priorityClass: gap.priorityClass,
    operator_hint: gap.operator_hint,
    uncertainty_kind: gap.uncertainty_kind,
    industry_assumption: gap.industry_assumption
  };
}
