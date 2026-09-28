import assert from 'node:assert/strict';
import {
  PROJECTION_KINDS,
  WORK_MODES,
  applyAssignmentFailure,
  completeProjection,
  deriveWorkProjection,
  reconcileProjection,
  workProjectionSignature,
} from './work-kernel.mjs';

const asOf = '2026-09-28T12:00:00Z';

// A — Mowing after observability interruption: elapsed time cannot become physical truth.
const mowing = deriveWorkProjection({
  as_of: asOf,
  subject: { subject_id: 'ELM:CURVE_GARDEN_EDGES' },
  rule: {
    rule_id: 'elm_mowing_curve_garden_edges',
    mode: WORK_MODES.CONDITION_DRIVEN,
    physical_condition_authority: 'OBSERVATION_ONLY',
    action_key: 'mow',
  },
  current_knowledge: {
    status: 'UNKNOWN',
    observed_at: '2026-08-31T23:55:31.038697Z',
  },
  schedule: {
    eligible_now: true,
    occurrence_key: 'mowing-review:2026-09-28',
    missed_occurrence_count: 3,
  },
});
assert.equal(mowing.kind, PROJECTION_KINDS.OBSERVE_SUBJECT);
assert.equal(mowing.time_claims_physical_condition, false);
assert.notEqual(mowing.kind, PROJECTION_KINDS.PERFORM_ACTION);
assert.equal(mowing.creates_backlog, false);

const observedNeedsMowing = deriveWorkProjection({
  as_of: asOf,
  subject: { subject_id: 'ELM:CURVE_GARDEN_EDGES' },
  rule: {
    rule_id: 'elm_mowing_curve_garden_edges',
    mode: WORK_MODES.CONDITION_DRIVEN,
    physical_condition_authority: 'OBSERVATION_ONLY',
    action_key: 'mow',
  },
  current_knowledge: {
    status: 'KNOWN',
    observation_id: 'OBS:CURVE:2026-09-28',
    observed_at: asOf,
    state: 'NEEDS_MOWING',
    action_required: true,
  },
  schedule: { eligible_now: true },
});
assert.equal(observedNeedsMowing.kind, PROJECTION_KINDS.PERFORM_ACTION);
assert.equal(observedNeedsMowing.durable_basis.observation_id, 'OBS:CURVE:2026-09-28');

// B — Later authoritative work evidence supersedes stale execution projection.
const blockedWeedingProjection = {
  kind: PROJECTION_KINDS.PERFORM_ACTION,
  projection_id: 'WK:ENTRY-BB3-OLD',
  subject_id: 'ELM:ENTRY_BILLBOARD_BED_3',
  durable_basis: { rule_id: 'entry_billboard_reset_daily_v1' },
  execution_state: 'BLOCKED',
};
const reconciledWeeding = reconcileProjection(blockedWeedingProjection, [{
  event_id: 'EVT:ENTRY-BB3-WEEDED:2026-08-31',
  subject_id: 'ELM:ENTRY_BILLBOARD_BED_3',
  rule_id: 'entry_billboard_reset_daily_v1',
  effect: 'SATISFIES',
  occurred_at: '2026-08-31T19:04:32.673248Z',
}]);
assert.equal(reconciledWeeding.status, 'SUPERSEDED_PROJECTION');
assert.equal(reconciledWeeding.projection.execution_state, 'SUPERSEDED');
assert.equal(reconciledWeeding.superseded_by, 'EVT:ENTRY-BB3-WEEDED:2026-08-31');

// C — Crop count remains an unknown fact, not proof of operator failure.
const cropCount = deriveWorkProjection({
  as_of: asOf,
  subject: { subject_id: 'CROP:PROCUT_PLUM', relevant: true },
  mode: WORK_MODES.OBSERVATION_REQUIRED,
  current_knowledge: {
    status: 'UNKNOWN',
    observed_at: null,
  },
  knowledge_requirement: {
    requirement_id: 'REQ:PROCUT_PLUM:STAND_COUNT',
    material: true,
    relevant: true,
    last_requested_at: '2026-09-03T00:00:00Z',
  },
});
assert.equal(cropCount.kind, PROJECTION_KINDS.ACQUIRE_KNOWLEDGE);
assert.equal(cropCount.operator_failure_inferred, false);
assert.equal(cropCount.creates_backlog, false);

