# Atlas Work Kernel v0.1

**Status:** executable semantic contract  
**Version:** 0.1

The Work Kernel governs how durable Ledger reality may produce temporary work projections without allowing those projections to become substitutes for reality.

The governing shape is:

`durable reality + applicable rule/commitment + current knowledge → disposable work projection`

and never:

`task status → reality`

This contract exists because a cleaner Ledger container does not, by itself, prevent the failure mode where task rows become accidental authority for physical condition, completion, obligation, or current state.

## 1. Governing invariant

**Reality never derives from a task. A task derives from reality.**

A work projection may help somebody act, observe, decide, communicate, repair, or fulfill a commitment. It is not itself authoritative evidence that the underlying condition exists, remains unresolved, was completed, failed, or is overdue.

## 2. Durable versus disposable lanes

The Work Kernel must preserve the distinction between durable Ledger truth and temporary execution surfaces.

### Durable Ledger material

Durable material may include:

- subject identity and continuity;
- governing rules, cadence, thresholds, permissions, prohibitions, and requirements;
- commitments that actually exist;
- observations and their timestamps/provenance;
- historical events that actually occurred;
- established current state when supported;
- explicit `UNKNOWN` or `UNRESOLVED` current state;
- dependencies, authority, responsibility, custody, and scope.

### Disposable work projection

A work projection may include:

- an instruction or suggested action;
- an observation request;
- a present occurrence of a recurring obligation;
- an assignee or candidate executor;
- an execution deadline or target time;
- execution state such as available, assigned, blocked, or superseded.

Projection state is operational UI state. It is not the state of the underlying subject.

## 3. Normalized inputs

The kernel operates on explicit semantic inputs. It does not infer reality from industry labels or task-table conventions.

A normalized work evaluation contains, as applicable:

```json
{
  "subject": {
    "subject_id": "S-1",
    "epistemic_status": "ESTABLISHED"
  },
  "rule": {
    "rule_id": "R-1",
    "mode": "CONDITION_DRIVEN",
    "accumulation": "NON_ACCUMULATING",
    "physical_condition_authority": "OBSERVATION_ONLY"
  },
  "commitment": null,
  "current_knowledge": {
    "status": "UNKNOWN",
    "observed_at": "2026-08-31T23:55:31Z",
    "state": null
  },
  "schedule": {
    "eligible_now": true,
    "missed_occurrence_count": 4
  },
  "existing_projections": [],
  "later_authoritative_events": [],
  "assignment": null
}
```

The kernel may be given schedule calculations by a calendar/rhythm component. It does not need to reproduce all calendar arithmetic in order to enforce work semantics.

## 4. Rule modes

### CONDITION_DRIVEN

Work depends on present condition.

Examples include mowing, weeding, harvest readiness, germination state, repair need, and inspection-dependent maintenance.

If physical condition is observation-authoritative and current state is unknown, elapsed time may create **eligibility to observe** but may not establish that corrective work is required.

Allowed transition:

`cadence elapsed + current condition UNKNOWN → OBSERVE_SUBJECT`

Forbidden transition:

`cadence elapsed → subject is physically overdue/failed`

If a fresh authoritative observation establishes that action is required, the kernel may then emit a fresh action projection.

### SCHEDULED_OBLIGATION

The obligation exists because a valid schedule or commitment creates a present occurrence, not because a prior task remains open.

Examples may include daily animal care or a weekly recurring duty.

For `NON_ACCUMULATING` rules, downtime must not manufacture a historical backlog. Missed historical execution remains unknown unless evidence establishes it.

Allowed transition:

`rule active + present occurrence eligible → one current work projection`

Forbidden transition:

`21 days of unavailable writeback → 21 invented overdue task instances`

A rule may explicitly declare `ACCUMULATING` only when the obligation itself genuinely accumulates. Accumulation must be part of the rule, never inferred from missed task rows.

### OBSERVATION_REQUIRED

The durable truth is that a material fact is unknown and a current observation may be needed.

An observation request is a knowledge-acquisition projection, not evidence that an operator failed to perform work.

If the subject or question is no longer relevant, the projection may be retired while the historical unknown/request remains preserved as provenance.

### COMMITMENT_DRIVEN

A real commitment, dependency, approval, promise, order, booking, or other obligation may create work.

The commitment is durable. The work card is its temporary execution projection.

If the commitment is fulfilled, cancelled, superseded, or shown not to exist, projections must reconcile against that durable change.

## 5. Projection result types

The v0.1 kernel may return one of:

- `NO_WORK` — no current projection is warranted;
- `OBSERVE_SUBJECT` — current reality must be observed before action can be lawfully derived;
- `PERFORM_ACTION` — current evidence establishes a present action candidate;
- `FULFILL_OCCURRENCE` — one present scheduled occurrence exists;
- `ACQUIRE_KNOWLEDGE` — an unresolved fact remains materially relevant;
- `FULFILL_COMMITMENT` — a durable commitment currently requires execution;
- `RECONCILE` — contradictory or incomplete durable state prevents safe work derivation.

These are projection semantics, not ontology labels for the subject.

## 6. Non-negotiable invariants

### 6.1 Time does not create physical truth

