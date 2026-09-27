# Foundry Question Operators v0.1

**Status:** governing inquiry-operator contract  
**Version:** 0.1

Question Selection decides **which structural gap matters next**.  
Question Operators decide **what kind of question is most likely to resolve that gap**.

Foundry must not use one generic interview style for every uncertainty. Different structural problems require different question forms.

The governing loop is:

`highest-value gap → operator selection → smallest relevant evidence neighborhood → ordinary-language question → preserved testimony → measured structural resolution → next operator`

## 1. Operator rules

1. Operators are semantic jobs, not canned wording.
2. A carrier may phrase a question naturally but must preserve the selected operator's structural purpose.
3. Existing evidence must be checked before asking the human.
4. One question should normally test one material distinction.
5. A higher-cost operator is justified by consequence, not curiosity.
6. Operators may be sequenced; they must not be collapsed into one overloaded question merely to shorten the conversation.
7. `ESCALATE` may act as a modifier around another operator when the structural job remains clear but the evidence standard must rise.
8. Canon Discovery lenses may suggest an operator, but the operator remains governed by the actual unresolved structure.

## 2. Operator library

### `NARRATE`

**Job:** Open an under-modeled field without imposing categories.

Use when Foundry does not yet have enough structure to know which narrower distinction matters.

Ask for a natural account of what happens in practice, usually from entry/relevance through completion/consequence.

Do not use `NARRATE` when a specific high-value contradiction, topology question, authority gap, or transition gap is already known.

### `GATE`

**Job:** Determine whether an entire branch, domain, role, rule, or collection applies before asking inside it.

A gate answer should be able to produce a semantic branch such as:

- applies / exists;
- does not apply / none;
- conditional;
- unknown / unresolved.

A negative gate answer must not be interpreted as a negative fact unless the principal or evidence actually establishes that absence.

`GATE` exists to avoid asking ten detailed questions about a branch that does not exist.

### `DISCRIMINATE`

**Job:** Separate two or more plausible structures by asking where they predict different observable answers.

Use for contradictions, Ledger topology, competing identity explanations, or rival interpretations.

Do not ask "tell me more" when a discriminating question exists.

Prefer a question whose answer would rule out, split, or materially weaken at least one candidate model.

### `TRACE`

**Job:** Follow a claim, authority, identity, or record back to its source, basis, or chain of custody.

Trace may move through:

`current assertion → testimony/record → originating event/person/rule → authority/source`

Use when source, provenance, delegation, authority lineage, custody, or original evidence matters.

### `INVERT`

**Job:** Test completeness in the reverse direction.

Normal validation often asks:

`represented record → does this exist in reality?`

`INVERT` asks:

`reality → could something materially relevant exist without appearing in the represented records?`

For material collections, validating every represented member does not establish completeness. Foundry must separately test for silent omissions before safe closure when such an inverse check is possible.

### `VERIFY`

**Job:** Reflect a candidate interpretation to an authorized human or source for correction or confirmation.

Verification should invite correction, not merely agreement.

Prefer:

> My current interpretation is X. What is wrong, incomplete, or too broad about it?

rather than a leading yes/no confirmation when nuance matters.

AI repetition is not verification authority.

### `DEFINE_BY_FUNCTION`

**Job:** Replace an inherited label with what the thing actually does, changes, permits, blocks, carries, preserves, or decides.

Use when words such as manager, owner, department, customer, project, approved, ready, or member may hide different operating functions.

Function is established before conventional classification is trusted.

### `BOUND`

**Job:** Establish where a claim, role, rule, identity, authority, access right, or responsibility starts and stops.

Possible dimensions include:

- person / bearer;
- object;
- place;
- time;
- condition;
- jurisdiction;
- amount / threshold;
- lifecycle state.

A rule without scope may be more dangerous than an acknowledged unknown.

### `TRIGGER`

**Job:** Find the event or condition that changes state and what becomes possible, required, prohibited, or expected afterward.

Use for consequential state, workflow, readiness, commitment, approval, custody, scheduling, payment, or availability changes.

The target structure is:

`configuration_before + event/condition + applicable constraints → configuration_after`

### `EXCEPTION`

**Job:** Find when an established rule does not apply, changes, or may be overridden.

Establish, where material:

- exception condition;
- who can invoke/decide it;
- substitute rule or consequence;
- whether the exception is itself bounded.

Do not infer universality merely because the normal case is well described.

### `REPAIR`

