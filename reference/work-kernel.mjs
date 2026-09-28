import { createHash } from 'node:crypto';

export const WORK_MODES = Object.freeze({
  CONDITION_DRIVEN: 'CONDITION_DRIVEN',
  SCHEDULED_OBLIGATION: 'SCHEDULED_OBLIGATION',
  OBSERVATION_REQUIRED: 'OBSERVATION_REQUIRED',
  COMMITMENT_DRIVEN: 'COMMITMENT_DRIVEN',
});

export const PROJECTION_KINDS = Object.freeze({
  NO_WORK: 'NO_WORK',
  OBSERVE_SUBJECT: 'OBSERVE_SUBJECT',
  PERFORM_ACTION: 'PERFORM_ACTION',
  FULFILL_OCCURRENCE: 'FULFILL_OCCURRENCE',
  ACQUIRE_KNOWLEDGE: 'ACQUIRE_KNOWLEDGE',
  FULFILL_COMMITMENT: 'FULFILL_COMMITMENT',
  RECONCILE: 'RECONCILE',
});

const KNOWN = 'KNOWN';
const UNKNOWN = 'UNKNOWN';
const NON_ACCUMULATING = 'NON_ACCUMULATING';

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function stableProjectionId(basis) {
  const digest = createHash('sha256').update(canonical(basis)).digest('hex').slice(0, 16);
  return `WK:${digest}`;
}

function requireObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
}

function normalizeInput(input) {
  requireObject(input, 'input');
  requireObject(input.subject, 'subject');
  if (!input.subject.subject_id) throw new Error('subject.subject_id is required');
  if (!input.as_of) throw new Error('as_of is required');

  const normalized = clone(input);
  normalized.subject.relevant = normalized.subject.relevant !== false;
  normalized.existing_projections = Array.isArray(normalized.existing_projections)
    ? normalized.existing_projections
    : [];
  normalized.later_authoritative_events = Array.isArray(normalized.later_authoritative_events)
    ? normalized.later_authoritative_events
    : [];
  return normalized;
}

function noWork(input, reason, basis = {}) {
  return {
    kind: PROJECTION_KINDS.NO_WORK,
    projection_id: null,
    subject_id: input.subject.subject_id,
    reason,
    durable_basis: clone(basis),
    creates_backlog: false,
  };
}

function projection(input, kind, reason, basis, extra = {}) {
  const durableBasis = {
    subject_id: input.subject.subject_id,
    kind,
    ...clone(basis),
  };

  return {
    kind,
    projection_id: stableProjectionId(durableBasis),
    subject_id: input.subject.subject_id,
    reason,
    durable_basis: durableBasis,
    execution_state: 'AVAILABLE',
    creates_backlog: false,
    ...clone(extra),
  };
}

function reconcile(input, reason, basis = {}) {
  return projection(input, PROJECTION_KINDS.RECONCILE, reason, basis);
}

function deriveConditionDriven(input) {
  const { rule, current_knowledge: knowledge = {}, schedule = {} } = input;
  requireObject(rule, 'rule');
  if (!rule.rule_id) throw new Error('rule.rule_id is required');

  if (knowledge.status === UNKNOWN) {
    if (schedule.eligible_now || rule.require_current_observation === true) {
      return projection(
        input,
        PROJECTION_KINDS.OBSERVE_SUBJECT,
        'Current physical condition is unknown; elapsed time may justify observation but cannot establish required corrective work.',
        {
          rule_id: rule.rule_id,
          observed_at: knowledge.observed_at ?? null,
          schedule_occurrence_key: schedule.occurrence_key ?? null,
        },
        {
          physical_condition_authority: rule.physical_condition_authority ?? null,
          time_claims_physical_condition: false,
        },
      );
    }
    return noWork(input, 'Current condition is unknown, but no present observation trigger is established.', {
      rule_id: rule.rule_id,
    });
  }

  if (knowledge.status !== KNOWN) {
    return reconcile(input, 'Current knowledge status is neither KNOWN nor UNKNOWN.', {
      rule_id: rule.rule_id,
      knowledge_status: knowledge.status ?? null,
    });
  }

  if (knowledge.action_required === true) {
    return projection(
      input,
      PROJECTION_KINDS.PERFORM_ACTION,
      'A current authoritative observation establishes that action is required.',
      {
        rule_id: rule.rule_id,
        observation_id: knowledge.observation_id ?? null,
        observed_at: knowledge.observed_at ?? null,
        state: knowledge.state ?? null,
      },
      { action_key: rule.action_key ?? null },
    );
  }

  if (knowledge.action_required === false) {
    return noWork(input, 'Current authoritative observation does not require action.', {
      rule_id: rule.rule_id,
      observation_id: knowledge.observation_id ?? null,
    });
  }

  return reconcile(input, 'Known current state does not say whether governed action is required.', {
    rule_id: rule.rule_id,
    observation_id: knowledge.observation_id ?? null,
  });
}

