export const OPERATOR_NAMES = Object.freeze([
  'NARRATE','GATE','DISCRIMINATE','TRACE','INVERT','VERIFY','DEFINE_BY_FUNCTION','BOUND','TRIGGER','EXCEPTION','COUNTERFACTUAL','SIGNPOST','CLOSE','ESCALATE'
]);

export const QUESTION_OPERATORS = Object.freeze({
  NARRATE: { structural_job: 'Open an under-modeled field without imposing categories.', expected_gain: 'candidate_map', next_operators: ['GATE','DEFINE_BY_FUNCTION','BOUND','DISCRIMINATE'] },
  GATE: { structural_job: 'Determine whether an entire branch, domain, role, rule, or collection applies before asking inside it.', expected_gain: 'branch_applicability', next_operators: ['NARRATE','BOUND','CLOSE'] },
  DISCRIMINATE: { structural_job: 'Separate competing structures by asking where they predict different observable answers.', expected_gain: 'model_separation', next_operators: ['TRACE','VERIFY','BOUND'] },
  TRACE: { structural_job: 'Follow a claim, authority, identity, or record back to its source, basis, or chain of custody.', expected_gain: 'provenance_or_source_chain', next_operators: ['VERIFY','BOUND','ESCALATE'] },
  INVERT: { structural_job: 'Test completeness in the reverse direction: reality to records, not only records to reality.', expected_gain: 'silent_omission_detection', next_operators: ['CLOSE','TRACE'] },
  VERIFY: { structural_job: 'Reflect a candidate interpretation to an authorized human or source for correction or confirmation.', expected_gain: 'governed_confirmation', next_operators: ['CLOSE','SIGNPOST','TRACE'] },
  DEFINE_BY_FUNCTION: { structural_job: 'Replace an inherited label with what the thing actually does, changes, permits, blocks, or carries.', expected_gain: 'functional_definition', next_operators: ['BOUND','TRIGGER','DISCRIMINATE'] },
  BOUND: { structural_job: 'Establish where a claim, role, rule, identity, or authority starts and stops across time, place, object, subject, or jurisdiction.', expected_gain: 'scope_boundary', next_operators: ['TRIGGER','EXCEPTION','VERIFY'] },
  TRIGGER: { structural_job: 'Find the event or condition that changes state and what becomes possible, required, or prohibited afterward.', expected_gain: 'state_transition', next_operators: ['EXCEPTION','SIGNPOST','VERIFY'] },
  EXCEPTION: { structural_job: 'Find the conditions under which an established rule does not apply, changes, or may be overridden.', expected_gain: 'exception_semantics', next_operators: ['BOUND','VERIFY','SIGNPOST'] },
  COUNTERFACTUAL: { structural_job: 'Ask what would have to be observed for the current model, assumption, or interpretation to be wrong.', expected_gain: 'falsification_condition', next_operators: ['DISCRIMINATE','SIGNPOST','TRACE'] },
  SIGNPOST: { structural_job: 'Identify the future observable event that should cause Atlas to re-evaluate an established claim.', expected_gain: 'refresh_trigger', next_operators: ['TRIGGER','VERIFY'] },
  CLOSE: { structural_job: 'Explicitly classify a material domain or collection as complete, none, not applicable, known incomplete, or unresolved.', expected_gain: 'explicit_closure', next_operators: [] },
  ESCALATE: { structural_job: 'Raise the evidence standard because the consequence of error, conflict, or authority risk is high.', expected_gain: 'stronger_evidence_basis', next_operators: ['TRACE','VERIFY','DISCRIMINATE'] }
});

const VALID = new Set(OPERATOR_NAMES);

function text(candidate) {
  return `${candidate.type ?? ''} ${candidate.reason ?? ''} ${candidate.domain ?? ''} ${candidate.kind ?? ''}`.toLowerCase();
}

function coreOperator(candidate) {
  if (VALID.has(candidate.operator_hint)) return candidate.operator_hint;
  const uncertainty = String(candidate.uncertainty_kind ?? '').toLowerCase();
  const t = text(candidate);
  if (candidate.type === 'narrative' || uncertainty === 'open_field') return 'NARRATE';
  if (candidate.type === 'gate' || uncertainty === 'applicability' || candidate.branch_gate === true) return 'GATE';
  if (candidate.type === 'contradiction' || candidate.type === 'topology' || candidate.type === 'identity' || uncertainty === 'competing_models') return 'DISCRIMINATE';
  if (candidate.type === 'provenance' || uncertainty === 'source' || uncertainty === 'provenance') return 'TRACE';
  if (candidate.type === 'completeness' || uncertainty === 'completeness' || candidate.inverse_check_required === true) return 'INVERT';
  if (candidate.type === 'verification' || uncertainty === 'confirmation' || candidate.needs_confirmation === true) return 'VERIFY';
  if (candidate.type === 'function' || uncertainty === 'function' || candidate.needs_function_definition === true) return 'DEFINE_BY_FUNCTION';
  if (candidate.type === 'boundary' || candidate.type === 'authority' || uncertainty === 'scope' || candidate.needs_scope === true) return 'BOUND';
  if (candidate.type === 'transition' || uncertainty === 'trigger' || candidate.needs_trigger === true) return 'TRIGGER';
  if (candidate.type === 'exception' || uncertainty === 'exception' || candidate.needs_exception === true) return 'EXCEPTION';
  if (candidate.type === 'counterfactual' || candidate.type === 'acceptance' || uncertainty === 'assumption') return 'COUNTERFACTUAL';
  if (candidate.type === 'signpost' || uncertainty === 'refresh' || candidate.needs_signpost === true) return 'SIGNPOST';
  if (candidate.type === 'closure') return 'CLOSE';
  if (/who (said|authorized)|source|basis|provenance|came from/.test(t)) return 'TRACE';
  if (/where|when|scope|jurisdiction|limit|boundary/.test(t)) return 'BOUND';
  if (/what changes|trigger|becomes|state/.test(t)) return 'TRIGGER';
  if (/except|exception|override|unless/.test(t)) return 'EXCEPTION';
  if (/still true|recheck|refresh|change indicator/.test(t)) return 'SIGNPOST';
  if (/label|called|manager|owner|lead|handles/.test(t)) return 'DEFINE_BY_FUNCTION';
  if (/whether|applies|exist|any /.test(t)) return 'GATE';
  return 'NARRATE';
}

