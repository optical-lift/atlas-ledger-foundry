# Foundry Readiness Engine v0.1

**Status:** governing readiness policy  
**Version:** 0.1

Readiness is a service judgment over workspace state. It is not a confidence score supplied by an AI carrier and it is not a count of how many records exist.

A workspace is ready only when Atlas could receive the sealed candidate without reconstructing a material part of the field before operating it.

## 1. Readiness result

`run_readiness_check` returns:

- `ready: true|false`;
- `blockers`;
- `warnings`;
- `non_blocking_unknowns`;
- `recommended_next_work`;
- `evaluated_protocol_version`;
- `evaluated_at` where supported.

Every blocker should reference stable workspace records where possible.

## 2. Hard gates

A workspace is **not ready** if any of these conditions are true.

### Boundary gate

`boundary_status` is not `SUFFICIENTLY_BOUNDED`.

### Closure gate

Any material closure record is `KNOWN_INCOMPLETE`, `UNRESOLVED`, or `NOT_YET_RECONCILED`. Absence of a required material closure record is a blocker.

A material collection marked `CLOSED_COMPLETE` must have any required reality-to-record inverse completeness check.

### Unknown gate

Any open unknown has `blocking: true`.

### Contradiction gate

Any open contradiction has `blocking: true`.

### Discrepancy gate

Any open discrepancy has `blocking: true`.

A non-blocking discrepancy remains visible as a warning until resolved/non-material/superseded.

### Signal gate

Any `DETECTED` or `VALIDATED` signal with `blocking: true` remains a blocker until refuted, superseded, or lawfully resolved into other structure.

### Adjudication gate

A consequential adjudication case remains `OPEN`, `INTERPRETING`, or `ADJUDICATING`, or a disposition remains `REQUIRES_CONFIRMATION` / `REQUIRES_ESCALATION`.

Readiness may not bypass unfinished answer-processing merely because the current projection looks coherent.

### Dependency-impact gate

Any dependency impact marked blocking and not `UNAFFECTED` remains unresolved.

A changed premise cannot be sealed while a critical dependent assertion is known to require review.

### Topology gate

Any Ledger candidate whose unresolved classification could duplicate, split, or misassign governing truth remains unresolved and blocking.

### Provenance gate

Any materially consequential `ESTABLISHED` assertion lacks valid preserved basis.

### Authority gate

Material action/decision/commitment paths lack sufficient authority or responsibility semantics.

### Transition gate

A material state-changing process cannot be interpreted because trigger, condition, consequence, or exception semantics are missing.

### Current-position gate

A material current condition required for operation is absent, stale beyond an accepted bound, or conflicted.

### Acceptance gate

A required acceptance case is `FAIL`, `UNRESOLVED`, or `NOT_RUN`.

## 3. Non-blocking conditions

The following may remain when explicitly represented and adjudicated non-blocking:

- low-materiality historical uncertainty;
- unresolved detail that does not affect current authority/state/boundary/commitment/consequence;
- future information that cannot yet exist;
- known unknowns with a safe observation path;
- unresolved external reality that does not change this Ledger's jurisdiction;
- non-blocking discrepancies/signals/dependency reviews carried as warnings with explicit follow-up paths.

## 4. Warnings

Warnings may include approaching staleness, single-source high-materiality claims, narrow acceptance coverage, external dependencies likely to change, low-materiality identity questions, open non-blocking discrepancies/signals, or dependency rechecks.

Warnings are not hidden readiness failures.

## 5. Required material domains

Required domains derive from the actual field, not a universal business questionnaire.

A domain is material when its absence could make Atlas misinterpret identity/continuity, boundary/jurisdiction, authority/responsibility, current state, commitment, dependency/capacity, state transition, consequence, custody, verification, or a consequential adjudication path.

## 6. Standing law and current position

Readiness requires sufficient separation among what governs normally/conditionally, what is actually true now, and what event changed or may change the state.

## 7. Provenance sufficiency

Material established assertions need lawful traceable basis: preserved testimony/source evidence, governed human confirmation, documented derivation, or governed reconciliation.

AI plausibility or repeated paraphrase is not provenance.

## 8. Readiness is conditional on current reality

A workspace that once passed may later fail when new testimony introduces a contradiction/discrepancy/signal, dependency review reopens structure, state changes, topology changes, a non-blocking unknown becomes material, an acceptance case fails, or protocol compatibility changes.

A previous passing check does not grant permanent seal authority.

## 9. Recommended next work

When not ready, recommend the smallest work set that can remove blockers, preferring reality-corruption/authority risks, blocking contradictions/discrepancies/unknowns/signals, unfinished adjudication, dependency impact, topology, authority, transitions, closure, current position, acceptance, then provenance repair.

Question Selection asks **what should we learn next?**

Answer Processing asks **what consequences are justified by what we just learned?**

Readiness asks **is the field sufficiently reconciled to seal?**

## 10. Seal invariant

`request_seal` re-runs readiness against the current workspace version. A stale passing result cannot seal a changed workspace.
