# Foundry Interpretation, Adjudication, and Structural Delta v0.1

**Status:** governing answer-processing contract  
**Version:** 0.1

Foundry does not treat a new human answer as a replacement truth record. A preserved answer enters a governed three-stage process:

`preserved testimony → interpretation → adjudication → structural delta`

The purpose of this layer is to convert new evidence into safer, more explicit structure without allowing an AI carrier to overwrite current Foundry state merely because a new sentence sounds more recent or more plausible.

## 1. Governing principles

1. **Difference is not error.** A new answer that differs from existing state first creates a discrepancy or competing interpretation unless the lawful relationship is already clear.
2. **Signal is not assertion.** Weak or incomplete indications may justify investigation without supporting a proposition.
3. **Interpretation is not adjudication.** A carrier may propose what testimony could mean. Governed adjudication determines what consequences are allowed.
4. **Adjudication is not history erasure.** Losing evidence, superseded assertions, contradictions, and prior states remain traceable.
5. **One answer may have many effects.** It may confirm one fact, narrow another, reveal a contradiction, open an unknown, create a signal, and reopen dependent structure at the same time.
6. **No change is an explicit disposition.** Processed testimony that does not alter structure receives a reason rather than disappearing silently.
7. **Changed premises propagate review.** When an established assertion changes, Foundry checks materially dependent assertions rather than patching only the local record.
8. **More explicit unknowns can be progress.** Structural gain is not measured by minimizing unresolved-record count.

## 2. Case container

Every consequential answer-processing episode may open or join a `CASE`.

A case groups:

- origin testimony/source references;
- active question/operator context;
- findings;
- discrepancies;
- signals;
- competing interpretations;
- proposed adjudications;
- dependency impacts;
- dispositions;
- resulting structural delta;
- residual issues;
- case status and closure basis.

A case answers: **Why did Foundry reopen or change this part of reality, and what was ultimately decided?**

A case is not an Atlas Ledger and does not create canonical Atlas Reality.

## 3. Stage one — Interpretation

Interpretation asks:

> What structural information could this preserved testimony contain?

The carrier may propose:

- observations;
- candidate assertions;
- candidate events or transitions;
- candidate rules, boundaries, authorities, responsibilities, commitments, states, identities, or relations;
- discrepancies against current established structure;
- signals requiring investigation;
- competing interpretations;
- candidate unknowns;
- candidate contradictions;
- candidate Ledger-topology implications;
- candidate signposts;
- candidate dependency impacts.

Interpretation outputs are proposals. They do not directly mutate assertion stage, closure, topology, or lifecycle state.

## 4. Discrepancy

A `DISCREPANCY` records a material difference between new evidence/interpretation and current representation without deciding which side is wrong.

Typical discrepancy kinds include:

- `VALUE_DIFFERENCE`;
- `SCOPE_DIFFERENCE`;
- `TEMPORAL_DIFFERENCE`;
- `IDENTITY_DIFFERENCE`;
- `AUTHORITY_DIFFERENCE`;
- `STATE_DIFFERENCE`;
- `RULE_DIFFERENCE`;
- `COMPLETENESS_DIFFERENCE`;
- `PROVENANCE_DIFFERENCE`;
- `OTHER`.

A discrepancy may later be adjudicated as correction, scoped coexistence, temporal change, exception, contradiction, no change, or another lawful disposition.

## 5. Signal

A `SIGNAL` records an indication that reality may have changed or that a material structure deserves investigation when evidence is not yet sufficient for an assertion.

Examples:

- "I think Sharon may have started approving some of those herself.";
- a source begins producing values inconsistent with its historical pattern;
- a new name repeatedly appears in a role without clear authority;
- two previously separate fields begin sharing commitments or decision paths.

Signal lifecycle:

`DETECTED → VALIDATED | REFUTED | SUPERSEDED`

A validated signal may open discrepancies, unknowns, contradictions, or candidate assertions. Validation does not itself establish the underlying proposition.

## 6. Competing interpretations

When multiple structures fit the same testimony, Foundry should preserve them explicitly rather than collapsing to the carrier's favorite explanation.

Each competing interpretation must identify:

- interpretation ID;
- concise structural claim;
- supporting basis refs;
- conflicting basis refs, if known;
- what observation would discriminate it from alternatives.

The Question Operator engine should normally use `DISCRIMINATE` against unresolved competing interpretations.

## 7. Stage two — Adjudication

Adjudication asks:

> Given current workspace state, evidence, authority, risk, and the interpretation plan, what is each proposed consequence lawfully allowed to do?

Allowed disposition types are:

- `CONFIRM`;
- `SUPERSEDE`;
- `CORRECT`;
- `SCOPE`;
- `TEMPORALIZE`;
- `CONDITIONALIZE`;
- `SPLIT`;
- `MERGE`;
- `OPEN_UNKNOWN`;
- `RESOLVE_UNKNOWN`;
- `PARTIALLY_RESOLVE`;
- `OPEN_CONTRADICTION`;
- `RESOLVE_CONTRADICTION`;
- `OPEN_SIGNAL`;
- `VALIDATE_SIGNAL`;
- `REFUTE_SIGNAL`;
- `REQUEST_MORE_EVIDENCE`;
- `ESCALATE`;
- `NO_CHANGE`;
- `REOPEN`.

Every disposition must contain:

- `disposition_id`;
- disposition type;
- reason code;
- human-readable reason;
- basis refs;
- affected refs;
- adjudication authority/basis;
- whether the disposition is immediately applicable or requires confirmation/escalation.

AI recommendation alone is not principal confirmation or adjudication authority.

## 8. Reason codes

Reason codes explain **why** Foundry changed or did not change structure.

Core reason codes:

- `NEW_INFORMATION`;
- `SCOPE_CLARIFIED`;
- `TEMPORAL_CHANGE`;
- `IDENTITY_SPLIT`;
- `IDENTITY_MERGE`;
- `AUTHORITY_CLARIFIED`;
- `SOURCE_CORRECTED`;
- `EXCEPTION_DISCOVERED`;
- `RULE_NOT_CURRENT`;
- `DUPLICATE_REPRESENTATION`;
- `CONTRADICTED_BY_HIGHER_AUTHORITY`;
- `INSUFFICIENT_EVIDENCE`;
- `NON_MATERIAL_DIFFERENCE`;
- `ALREADY_REPRESENTED`;
- `DEPENDENCY_INVALIDATED`;
- `DEPENDENCY_NEEDS_REVIEW`;
- `USER_CORRECTION`;
- `NO_STRUCTURAL_EFFECT`;
- `OTHER`.

Human-readable reasons remain required. A reason code is not a substitute for explanation.

## 9. Dependency impact

When a materially consequential established assertion is corrected, superseded, split, merged, scoped, temporalized, conditionalized, or materially weakened, Foundry must inspect downstream assertions that depend on it.

Possible dependency outcomes:

- `UNAFFECTED`;
- `RECHECK_REQUIRED`;
- `REOPEN`;
- `SUPERSEDE`;
- `BLOCKED_PENDING_PARENT`.

Dependency review must not automatically declare every descendant false. It determines whether the descendant still has sufficient independent basis.

The required question is:

> What else depended on the thing that just changed?

## 10. Stage three — Structural delta

Structural Delta is the explicit result of lawful adjudication.

It may contain:

- records added;
- records established/confirmed;
- records superseded;
- records reopened;
- records scoped/temporalized/conditionalized;
- unknowns opened/resolved/partially resolved;
- contradictions opened/resolved;
- signals opened/validated/refuted;
- dependencies requiring review;
- signposts added;
- closure/topology changes proposed or authorized;
- unchanged records explicitly examined;
- residual gaps.

The delta is append-preserving. It never means "replace the workspace with this object."

## 11. Structural gain

Structural gain is **increase in explicit, correctly distinguished structure relative to dangerous ambiguity**.

It must not be calculated as `old unknown count - new unknown count`.

A productive answer may resolve one vague assertion and create several explicit unknowns. That can be positive structural gain when ambiguity has been decomposed into safer, inspectable distinctions.

Useful gain dimensions include:

- dangerous ambiguity reduced;
- distinctions made explicit;
- unsupported certainty removed;
- provenance strengthened;
- scope/time/condition clarified;
- competing models separated;
- silent dependency risk exposed;
- refresh/signpost learned;
- closure made more truthful;
- residual uncertainty made explicit.

## 12. No-change rule

When processed testimony does not change Foundry structure, record a `NO_CHANGE` disposition with a reason such as:

- already represented;
- non-material difference;
- descriptive detail with no structural effect;
- insufficient evidence to alter state;
- information belongs to a different unresolved case/field.

Silence is not a disposition.

## 13. High-consequence adjudication

Critical authority, identity, boundary, commitment, provenance, or safety-sensitive changes may require `ESCALATE` before any structural mutation is applied.

The service may require:

- principal confirmation;
- original source evidence;
- authoritative custodian confirmation;
- independent corroboration;
- explicit reconciliation/adjudication.

## 14. Answer-processing loop

The complete loop is:

`question → preserved answer → case → interpretation plan → discrepancies/signals/competing models → adjudication → dependency impact → structural delta → residual gap → next question`

The next Question Selection pass operates on the resulting durable state, not on the carrier's conversational memory.