Time may create eligibility, expectation, or a need to inspect. It does not establish physical condition unless the governing reality itself is purely temporal.

### 6.2 Missing writeback creates uncertainty

When reliable observation/writeback stops, the kernel must preserve the last observed state and represent present state as `UNKNOWN` when no later evidence exists.

It may not silently convert missing updates into failure, incompletion, or overdue physical condition.

### 6.3 Assignment failure is execution failure only

If assignment fails because an account, membership, permission, carrier, or UI is unavailable, the underlying subject and durable obligation remain unchanged.

`assignment failure ≠ subject failure`

### 6.4 Projection status is never subject authority

`open`, `blocked`, `assigned`, `overdue`, `done`, `archived`, or similar projection states may not by themselves establish the state of the subject or commitment.

### 6.5 Completion must produce durable evidence

Completing work may only affect durable reality through an explicit resulting event, observation, or governed state transition.

`task marked done` alone is insufficient.

### 6.6 Later authoritative reality supersedes stale projections

If a later observation, event, or adjudicated state resolves the condition that produced an earlier projection, the old projection becomes superseded/retired execution history.

It does not survive merely because its own status field was never changed.

### 6.7 Downtime does not imply backlog

For non-accumulating recurring work, resume from the present lawful occurrence. Historical missed occurrences are not invented.

### 6.8 Knowledge work remains knowledge work

An unanswered observation request means the fact remains unknown. It does not automatically mean the human operator failed an operational obligation.

### 6.9 Reprojection is idempotent

Given the same durable inputs and evaluation time, the kernel must derive materially the same projection identity and semantics.

Repeated evaluation must not multiply equivalent work.

### 6.10 Carrier replacement must not alter meaning

The same durable Ledger state must produce materially equivalent work whether surfaced through a web app, mobile client, AI carrier, FileStore-backed test, or later Supabase-backed service.

## 7. Projection identity

A work projection should be deterministically identifiable from the durable basis that justifies it, for example:

`subject + governing rule/commitment + present occurrence/observation basis + projection kind`

The projection ID must not depend on a random UI render or retry.

If the durable basis changes materially, a new projection may replace the old one.

## 8. Completion and state transition

A lawful completion flow is:

`projection → execution → evidence/event/observation → governed durable transition → reprojection`

Examples:

- mowing projection completed → `MOWING_OCCURRED` event with subject/time/provenance;
- inspection completed → observation with condition and observed_at;
- contact projection completed → contact event/outcome;
- payment projection completed → payment evidence/event;
- repair projection completed → repair event plus restored-state verification when required.

The kernel then re-evaluates from the new durable state. It does not keep the completed projection as the authoritative current record.

## 9. Supersession

A projection is stale when its durable basis is no longer current.

Examples:

- later mowing event after an older blocked mowing card;
- later completed weeding occurrence after an older blocked occurrence in the same subject/rule sequence;
- commitment cancellation after a call task was generated;
- current observation showing acceptable condition after an inspection/mowing candidate existed.

Supersession must be explainable by durable evidence refs.

## 10. Acceptance cases from the Elm recovery

The Work Kernel is not acceptable until it can represent all of the following without importing old task-table mistakes.

### Case A — mowing after observability interruption

Given:

- a valid mowing rule;
- last physical observation before the writeback interruption;
- a clock that continued evaluating;
- present physical condition unknown;

Then:

- the kernel may emit `OBSERVE_SUBJECT`;
- it must not emit `PERFORM_ACTION` solely because time elapsed;
- it must not call the grass physically overdue.

### Case B — old blocked weeding card plus later completion evidence

Given:

- an older blocked execution projection;
- a later authoritative completion/event for the same governed work sequence;

Then:

- the older projection is superseded execution history;
- it cannot remain a current obligation simply because its status was never updated.

### Case C — crop-count observation request

Given:

- a material crop fact is unknown;
- an old task requested a stand count;
- no result was captured;

Then:

- durable state remains `UNKNOWN`;
- if the crop still exists and the fact matters, emit a fresh `ACQUIRE_KNOWLEDGE` projection;
- otherwise emit `NO_WORK` and retain provenance;
- never infer operator failure from the unanswered task.

### Case D — daily chicken care after downtime

Given:

- a valid non-accumulating daily rule;
- a writeback outage covering many occurrences;
- the current occurrence is eligible now;

Then:

- emit at most one present `FULFILL_OCCURRENCE` projection;
- do not generate the missed historical occurrences as backlog;
- historical performance remains unknown unless separately evidenced.

### Case E — failed assignment

Given:

- a valid current work projection;
- assignment fails because the intended membership is inactive;

Then:

- projection execution state may become unassigned/blocked;
- subject state, observation state, and durable obligation must remain unchanged.

## 11. Migration consequence

Foundry migration must not copy legacy tasks into a Ledger as durable current work.

For each legacy task family, migration must recover whichever durable basis actually exists:

- rule;
- commitment;
- subject;
- observation;
- event;
- unknown fact;
- historical execution record;
- or nothing still operative.

Only after current reality is reconciled may the Work Kernel generate new projections.

## Governing statement

**Ledger preserves reality, law, evidence, history, and uncertainty. The Work Kernel projects the smallest present action surface justified by that durable state. Tasks are disposable. Reality is not.**
