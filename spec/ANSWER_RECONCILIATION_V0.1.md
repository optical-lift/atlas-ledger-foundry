# Foundry Interpretation, Adjudication, and Structural Delta v0.1

**Status:** governing answer-processing contract  
**Version:** 0.1

Foundry does not treat a new human answer as replacement truth. A preserved answer enters:

`preserved testimony → case → interpretation → adjudication → dependency review → structural delta`

## 1. Invariants

1. **Difference is not error.** New information that differs from current representation first becomes a discrepancy unless the lawful relationship is already clear.
2. **Signal is not assertion.** Weak indications may justify investigation without supporting a proposition.
3. **Interpretation is not adjudication.** A carrier proposes meaning; governed adjudication decides allowed consequences.
4. **Adjudication never erases evidence.** Losing evidence and superseded structure remain traceable.
5. **One answer may have many effects.** It may confirm, narrow, contradict, open unknowns/signals, and reopen dependent structure simultaneously.
6. **No change is explicit.** Processed testimony that changes no structure receives `NO_CHANGE` plus a reason.
7. **Changed premises propagate review.** Foundry asks what depended on the changed thing.
8. **More explicit unknowns can be progress.** Structural gain is not unknown-count reduction.

## 2. Case

A `CASE` groups one consequential answer-processing episode:

- origin testimony/source refs;
- question/operator context;
- findings;
- discrepancies;
- signals;
- competing interpretations;
- dispositions;
- dependency impacts;
- structural delta;
- residual issues;
- closure basis.

It answers: **Why did Foundry reopen/change this part of reality, and what was decided?**

## 3. Interpretation

Interpretation asks:

> What structural information could this preserved testimony contain?

A carrier may propose observations, assertions, events/transitions, rules, states, relationships, authorities, responsibilities, commitments, boundaries, identities, discrepancies, signals, competing interpretations, unknowns, contradictions, topology implications, signposts, and dependency roots.

Interpretation proposals do not directly mutate durable truth.

## 4. Discrepancy

A `DISCREPANCY` records a material difference between new evidence/interpretation and current representation without deciding which side is wrong.

Kinds include:

`VALUE_DIFFERENCE`, `SCOPE_DIFFERENCE`, `TEMPORAL_DIFFERENCE`, `IDENTITY_DIFFERENCE`, `AUTHORITY_DIFFERENCE`, `STATE_DIFFERENCE`, `RULE_DIFFERENCE`, `COMPLETENESS_DIFFERENCE`, `PROVENANCE_DIFFERENCE`, `OTHER`.

A discrepancy may later resolve as correction, scoped coexistence, temporal change, exception, contradiction, non-material difference, or no change.

## 5. Signal

A `SIGNAL` records an indication that reality may have changed or deserves investigation when evidence is insufficient for an assertion.

Lifecycle:

`DETECTED → VALIDATED | REFUTED | SUPERSEDED`

Validation means the signal warrants further structural work; it does not itself establish the underlying proposition.

## 6. Competing interpretations

When multiple structures fit current evidence, preserve them explicitly. Each interpretation should identify claim, basis, conflicting basis, and a discriminator: what observation would separate it from alternatives.

Unresolved competing interpretations normally feed `DISCRIMINATE`.

## 7. Adjudication

Adjudication asks:

> Given workspace state, evidence, authority, materiality, and risk, what is each proposed consequence lawfully allowed to do?

### Disposition registry

- `CONFIRM`
- `SUPERSEDE`
- `CORRECT`
- `SCOPE`
- `TEMPORALIZE`
- `CONDITIONALIZE`
- `SPLIT`
- `MERGE`
- `OPEN_UNKNOWN`
- `RESOLVE_UNKNOWN`
- `PARTIALLY_RESOLVE`
- `OPEN_CONTRADICTION`
- `RESOLVE_CONTRADICTION`
- `OPEN_DISCREPANCY`
- `RESOLVE_DISCREPANCY`
- `OPEN_SIGNAL`
- `VALIDATE_SIGNAL`
- `REFUTE_SIGNAL`
- `REQUEST_MORE_EVIDENCE`
- `ESCALATE`
- `NO_CHANGE`
- `REOPEN`

