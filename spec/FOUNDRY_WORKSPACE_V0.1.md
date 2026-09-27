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

- source material and raw testimony;
- candidate and reconciled assertions;
- contradictions and known unknowns;
- closure state;
- Ledger candidates;
- acceptance scenarios/results;
- adjudication cases;
- interpretation and reconciliation plans;
- discrepancies and signals;
- dispositions with reason codes;
- dependency-impact records;
- structural deltas;
- correction/supersession history.

It must not itself create canonical Atlas Reality.

No record becomes an active Atlas Ledger merely because it is present in a Foundry Workspace. Promotion requires a separate seal/validation/admission operation.

## 3. Required workspace identity

Every workspace must carry:

- `workspace_id`;
- `protocol_version`;
- `owner_principal_id`;
- lifecycle `status`;
- `created_at`, `updated_at`, and current-position `as_of` where known;
- `provisional_subject`;
- `provisional_field`;
- `boundary_status`.

## 4. Workspace lifecycle

Allowed lifecycle states are:

- `DISCOVERY`;
- `RECONCILIATION`;
- `CLOSURE`;
- `ACCEPTANCE`;
- `READY_TO_SEAL`;
- `SEALED`;
- `SUPERSEDED`;
- `ABANDONED`.

Changing lifecycle state does not erase prior records.

## 5. Core record classes

### Sources

Identify where evidence came from. A source is not itself an assertion of present reality.

### Testimony

Preserves what a human/source said or represented before interpretation is promoted. Original or recoverable wording is preferred.

### Assertions

Structured claims about reality/governing structure. Foundry distinguishes at minimum:

`CANDIDATE`, `NEEDS_CLARIFICATION`, `ESTABLISHED`, `CONFLICTED`, `SUPERSEDED`, `RETIRED`, `REJECTED`.

Foundry `ESTABLISHED` is still pre-Atlas.

### Unknowns

Explicit unresolved conditions, including materiality and readiness-blocking status.

### Contradictions

Materially incompatible testimony/assertions retained until actually reconciled. Resolution never deletes the earlier evidence.

### Closure records

Explicitly state whether a material domain/collection is complete, none, not applicable, incomplete, unresolved, or not yet reconciled. Blank is never complete.

### Ledger candidates

Possible separately governable fields preserved until topology adjudication.

### Acceptance cases

Pressure-test interpretation of consequential events, transitions, authority, constraints, exceptions, and outcomes.

## 6. Answer-processing record classes

### Adjudication cases

A `CASE` groups one consequential answer-processing episode so Foundry can reconstruct why a part of reality changed or reopened.

### Interpretation plans

Carrier-generated proposals describing what preserved testimony **could** mean. They have no independent establishment authority.

### Discrepancies

Represent differences between current structure and new evidence without deciding which representation is wrong.

`difference ≠ correction`

### Signals

Represent indications that something may have changed or requires investigation when evidence is not yet sufficient for an assertion.

`signal ≠ assertion`

### Reconciliation plans and dispositions

Describe proposed/adjudicated consequences. Every disposition records type, reason code, explanation, basis, affected records, authority, and status.

### Dependency impacts

Record what downstream assertions must be rechecked when a premise changes. Changed premises do not automatically make every descendant false.

### Structural deltas

Append-preserving descriptions of the lawful consequences of adjudication: added/confirmed/superseded/reopened/scoped records, opened/resolved uncertainty, dependency impacts, explicit no-change, and residual gaps.

A structural delta is not a replacement workspace.

## 7. Provenance invariant

Every materially consequential assertion must be traceable to testimony, source evidence, established derivation, human confirmation/correction, or governed reconciliation.

An AI-generated interpretation without preserved basis may remain a candidate but cannot become established merely because it is plausible.

## 8. History invariant

Foundry history is append-preserving.

It must remain possible to reconstruct:

`source/testimony → interpretation → discrepancy/signal/candidate → adjudication → disposition → structural delta → established/current projection → later supersession`

## 9. Identity invariant

Stable record IDs survive carrier changes. Similarity, shared name, shared role, shared content, or shared outcome do not establish identity.

## 10. Current position versus standing law

The workspace keeps standing law, current state/position, and state-changing events distinct. A one-time occurrence must not silently overwrite a standing rule.

## 11. Structural-gain invariant

Progress is not measured by reducing the count of unknowns.

A new answer may improve the model by splitting dangerous ambiguity into several explicit unknowns, competing interpretations, or dependency questions.

Structural gain means more explicit, correctly distinguished structure relative to unsafe ambiguity.

## 12. Readiness

A workspace becomes `READY_TO_SEAL` only when the governing readiness review passes boundary, closure, current-position, authority, contradiction, unknown, transition, acceptance, topology, provenance, and other material gates.

Open adjudication cases, unresolved high-materiality discrepancies/signals, or dependency impacts may block readiness when they affect the baseline materially.

The workspace may not self-certify readiness merely because an AI says it is complete.

## 13. Seal

Sealing creates a fixed release containing the reconciled subject/field, boundary, established assertions, current position, standing law, authority/responsibility, commitments, known unknowns, closure register, acceptance results, provenance, release identity, and required adjudication history.

After sealing, later changes belong to a controlled version or ongoing Foundry delta.

## 14. Carrier independence

The same workspace semantics must be supportable by:

- manual Baton;
- remote Foundry Service;
- human practitioner tool;
- native Atlas onboarding.

No carrier may redefine record meaning for convenience.