function deriveScheduled(input) {
  const { rule, schedule = {} } = input;
  requireObject(rule, 'rule');
  if (!rule.rule_id) throw new Error('rule.rule_id is required');

  if (rule.accumulation && rule.accumulation !== NON_ACCUMULATING) {
    return reconcile(input, 'Accumulating obligations require explicit durable occurrence identities; v0.1 will not infer them from elapsed time.', {
      rule_id: rule.rule_id,
      accumulation: rule.accumulation,
    });
  }

  if (!schedule.eligible_now) {
    return noWork(input, 'No present scheduled occurrence is eligible.', {
      rule_id: rule.rule_id,
      occurrence_key: schedule.occurrence_key ?? null,
    });
  }

  return projection(
    input,
    PROJECTION_KINDS.FULFILL_OCCURRENCE,
    'One present non-accumulating scheduled occurrence is eligible; missed historical intervals are not materialized as backlog.',
    {
      rule_id: rule.rule_id,
      occurrence_key: schedule.occurrence_key ?? input.as_of,
    },
    {
      missed_occurrence_count: Number.isInteger(schedule.missed_occurrence_count)
        ? schedule.missed_occurrence_count
        : 0,
      backlog_projection_count: 0,
      action_key: rule.action_key ?? null,
    },
  );
}

function deriveObservation(input) {
  const { current_knowledge: knowledge = {}, knowledge_requirement: requirement = {} } = input;

  if (input.subject.relevant === false || requirement.relevant === false) {
    return noWork(input, 'The subject or knowledge requirement is no longer relevant.', {
      requirement_id: requirement.requirement_id ?? null,
    });
  }

  if (knowledge.status === KNOWN) {
    return noWork(input, 'The required fact is already known.', {
      requirement_id: requirement.requirement_id ?? null,
      observation_id: knowledge.observation_id ?? null,
    });
  }

  if (knowledge.status !== UNKNOWN) {
    return reconcile(input, 'Knowledge requirement cannot be evaluated safely from the supplied epistemic status.', {
      requirement_id: requirement.requirement_id ?? null,
      knowledge_status: knowledge.status ?? null,
    });
  }

  if (requirement.material === false) {
    return noWork(input, 'The unknown fact is not material to current operation.', {
      requirement_id: requirement.requirement_id ?? null,
    });
  }

  return projection(
    input,
    PROJECTION_KINDS.ACQUIRE_KNOWLEDGE,
    'A material fact remains unknown and still requires a current observation.',
    {
      requirement_id: requirement.requirement_id ?? null,
      last_requested_at: requirement.last_requested_at ?? null,
    },
    { operator_failure_inferred: false },
  );
}

function deriveCommitment(input) {
  const { commitment } = input;
  requireObject(commitment, 'commitment');
  if (!commitment.commitment_id) throw new Error('commitment.commitment_id is required');

  if (['FULFILLED', 'CANCELLED', 'SUPERSEDED', 'RETIRED'].includes(commitment.status)) {
    return noWork(input, `Commitment is ${commitment.status.toLowerCase()}; no present execution projection is justified.`, {
      commitment_id: commitment.commitment_id,
      status: commitment.status,
    });
  }

  if (commitment.status !== 'ACTIVE') {
    return reconcile(input, 'Commitment status is unresolved for work derivation.', {
      commitment_id: commitment.commitment_id,
      status: commitment.status ?? null,
    });
  }

  if (commitment.requires_action === false) {
    return noWork(input, 'Active commitment currently requires no action.', {
      commitment_id: commitment.commitment_id,
    });
  }

  if (commitment.requires_action !== true) {
    return reconcile(input, 'Active commitment does not establish whether present action is required.', {
      commitment_id: commitment.commitment_id,
    });
  }

  return projection(
    input,
    PROJECTION_KINDS.FULFILL_COMMITMENT,
    'An active durable commitment currently requires execution.',
    {
      commitment_id: commitment.commitment_id,
      commitment_version: commitment.version ?? null,
    },
    { action_key: commitment.action_key ?? null },
  );
}