Every disposition records type, reason code, human-readable reason, basis refs, affected refs, adjudication authority, status, and resulting refs where applicable.

AI recommendation alone is not principal confirmation.

## 8. Reason-code registry

Core reason codes:

`NEW_INFORMATION`, `SCOPE_CLARIFIED`, `TEMPORAL_CHANGE`, `IDENTITY_SPLIT`, `IDENTITY_MERGE`, `AUTHORITY_CLARIFIED`, `SOURCE_CORRECTED`, `EXCEPTION_DISCOVERED`, `RULE_NOT_CURRENT`, `DUPLICATE_REPRESENTATION`, `CONTRADICTED_BY_HIGHER_AUTHORITY`, `INSUFFICIENT_EVIDENCE`, `NON_MATERIAL_DIFFERENCE`, `ALREADY_REPRESENTED`, `DEPENDENCY_INVALIDATED`, `DEPENDENCY_NEEDS_REVIEW`, `USER_CORRECTION`, `NO_STRUCTURAL_EFFECT`, `OTHER`.

Reason codes support consistent machine handling but never replace a human-readable explanation.

## 9. Conservative versus truth-changing effects

The service may authorize conservative effects that make uncertainty/custody explicit without pretending truth, including:

- `OPEN_UNKNOWN`;
- `OPEN_CONTRADICTION`;
- `OPEN_DISCREPANCY`;
- `OPEN_SIGNAL`;
- `REQUEST_MORE_EVIDENCE`;
- `ESCALATE` as a required higher evidence path;
- `NO_CHANGE`.

Truth-changing effects require lawful confirmation/adjudication authority, including confirmation/correction/supersession, scoping/temporalization/conditionalization, split/merge, resolution of uncertainty/conflict/discrepancy/signal, and reopening established dependent structure.

## 10. Dependency impact

When a materially consequential established assertion is corrected, superseded, scoped, temporalized, conditionalized, split, merged, reopened, or materially weakened, inspect descendants that depend on it.

Possible outcomes:

`UNAFFECTED`, `RECHECK_REQUIRED`, `REOPEN`, `SUPERSEDE`, `BLOCKED_PENDING_PARENT`.

Do not automatically declare every descendant false. Determine whether sufficient independent basis remains.

## 11. Structural delta

Structural Delta records the lawful result of adjudication without replacing the workspace.

It may contain records added/confirmed/superseded/reopened/scoped/temporalized/conditionalized; unknowns/contradictions/discrepancies/signals opened or resolved; dependency impacts; signposts; explicit no-change; and residual gaps.

`REQUEST_MORE_EVIDENCE` must leave a residual work item. An authorized request for evidence is not completion.

## 12. Structural gain

Structural gain means **increase in explicit, correctly distinguished structure relative to dangerous ambiguity**.

Useful dimensions include:

- dangerous ambiguity reduced;
- distinctions made explicit;
- unsupported certainty removed;
- provenance strengthened;
- scope/time/condition clarified;
- competing models separated;
- dependency risk exposed;
- refresh/signpost learned;
- closure made more truthful;
- residual uncertainty made explicit.

A vague claim decomposed into three explicit unknowns may be substantial positive gain.

## 13. No-change rule

If testimony produces no structural change, record `NO_CHANGE` with a reason such as `ALREADY_REPRESENTED`, `NON_MATERIAL_DIFFERENCE`, `INSUFFICIENT_EVIDENCE`, or `NO_STRUCTURAL_EFFECT`.

Silence is not a disposition.

## 14. High-consequence adjudication

Critical authority, identity, boundary, commitment, provenance, or other high-consequence changes may require `ESCALATE`, original evidence, authoritative custodian confirmation, independent corroboration, or explicit principal/governed adjudication.

## 15. Complete loop

`question → preserved answer → case → interpretation plan → discrepancies/signals/competing models → adjudication → dependency impact → structural delta → residual gap → next question`

Question Selection operates on the resulting durable state, not model memory.