const retiredCropCount = deriveWorkProjection({
  as_of: asOf,
  subject: { subject_id: 'CROP:PROCUT_PLUM', relevant: false },
  mode: WORK_MODES.OBSERVATION_REQUIRED,
  current_knowledge: { status: 'UNKNOWN' },
  knowledge_requirement: {
    requirement_id: 'REQ:PROCUT_PLUM:STAND_COUNT',
    material: true,
    relevant: false,
  },
});
assert.equal(retiredCropCount.kind, PROJECTION_KINDS.NO_WORK);

// D — Daily chicken care resumes with one present occurrence, never invented backlog.
const chicken = deriveWorkProjection({
  as_of: asOf,
  subject: { subject_id: 'ELM:CHICKENS' },
  rule: {
    rule_id: 'anna_chicken_chore_daily_except_sunday',
    mode: WORK_MODES.SCHEDULED_OBLIGATION,
    accumulation: 'NON_ACCUMULATING',
    action_key: 'animal_care',
  },
  schedule: {
    eligible_now: true,
    occurrence_key: '2026-09-28:daily-care',
    missed_occurrence_count: 21,
  },
});
assert.equal(chicken.kind, PROJECTION_KINDS.FULFILL_OCCURRENCE);
assert.equal(chicken.missed_occurrence_count, 21);
assert.equal(chicken.backlog_projection_count, 0);
assert.equal(chicken.creates_backlog, false);

// E — Assignment failure changes execution state only.
const assignmentFailure = applyAssignmentFailure(chicken, {
  code: 'INACTIVE_MEMBERSHIP',
  message: 'Task cannot be assigned to an inactive membership.',
});
assert.equal(assignmentFailure.projection.execution_state, 'UNASSIGNED');
assert.equal(assignmentFailure.durable_effect, null);
assert.equal(assignmentFailure.projection.subject_id, chicken.subject_id);
assert.deepEqual(assignmentFailure.projection.durable_basis, chicken.durable_basis);

// Completion requires a durable result event.
assert.throws(
  () => completeProjection(chicken, {}),
  /result_event\.event_id is required/,
);
const completedChicken = completeProjection(chicken, {
  event_id: 'EVT:CHICKEN-CARE:2026-09-28',
  event_type: 'ANIMAL_CARE_OCCURRED',
  subject_id: 'ELM:CHICKENS',
  occurred_at: asOf,
});
assert.equal(completedChicken.projection.execution_state, 'COMPLETED');
assert.equal(completedChicken.durable_event.event_type, 'ANIMAL_CARE_OCCURRED');

// A later acceptable observation can supersede an old mowing projection.
const reconciledMowing = reconcileProjection(observedNeedsMowing, [{
  observation_id: 'OBS:CURVE:2026-09-28-LATER',
  subject_id: 'ELM:CURVE_GARDEN_EDGES',
  rule_id: 'elm_mowing_curve_garden_edges',
  effect: 'CONDITION_ACCEPTABLE',
  occurred_at: '2026-09-28T13:00:00Z',
}]);
assert.equal(reconciledMowing.status, 'SUPERSEDED_PROJECTION');
assert.equal(reconciledMowing.superseded_by, 'OBS:CURVE:2026-09-28-LATER');

// Reprojection from identical durable inputs is deterministic and does not multiply work identity.
const chickenReplay = deriveWorkProjection({
  as_of: asOf,
  subject: { subject_id: 'ELM:CHICKENS' },
  rule: {
    rule_id: 'anna_chicken_chore_daily_except_sunday',
    mode: WORK_MODES.SCHEDULED_OBLIGATION,
    accumulation: 'NON_ACCUMULATING',
    action_key: 'animal_care',
  },
  schedule: {
    eligible_now: true,
    occurrence_key: '2026-09-28:daily-care',
    missed_occurrence_count: 21,
  },
});
assert.equal(chickenReplay.projection_id, chicken.projection_id);
assert.equal(workProjectionSignature(chickenReplay), workProjectionSignature(chicken));

// Explicitly accumulating obligations are not guessed from elapsed time in v0.1.
const accumulating = deriveWorkProjection({
  as_of: asOf,
  subject: { subject_id: 'GENERIC:ACCUMULATING' },
  rule: {
    rule_id: 'R:ACCUMULATING',
    mode: WORK_MODES.SCHEDULED_OBLIGATION,
    accumulation: 'ACCUMULATING',
  },
  schedule: { eligible_now: true, missed_occurrence_count: 4 },
});
assert.equal(accumulating.kind, PROJECTION_KINDS.RECONCILE);

console.log('Atlas Work Kernel self-test passed.');
