# Foundry Readiness Engine v0.1

**Status:** governing readiness policy  
**Version:** 0.1

Readiness is a service judgment over workspace state. It is not a confidence score supplied by an AI carrier and it is not a count of how many records exist.

A workspace is ready only when Atlas could receive the sealed candidate without having to reconstruct a material part of the field before operating it.

## 1. Readiness result

`run_readiness_check` returns:

- `ready: true|false`;
- `blockers`;
- `warnings`;
- `non_blocking_unknowns`;
- `recommended_next_work`;
- `evaluated_protocol_version`;
- `evaluated_at`.

The engine must explain every blocker using stable workspace references where possible.

## 2. Hard gates

A workspace is **not ready** if any of these conditions are true.

### Boundary gate

`boundary_status` is not `SUFFICIENTLY_BOUNDED`.

### Closure gate

Any material closure record is `KNOWN_INCOMPLETE`, `UNRESOLVED`, or `NOT_YET_RECONCILED`. Absence of a required material closure record is itself a blocker.

For a material collection, `CLOSED_COMPLETE` is not sufficient when completeness has only been checked from represented records outward. Where an inverse check is possible, Foundry must also test from reality back toward the representation (`INVERT`) before relying on complete closure.

### Unknown gate

Any open unknown has `blocking: true`.

### Contradiction gate

Any open contradiction has `blocking: true`.

### Topology gate

Any Ledger candidate whose unresolved classification could duplicate, split, or misassign governing truth remains unresolved and blocking.

### Provenance gate

Any materially consequential `ESTABLISHED` assertion lacks a valid preserved basis.

### Verification / escalation gate

A critical assertion explicitly marked as requiring governed verification or elevated evidence has not yet satisfied that requirement.

High consequence changes the evidence threshold, not merely the number of questions asked.

### Authority gate

Material action/decision/commitment paths lack sufficient authority or responsibility semantics to interpret who may act and who may decide.

### Transition gate

A material state-changing process cannot be interpreted because trigger, condition, consequence, or exception semantics are missing.

### Current-position gate

A material current condition required for operation is absent, stale beyond an accepted bound, or still conflicted.

### Acceptance gate

A required acceptance case is `FAIL`, `UNRESOLVED`, or `NOT_RUN`.

## 3. Non-blocking conditions

The following may remain when explicitly represented and adjudicated as non-blocking: low-materiality historical uncertainty, unresolved detail that does not affect current authority/state/boundary/commitment/consequence, future information that cannot yet exist, known unknowns with a safe observation path, and unresolved external reality that does not change this Ledger's jurisdiction.

These remain visible in `non_blocking_unknowns`.

## 4. Warnings

Warnings may include assertions approaching staleness, reliance on a single source for a high-materiality claim, narrow acceptance coverage, external dependencies likely to change, low-materiality identity questions, or a material established fact for which no useful future `SIGNPOST` has yet been identified.

Warnings are not hidden readiness failures unless the governing field makes the missing maintenance trigger materially unsafe.

## 5. Required material domains

The engine must not assume a universal business questionnaire. Required domains derive from the actual field.

A domain is material when its absence could make Atlas misinterpret identity/continuity, boundary/jurisdiction, authority/responsibility, current state, commitment, dependency/capacity, state transition, consequence, custody, or verification.

`GATE` questions may establish that a potential domain is not applicable. That explicit result is different from a domain never having been considered.

## 6. Standing law and current position

Readiness requires enough separation between what normally/conditionally governs the field, what is actually true now, and what event changed or may change the state.

If a consequential assertion cannot be classified among these without ambiguity, readiness fails until reconciled or explicitly shown non-blocking.

A normal rule should also have exceptions represented when known and material; absence of an exception record does not prove that no exception exists.

## 7. Provenance sufficiency

For material established assertions, at least one lawful basis must remain traceable: preserved testimony, preserved source evidence, governed human confirmation, documented derivation from established assertions, or a governed reconciliation event.

AI plausibility or repeated paraphrase is not provenance.

`TRACE`, `VERIFY`, and `ESCALATE` are the primary operators for repairing insufficient basis.

## 8. Completeness sufficiency

Existence and completeness are separate readiness concerns.

A collection can contain only valid records and still be incomplete.

For material collections, readiness must therefore preserve evidence of both directions when applicable:

1. represented members were validated against reality;
2. Foundry checked whether materially relevant real members could be missing from the representation.

The second direction is the `INVERT` check.

## 9. Readiness is conditional on current reality

A workspace that once passed may later fail when new testimony introduces a contradiction, current state changes, a Ledger boundary changes, a formerly non-blocking unknown becomes material, an acceptance case reveals missing law, or protocol compatibility changes.

A previous passing check does not grant permanent seal authority.

Where a material fact has an observable change trigger, `SIGNPOST` lets ongoing Atlas re-evaluate on evidence rather than re-asking the entire baseline periodically.

## 10. Recommended next work

When `ready: false`, recommend the smallest work set that could remove blockers, preferring corruption/provenance risk, blocking contradiction, blocking unknown, topology, authority, transition, completeness/closure, current position, acceptance, then other provenance repair.

Question Selection asks **what should we learn next?**

Question Operators ask **how should we ask so the answer changes the structure most efficiently?**

Readiness asks **is the field sufficiently reconciled to seal?**

These judgments remain distinct.

## 11. Seal invariant

`request_seal` must re-run readiness against the current workspace version.

A stale passing result cannot seal a changed workspace. The seal records the exact workspace version/checkpoint and readiness result used to authorize release creation.
