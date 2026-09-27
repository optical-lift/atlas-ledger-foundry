# Foundry Workspace v0.1

**Status:** governing implementation contract  
**Version:** 0.1

A Foundry Workspace is the durable pre-Ledger state for one human principal working on one bounded or still-being-bounded field of reality.

It is the remote equivalent of a Baton. It is not an Atlas Ledger and it is not canonical Atlas Reality.

## 1. Purpose

A workspace exists so that AI sessions, practitioners, and future Atlas-native carriers can continue the same Foundry work without depending on conversational memory.

The workspace must preserve enough structure that a completely different qualified carrier can resume the work without asking the human to restate already-preserved reality.

## 2. Authority boundary

A Foundry Workspace may contain:

- source material;
- raw testimony;
- candidate entities, relations, events, states, rules, authorities, responsibilities, commitments, and boundaries;
- reconciled assertions;
- contradictions;
- known unknowns;
- closure state;
- Ledger candidates;
- acceptance scenarios and results;
- correction and supersession history.

It must not itself create canonical Atlas Reality.

No record becomes an active Atlas Ledger merely because it is present in a Foundry Workspace.

Promotion requires a separate seal/validation/admission operation.

## 3. Required workspace identity

Every workspace must carry:

- `workspace_id` — stable identifier;
- `protocol_version` — Foundry protocol version in force;
- `owner_principal_id` — identity of the human principal or free Foundry account that owns the workspace;
- `status` — current Foundry lifecycle state;
- `created_at`;
- `updated_at`;
- `as_of` — the current-position time the workspace is attempting to reconcile;
- `provisional_subject` — what person, organization, household, institution, or other subject appears to anchor the field;
- `provisional_field` — ordinary-language description of the reality under inquiry;
- `boundary_status` — whether that field is unresolved, provisional, or sufficiently bounded for readiness review.

## 4. Workspace lifecycle

Allowed lifecycle states are:

- `DISCOVERY` — evidence and testimony are still being broadly recovered;
- `RECONCILIATION` — candidate structure is being confirmed, corrected, split, joined, or retired;
- `CLOSURE` — Foundry is explicitly testing whether material domains and collections are accounted for;
- `ACCEPTANCE` — Foundry is pressure-testing operation and transition behavior;
- `READY_TO_SEAL` — all blocking readiness conditions currently pass;
- `SEALED` — a fixed Ledger candidate release has been created;
- `SUPERSEDED` — this workspace/release has been replaced by a later controlled version;
- `ABANDONED` — the principal intentionally stopped this Foundry without sealing.

Changing lifecycle state does not erase prior records.

## 5. Record classes

The workspace contains append-preserving record classes.

### Sources

A source identifies where evidence came from: document, spreadsheet, software export, message history, prior AI work, database, audio, image, external system, human testimony session, or other witness.

A source is not itself an assertion of present reality.

### Testimony

Testimony preserves what a human or source said or represented before interpretation is promoted.

Testimony should preserve original wording or a recoverable reference to it where practical.

### Assertions

Assertions are structured claims about reality or governing structure.

Every assertion must carry a stage/status. At minimum Foundry must distinguish:

- `CANDIDATE`;
- `NEEDS_CLARIFICATION`;
- `ESTABLISHED`;
- `CONFLICTED`;
- `SUPERSEDED`;
- `RETIRED`;
- `REJECTED`.

`ESTABLISHED` means established for the Foundry baseline under the available authority and evidence. It still does not mean admitted to canonical Atlas Reality.

### Unknowns

Unknowns are explicit unresolved conditions.

An unknown should identify what is unknown, why it matters, and whether it blocks readiness.

### Contradictions

Contradictions preserve materially incompatible testimony or assertions until actually reconciled.

Resolving a contradiction must not delete the earlier record.

### Closure records

Closure records state whether a material domain or collection has been explicitly reconciled.

Blank or absent closure is never equivalent to complete.

### Ledger candidates

A Ledger candidate is a possible separately governable field discovered during Foundry.

It remains a candidate until topology work determines whether it is:

- a separate Ledger;
- part of the current Ledger;
- a related external entity/field;
- not materially relevant;
- unresolved.

### Acceptance cases

Acceptance cases describe scenarios used to test whether the candidate Ledger can interpret consequential events, transitions, authority, constraints, exceptions, and outcomes.

## 6. Provenance invariant

Every materially consequential assertion must be traceable to one or more of:

- testimony records;
- source records;
- prior established assertions plus an explicit derivation;
- a human confirmation/correction event;
- a governed reconciliation operation.

An AI-generated interpretation with no preserved basis may remain a candidate but may not become established merely because it is plausible.

## 7. History invariant

Foundry history is append-preserving.

Corrections should be represented as controlled supersession or reconciliation, not silent mutation of the historical record.

Where a current projection is needed, the service may compute the latest valid view, but it must remain possible to reconstruct:

`source/testimony → candidate → clarification/correction → established result → later supersession`

## 8. Identity invariant

Stable record IDs must survive carrier changes.

A different AI may improve an interpretation, but it must not renumber existing entities/assertions merely for neatness.

Similarity, shared name, shared role, shared content, or shared outcome do not by themselves establish identity.

## 9. Current position versus standing law

The workspace must preserve separate representations for:

- standing law / rule / conditional expectation;
- current state / position / active condition;
- event / occurrence that changed or may change state.

A carrier must not overwrite standing law with a one-time event or infer that a normal rule occurred merely because it was expected.

## 10. Readiness

A workspace may become `READY_TO_SEAL` only when the governing readiness review confirms at minimum:

- boundary sufficiently resolved;
- no material domain remains silently unreconciled;
- current position sufficiently reconciled;
- authority and responsibility sufficient for the field;
- blocking contradictions resolved;
- blocking unknowns eliminated or reclassified as non-blocking known unknowns;
- material state transitions interpretable;
- acceptance cases pass at the required level;
- Ledger topology does not contain an unresolved blocking split/merge problem.

The workspace itself may not self-certify readiness merely because an AI says it is complete.

## 11. Seal

Sealing creates a fixed release containing:

- protocol version;
- subject and field;
- boundary declaration;
- established assertions included in the release;
- current-position snapshot;
- standing-law set;
- authority/responsibility set;
- commitments;
- known unknowns;
- explicit closure register;
- acceptance results;
- provenance references;
- release identifier and timestamp.

After sealing, further changes belong to a new controlled version or ongoing Foundry delta.

## 12. Carrier independence

The same workspace semantics must be supportable by:

- a manual Baton;
- a remote Foundry Service;
- a human practitioner tool;
- native Atlas onboarding.

No carrier may redefine the meaning of the records for convenience.
