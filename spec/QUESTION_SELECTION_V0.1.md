# Foundry Question Selection v0.1

**Status:** governing inquiry policy  
**Version:** 0.1

Foundry does not ask questions in questionnaire order. It selects the next question by the structural value of the answer.

The service must prefer the question that most reduces material uncertainty, resolves a blocking conflict, closes a material collection, clarifies authority, distinguishes standing law from current position, or determines a Ledger boundary.

Question Selection answers **which gap matters next**. The Question Operator layer answers **what kind of question should be used to resolve that gap**. See [`QUESTION_OPERATORS_V0.1.md`](QUESTION_OPERATORS_V0.1.md).

## 1. Governing principle

A good Foundry question changes the model of reality.

A bad Foundry question merely gathers more description.

Question selection must therefore optimize for **structural gain**, not conversational variety, completion percentage, or topic coverage for its own sake.

The inquiry loop is:

`candidate gaps → priority ranking → operator selection → evidence neighborhood → one ordinary-language question → preserved testimony → residual gap`

## 2. Candidate question sources

Question candidates may be generated from:

- open blocking contradictions;
- blocking or high-materiality unknowns;
- assertions marked `NEEDS_CLARIFICATION` or `CONFLICTED`;
- candidate assertions requiring governed verification;
- unresolved identity/continuity distinctions;
- unresolved authority/responsibility distinctions;
- unresolved Ledger candidates;
- closure records that are `KNOWN_INCOMPLETE`, `UNRESOLVED`, or `NOT_YET_RECONCILED`;
- material collections not yet checked in the reality-to-record direction;
- current-state assertions whose as-of basis is stale or absent;
- standing-law assertions that lack transition, condition, exception, or consequence semantics;
- established material assertions that need a future change signpost;
- acceptance failures or unresolved acceptance cases;
- missing provenance on material established assertions;
- a newly opened field that has not yet yielded enough structure for narrower questions.

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

### P5 — Closure and completeness

Questions that test silent omissions, close material collections or domains, and distinguish `none` from `not yet known`.

### P6 — Current position and maintenance triggers

Questions that establish what is true now or what future observable event should cause a material current assertion to be re-evaluated.

### P7 — Refinement / initial discovery

Useful but non-blocking clarification, naming, description, low-materiality history, or open narration needed to form the first candidate map.

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
- `closure/completeness`: +30
- `current position`: +25
- `acceptance failure`: +25
- `missing provenance`: +20
- `staleness`: +10
- `already answered by preserved evidence`: −1000
- `duplicate semantic question`: −500

The implementation may encode priority class as non-overlapping numeric bands, but a P2 candidate must never outrank an eligible P1 candidate merely because its within-class weights are larger.

Identical workspace inputs should produce identical rankings.

## 5. Question-operator selection

After the highest-value gap is selected, Foundry selects a Question Operator from the governing operator library.

Examples:

- new under-modeled field → `NARRATE`;
- branch applicability → `GATE`;
- competing interpretations / Ledger topology → `DISCRIMINATE`;
- missing source or authority lineage → `TRACE`;
- possible silent collection omissions → `INVERT`;
- candidate confirmation → `VERIFY`;
- ambiguous inherited label → `DEFINE_BY_FUNCTION`;
- unclear scope/jurisdiction → `BOUND`;
- state change → `TRIGGER`;
- rule non-universality → `EXCEPTION`;
- pressure-test assumption → `COUNTERFACTUAL`;
- future re-evaluation trigger → `SIGNPOST`;
- negative-space accounting → `CLOSE`;
- high-consequence evidence risk → `ESCALATE` or an `ESCALATE` modifier around the core operator.

Operator selection does not alter the gap's priority class.

## 6. Mandatory shortcuts

### Narrative before normalization

A new under-modeled field begins with open narration only long enough to discover its own structure. Foundry then moves to narrower operators rather than repeatedly asking broad descriptive questions.

### Gate before branch

When one answer can determine whether an entire family of questions applies, ask the gate first.

### Audit in both directions

For material collections, distinguish:

- `represented record → reality` (existence / accuracy);
- `reality → represented record` (completeness).

Validating every represented member does not establish that no material members are missing.

### Discriminate rather than accumulate

When two or more models fit the evidence, ask where those models predict different observable answers. Avoid undirected "tell me more" questions when a discriminator exists.

### Learn the refresh trigger

When a material fact is established and change can be observed, ask what future event or condition should cause re-evaluation instead of scheduling unnecessary periodic re-onboarding.

## 7. Evidence-before-question rule

Before asking a human, Foundry should check whether the workspace already contains sufficient evidence to resolve or narrow the question.

If existing evidence answers the question, reconcile from the evidence or ask only the remaining distinction.

Foundry must not repeatedly ask humans to restate data already preserved merely because a new AI session lacks conversational memory.

## 8. Question construction rules

The selected question must:

- be asked in ordinary language;
- preserve the selected operator's semantic job;
- ask one material distinction at a time unless the distinctions are inseparable;
- preserve the exact unresolved structure in its rationale;
- identify the records whose interpretation depends on the answer;
- avoid presupposing the answer;
- avoid forcing the human into Atlas vocabulary;
- avoid asking for information already preserved and sufficiently established.

A carrier may phrase the question naturally, but it may not change the semantic distinction being tested.

## 9. Question bundles

`get_next_question` should normally return:

- one primary question;
- reason for asking;
- priority class;
- related record IDs;
- expected structural gain;
- selected operator;
- operator rationale;
- any operator modifier such as `ESCALATE`;
- up to two alternates when the primary cannot currently be answered.

## 10. Stopping condition

The engine may return `NO_MATERIAL_QUESTION` only when:

- no blocking contradiction or unknown remains;
- all material closure domains are accounted for;
- no unresolved topology issue blocks the current Ledger;
- material authority and transition semantics are sufficient;
- current position is sufficiently reconciled;
- readiness work, rather than further discovery, is the next lawful phase.

`NO_MATERIAL_QUESTION` is not equivalent to `READY_TO_SEAL`.

## 11. Auditability

For every selected question, the service should be able to show:

`workspace state → candidate gaps → priority ranking → selected gap → operator → evidence neighborhood → question`

After the answer it should be able to show:

`question → testimony → bounded operations → residual gap / next operator`

Question choice must be inspectable rather than hidden inside model intuition.