export function deriveWorkProjection(rawInput) {
  const input = normalizeInput(rawInput);
  if (input.subject.relevant === false) {
    return noWork(input, 'Subject is no longer relevant to the operating field.');
  }

  const mode = input.rule?.mode ?? input.mode;
  switch (mode) {
    case WORK_MODES.CONDITION_DRIVEN:
      return deriveConditionDriven(input);
    case WORK_MODES.SCHEDULED_OBLIGATION:
      return deriveScheduled(input);
    case WORK_MODES.OBSERVATION_REQUIRED:
      return deriveObservation(input);
    case WORK_MODES.COMMITMENT_DRIVEN:
      return deriveCommitment(input);
    default:
      return reconcile(input, 'No supported work mode is established.', { mode: mode ?? null });
  }
}

export function reconcileProjection(projectionRecord, durableEvents = []) {
  requireObject(projectionRecord, 'projection');
  if (!projectionRecord.projection_id) throw new Error('projection.projection_id is required');

  const matching = (Array.isArray(durableEvents) ? durableEvents : [])
    .filter((event) => event && typeof event === 'object')
    .find((event) => {
      if (Array.isArray(event.resolves_projection_ids) && event.resolves_projection_ids.includes(projectionRecord.projection_id)) {
        return true;
      }
      const sameSubject = event.subject_id && event.subject_id === projectionRecord.subject_id;
      const ruleId = projectionRecord.durable_basis?.rule_id;
      const sameRule = !ruleId || !event.rule_id || event.rule_id === ruleId;
      return sameSubject && sameRule && ['SATISFIES', 'CONDITION_ACCEPTABLE', 'COMMITMENT_CLOSED'].includes(event.effect);
    });

  if (!matching) {
    return {
      status: 'CURRENT_PROJECTION',
      projection: clone(projectionRecord),
      superseded_by: null,
    };
  }

  return {
    status: 'SUPERSEDED_PROJECTION',
    projection: {
      ...clone(projectionRecord),
      execution_state: 'SUPERSEDED',
    },
    superseded_by: matching.event_id ?? matching.observation_id ?? null,
  };
}

export function applyAssignmentFailure(projectionRecord, failure) {
  requireObject(projectionRecord, 'projection');
  requireObject(failure, 'failure');

  return {
    projection: {
      ...clone(projectionRecord),
      execution_state: 'UNASSIGNED',
      assignment_failure: {
        code: failure.code ?? null,
        message: failure.message ?? null,
      },
    },
    durable_effect: null,
  };
}

export function completeProjection(projectionRecord, resultEvent) {
  requireObject(projectionRecord, 'projection');
  requireObject(resultEvent, 'result_event');
  if (!resultEvent.event_id) throw new Error('result_event.event_id is required');
  if (!resultEvent.event_type) throw new Error('result_event.event_type is required');
  if (!resultEvent.occurred_at) throw new Error('result_event.occurred_at is required');

  return {
    projection: {
      ...clone(projectionRecord),
      execution_state: 'COMPLETED',
    },
    durable_event: clone(resultEvent),
    note: 'The durable event, not the task status, is the evidence available to later reality transitions.',
  };
}

export function workProjectionSignature(projectionRecord) {
  requireObject(projectionRecord, 'projection');
  return canonical({
    kind: projectionRecord.kind,
    projection_id: projectionRecord.projection_id,
    subject_id: projectionRecord.subject_id,
    durable_basis: projectionRecord.durable_basis ?? null,
  });
}