export function selectQuestionOperator(candidate) {
  let operator = coreOperator(candidate);
  let wrapped_operator = null;
  const modifiers = [];
  const highConsequence = candidate.evidence_standard === 'ELEVATED' || candidate.requires_escalation === true ||
    (candidate.materiality === 'CRITICAL' && candidate.blocking === true) ||
    (candidate.type === 'provenance' && ['HIGH','CRITICAL'].includes(candidate.materiality));
  if (highConsequence) {
    if (operator === 'TRACE' && candidate.type === 'provenance') {
      wrapped_operator = 'TRACE';
      operator = 'ESCALATE';
    } else if (operator !== 'ESCALATE') {
      modifiers.push('ESCALATE');
    }
  }
  const contract = QUESTION_OPERATORS[operator];
  return { operator, modifiers, wrapped_operator, operator_reason: contract.structural_job, expected_structural_gain: contract.expected_gain, next_operators: contract.next_operators };
}

function subject(candidate) {
  return candidate.subject_label ?? candidate.label ?? candidate.domain ?? 'this';
}

export function renderOperatorQuestion(candidate, plan = selectQuestionOperator(candidate)) {
  const reason = candidate.reason ?? 'this unresolved part of the field';
  const s = subject(candidate);
  let q;
  switch (plan.operator) {
    case 'NARRATE': q = `Without organizing it for me first, walk me through how ${s} actually works in practice. Start where it becomes relevant and continue until the responsibility, process, or outcome is finished.`; break;
    case 'GATE': q = `Before I ask about the details, does ${s} actually exist or apply in this field now, or is it not part of how this works?`; break;
    case 'DISCRIMINATE': q = `I have more than one plausible way to understand this: ${reason} What observable difference would tell us which structure is actually true?`; break;
    case 'TRACE': q = `What is the original source or authority for this: ${reason} How can we trace it back to the person, record, event, or rule that makes it true?`; break;
    case 'INVERT': q = `Looking from reality back toward the records instead of from the records outward: what materially relevant ${s} could exist in real life without appearing in the list or system we already have?`; break;
    case 'VERIFY': q = `My current interpretation is: ${reason} What is wrong, incomplete, or too broad about that understanding?`; break;
    case 'DEFINE_BY_FUNCTION': q = `When you use the label for ${s}, what can it actually do, change, permit, block, carry, or decide in practice?`; break;
    case 'BOUND': q = `Where does this apply, and where does it stop? Please bound ${reason} by the relevant person, object, place, time, condition, or jurisdiction.`; break;
    case 'TRIGGER': q = `What event or condition changes this state, and what becomes possible, required, or prohibited immediately afterward? ${reason}`; break;
    case 'EXCEPTION': q = `When does this rule not apply, change, or allow an override? ${reason} What happens instead in that case?`; break;
    case 'COUNTERFACTUAL': q = `What would have to be observed for this interpretation to be wrong: ${reason}`; break;
    case 'SIGNPOST': q = `What observable event or condition would tell Atlas that this is no longer true and needs to be checked again: ${reason}`; break;
    case 'CLOSE': q = `For ${s}, which is true now: all materially relevant members are accounted for, there are none, it does not apply, it is known incomplete, or it is still unresolved?`; break;
    case 'ESCALATE': q = `Because an error here would have a material consequence, what authoritative person, original record, or independent source can corroborate this before Foundry relies on it: ${reason}`; break;
    default: q = reason;
  }
  if (plan.modifiers.includes('ESCALATE')) q += ' Because the consequence of error is high, please also identify the strongest authoritative or independent basis for the answer.';
  return q;
}

export function buildQuestionPlan(candidate) {
  const selected = selectQuestionOperator(candidate);
  return { ...selected, question: renderOperatorQuestion(candidate, selected), target_ref: candidate.id ?? candidate.assertion_id ?? candidate.unknown_id ?? candidate.closure_id ?? candidate.ledger_candidate_id ?? null };
}
