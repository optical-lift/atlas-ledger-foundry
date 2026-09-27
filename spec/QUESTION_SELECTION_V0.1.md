# Foundry Question Selection v0.1

**Status:** governing inquiry policy  
**Version:** 0.1

Foundry does not ask questions in questionnaire order. It selects the next question by the structural value of the answer.

The service must prefer the question that most reduces material uncertainty, resolves a blocking conflict, closes a material collection, clarifies authority, distinguishes standing law from current position, or determines a Ledger boundary.

## 1. Governing principle

A good Foundry question changes the model of reality.

A bad Foundry question merely gathers more description.

Question selection must therefore optimize for **structural gain**, not conversational variety, completion percentage, or topic coverage for its own sake.

## 2. Candidate question sources

Question candidates may be generated from:

- open blocking contradictions;
- blocking or high-materiality unknowns;
- assertions marked `NEEDS_CLARIFICATION` or `CONFLICTED`;
- unresolved identity/continuity distinctions;
- unresolved authority/responsibility distinctions;
- unresolved Ledger candidates;
- closure records that are `KNOWN_INCOMPLETE`, `UNRESOLVED`, or `NOT_YET_RECONCILED`;
- current-state assertions whose as-of basis is stale or absent;
- standing-law assertions that lack transition, condition, exception, or consequence semantics;
- acceptance failures or unresolved acceptance cases;
- missing provenance on material established assertions.

## 3. Priority classes

Priority class governs before any within-class weight is applied.

### P0 — Safety / authority / reality corruption risk

Examples include authority collision, identity merge risk, Ledger-boundary collision, or a materially established assertion without valid provenance.

### P1 — Blocking contradictions and unknowns

Resolve conditions explicitly marked blocking or critical.

### P2 — Ledger topology

Resolve whether a discovered field is a separate Ledger, part of the current Ledger, related external reality, not materially relevant, or unresolved.

### P3 — Authority, responsibility, custody, verification, identity / continuity

Questions that distinguish who may observe, act, decide, commit, verify, override, carry responsibility, or continue as the same thing.

### P4 — Consequential state transitions

Questions that establish what event changes state, under what conditions, with what exception, and what becomes possible or required afterward.

### P5 — Closure

Questions that close material collections or domains and distinguish `none` from `not yet known`.

### P6 — Current position

Questions that establish what is true now when the current condition affects decisions.

### P7 — Refinement

Useful but non-blocking clarification, naming, description, or historical detail.

## 4. Deterministic ranking

The engine first compares priority class. Only candidates in the same class are ranked by additional structural weight.

Recommended within-class components:

- `blocking`: +100
- `critical materiality`: +80
- `high materiality`: +50
- `topology`: +45
- `authority`: +40
- `identity/continuity`: +40
- `transition/law`: +35
- `closure`: +30
- `current position`: +25
- `acceptance failure`: +25
- `missing provenance`: +20
- `staleness`: +10
- `already answered by preserved evidence`: −1000
- `duplicate semantic question`: −500

The implementation may encode priority class as non-overlapping numeric bands, but a P2 candidate must never outrank an eligible P1 candidate merely because its within-class weights are larger.

Identical workspace inputs should produce identical rankings.

## 5. Question construction rules

The selected question must:

- be asked in ordinary language;
- ask one material distinction at a time unless the distinctions are inseparable;
- preserve the exact unresolved structure in its rationale;
- identify the records whose interpretation depends on the answer;
- avoid presupposing the answer;
- avoid forcing the human into Atlas vocabulary;
- avoid asking for information already preserved and sufficiently established.

Bad:

> Is Ricardo the Argentina approval authority?

Better:

> When Ricardo approves a receiving church in Argentina, is he making that decision under his own standing authority, or is he acting on authority delegated by David for that situation?

The second question distinguishes bearer, source, scope, and condition.

## 6. Evidence-before-question rule

Before asking a human, Foundry should check whether the workspace already contains sufficient evidence to resolve or narrow the question.

If existing evidence answers the question, reconcile from the evidence or ask only the remaining distinction.

Foundry must not repeatedly ask humans to restate data already preserved merely because a new AI session lacks conversational memory.

## 7. Question bundles

`get_next_question` should normally return:

- one primary question;
- reason for asking;
- priority class;
- related record IDs;
- expected structural gain;
- up to two alternates when the primary cannot currently be answered.

A carrier may phrase the question naturally, but it may not change the semantic distinction being tested.

## 8. Stopping condition

The engine may return `NO_MATERIAL_QUESTION` only when:

- no blocking contradiction or unknown remains;
- all material closure domains are accounted for;
- no unresolved topology issue blocks the current Ledger;
- material authority and transition semantics are sufficient;
- current position is sufficiently reconciled;
- readiness work, rather than further discovery, is the next lawful phase.

`NO_MATERIAL_QUESTION` is not equivalent to `READY_TO_SEAL`.

## 9. Auditability

For every selected question, the service should be able to show:

`workspace state → candidate gaps → ranking → selected question`

Question choice must be inspectable rather than hidden inside model intuition.