**Job:** Determine how a breached, failed, invalid, rejected, damaged, or otherwise unfit state is restored and how restoration is verified.

The target structure is:

`intended state → breach condition → detection → authorized repair → restored-state test`

Establish, where material:

- what counts as breach or invalidity;
- who detects or declares it;
- who may repair it;
- what operation restores the state;
- what evidence or verification establishes restoration;
- whether the repaired state has the same authority/status as the original state.

Do not substitute `EXCEPTION`. An exception changes which rule applies. Repair restores a state after failure.

### `COUNTERFACTUAL`

**Job:** Ask what would have to be observed for the current model, assumption, or interpretation to be wrong.

Use to pressure-test topology, causality, authority, identity, dependency, or operating-law assumptions.

The answer should create a falsification condition, not a rhetorical defense of the current model.

### `SIGNPOST`

**Job:** Identify a future observable event or condition that should cause Atlas to re-evaluate an established claim.

This converts static onboarding facts into maintainable reality.

Examples include:

- role changes;
- new contract or revocation;
- threshold crossing;
- ownership change;
- state transition;
- new source contradicting the baseline.

An established fact with a useful signpost does not need to be re-asked on a calendar merely because time passed.

### `CLOSE`

**Job:** Explicitly account for the negative space of a material domain or collection.

Closure outcomes remain:

- `CLOSED_COMPLETE`;
- `CLOSED_NONE`;
- `NOT_APPLICABLE`;
- `KNOWN_INCOMPLETE`;
- `UNRESOLVED`;
- `NOT_YET_RECONCILED`.

For a material collection, `CLOSE` should normally follow any required `INVERT` check.

### `ESCALATE`

**Job:** Raise the evidence standard because the consequence of error, conflict, authority risk, or identity/boundary corruption is high.

Escalation may require:

- direct principal confirmation;
- original source evidence;
- independent corroboration;
- authoritative custodian;
- stronger provenance chain;
- explicit adjudication.

`ESCALATE` does not mean "ask more questions." It means "require a stronger basis before relying on the answer."

## 3. High-value sequences

### Discovery sequence

`NARRATE → DEFINE_BY_FUNCTION / GATE / BOUND / TRACE → DISCRIMINATE as needed`

Start open only long enough to discover the field's own structure, then narrow.

### Collection sequence

`GATE → represented-to-reality validation → INVERT → CLOSE`

A collection is not complete merely because its existing records are valid.

### Competing-model sequence

`DISCRIMINATE → TRACE / BOUND → VERIFY`

Resolve the distinction that causes the models to diverge before collecting more description.

### Operating-law sequence

`DEFINE_BY_FUNCTION → BOUND → TRIGGER → EXCEPTION → REPAIR → SIGNPOST`

This converts a label into maintainable governing behavior, including what happens when the intended state fails.

### High-consequence sequence

`operator + ESCALATE → TRACE → VERIFY/adjudicate`

Material consequence raises the evidence standard without changing the underlying structural question.

## 4. Five mandatory shortcuts

### 4.1 Narrative before normalization

Do not begin a new under-modeled field by forcing a universal questionnaire. Recover natural process and structure first, then apply narrower operators.

### 4.2 Gate before branch

When one answer can determine whether an entire question family applies, ask the gate first.

### 4.3 Audit both directions

Existence/accuracy and completeness are different questions.

- `record → reality` tests whether represented things are real;
- `reality → record` tests whether materially relevant real things are missing.

Foundry must preserve that distinction.

### 4.4 Discriminate rather than accumulate

When multiple models fit current evidence, ask where they predict different answers. Do not merely gather more undirected detail.

### 4.5 Learn the refresh trigger

When a material fact becomes established and a future change is observable, capture the `SIGNPOST` that would require re-evaluation rather than scheduling needless re-onboarding.

## 5. Operator selection

Operator selection happens **after** the structural gap is ranked.

Priority determines which gap matters. Operator choice determines how to resolve it.

A P1 contradiction may use `DISCRIMINATE`; a P5 collection gap may use `INVERT`; a P4 restoration gap may use `REPAIR`; a P6 established current fact may use `SIGNPOST`.

The operator itself does not change the gap's priority class.

## 6. Auditability

For every primary question, Foundry should be able to show:

`target gap → discovery lens when present → selected operator → evidence neighborhood → question → answer → resulting operations → residual gap`

This makes inquiry strategy inspectable and allows later research to compare operator performance without letting the AI silently change the method.
