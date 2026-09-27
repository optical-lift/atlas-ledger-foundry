# Foundry Service Operations v0.1

**Status:** governing service contract  
**Version:** 0.1

This document defines the lawful operation surface for a connected Atlas Ledger Foundry service.

The service is not a generic database API. It is a governed command surface for carrying out the Foundry protocol against a durable workspace.

The governing sequence remains:

`evidence → testimony → candidate structure → clarification → reconciliation → closure → acceptance → sealed Ledger candidate`

No service operation may skip that sequence merely because an AI carrier can infer a plausible answer.

## 1. Global invariants

Every operation must preserve these rules:

1. **Principal authority remains upstream.** The AI carrier does not become the source of the human's reality or authority.
2. **Testimony is preserved before interpretation is promoted.**
3. **Candidate structure is not canonical reality.**
4. **Foundry `ESTABLISHED` is still pre-Atlas.** Atlas admission is a separate authority transition.
5. **Unknown is not none.**
6. **History is append-preserving.** Corrections use reconciliation/supersession rather than silent historical mutation.
7. **Stable IDs survive carrier changes.**
8. **A new named thing is not automatically a new Ledger.**
9. **The service, not the AI carrier, enforces lifecycle and readiness gates.**
10. **No operation grants direct access to underlying persistence, SQL, canonical Atlas Reality, or unrestricted CRUD.**

## 2. Operation envelope

Every connected operation should be attributable to:

- `operation_id` — stable request identifier;
- `workspace_id` where applicable;
- `principal_id` — authenticated Foundry owner/principal;
- `carrier_id` — AI host, practitioner tool, Atlas native carrier, or other delegated client;
- `protocol_version`;
- `requested_at`;
- optional `basis_refs` pointing to testimony, sources, assertions, questions, contradictions, or prior operations.

The service may record additional execution metadata, but carrier metadata must never be treated as human testimony.

## 3. Read operations

### `get_foundry_orientation`

**Purpose:** Give a carrier the current governing orientation before or during Foundry work.

May return:

- protocol version;
- governing-order version;
- current core rules;
- links/references to canonical Foundry documents;
- supported operation surface.

Must not:

- return private evaluation keys or hidden research controls;
- vary governing meaning by AI vendor;
- imply that model/provider memory is authoritative.

### `resume_workspace`

**Purpose:** Let a qualified carrier resume an existing workspace without requiring the human to restate preserved information.

Must return a bounded working projection containing enough of:

- workspace identity and lifecycle state;
- provisional subject and field;
- boundary status;
- current established assertions relevant to the active field;
- open contradictions;
- blocking and high-materiality unknowns;
- closure state;
- unresolved Ledger candidates;
- acceptance status;
- next-question candidates;
- protocol/governance version.

The service may summarize large workspaces for context efficiency, but summaries must link back to stable records and must not replace them.

### `get_workspace_state`

**Purpose:** Retrieve a governed current projection of the workspace or a requested subset.

Allowed filters may include record class, domain, subject/reference, status, materiality, and changed-since checkpoint.

This is a read projection, not permission to rewrite underlying history.

### `get_relevant_evidence`

**Purpose:** Retrieve the source/testimony basis relevant to an assertion, contradiction, unknown, question, Ledger candidate, or acceptance case.

Must preserve source/testimony identity and distinguish original evidence from later interpretation.

### `get_governing_rule`

**Purpose:** Return the currently applicable Foundry rule for a named problem such as Ledger topology, closure, authority, provenance, identity, state transition, or sealing.

If a requested rule is not established, the service must return an unresolved/unsupported condition rather than inventing a new governing rule.

### `get_closure_status`

**Purpose:** Return domain and collection closure records and identify material areas that are still silent, incomplete, unresolved, or not yet reconciled.

Must never infer closure from lack of records.

### `get_next_question`

**Purpose:** Select the next materially useful inquiry from current workspace state.

Question selection should prefer work that:

- resolves a blocking contradiction;
- resolves a blocking/high-materiality unknown;
- establishes identity/continuity;
- clarifies authority/responsibility;
- determines a Ledger boundary;
- closes a material collection;
- separates standing law from current position;
- establishes a consequential transition, dependency, exception, or verification rule.

The operation may return one primary question plus optional alternates. It should not emit a fixed questionnaire when existing evidence already answers those matters.

## 4. Write operations

### `start_workspace`

**Purpose:** Create a durable pre-Ledger Foundry workspace for an authenticated principal.

Required input:

- provisional subject label or self/personal starting context;
- provisional field in ordinary language;
- optional initial scope and source references.

The created workspace begins in `DISCOVERY` unless a governed import/resume operation establishes another lawful state.

Creating a workspace does not create an Atlas Ledger.

### `record_source`

**Purpose:** Register an evidence source without treating its contents as present truth.

Examples include documents, spreadsheets, exports, conversations, databases, audio, images, messages, or prior systems.

The operation records source identity/provenance and may queue extraction, but source registration alone establishes no assertion.

### `record_testimony`

**Purpose:** Preserve what a human or source said/represented before interpretation.

The service should prefer exact or recoverable original content where practical.

A carrier may submit contextual metadata, but must not rewrite testimony merely to make it more structured.

If an AI paraphrase is all that is available, the record must say that the preserved text is a paraphrase/derived representation rather than original human wording.

### `submit_candidate_assertions`

**Purpose:** Submit structured interpretations derived from preserved evidence/testimony.

Each candidate must include:

- assertion kind;
- structured content;
- basis references;
- temporal/context scope where material;
- confidence or interpretation note where useful.

The service must reject or leave unresolved a candidate whose basis references do not exist.

AI submission alone may not set an assertion to `ESTABLISHED`.

### `record_unknown`

**Purpose:** Preserve a known unresolved condition rather than hiding it in prose or converting it into absence.

Must record materiality and whether it blocks readiness.

### `record_contradiction`

**Purpose:** Link materially incompatible testimony/assertions without deciding the conflict prematurely.

Requires at least two record references.

Opening a contradiction must not retire either side automatically.

### `record_ledger_candidate`

**Purpose:** Preserve a possible separately governable field discovered during Foundry.

The operation must not classify the candidate as a separate Ledger solely from name, legal form, software boundary, project label, location, or organizational convention.

### `record_acceptance_case`

**Purpose:** Preserve a scenario used to pressure-test operational interpretation.

A case should identify the scenario and, when known, expected behavior. A carrier may propose expected behavior, but the service must preserve whether that expectation is established, user-confirmed, or still candidate.

## 5. Reconciliation operations

### `confirm_assertion`

**Purpose:** Record a governed basis for moving an assertion toward or into `ESTABLISHED` Foundry status.

A confirmation must identify who/what confirmed it and the basis for that authority.

The service must distinguish:

- human principal confirmation;
- authoritative source confirmation;
- governed reconciliation from multiple sources;
- AI recommendation.

AI recommendation by itself is not confirmation authority.

### `correct_assertion`

**Purpose:** Preserve a correction without rewriting historical provenance.

A correction normally creates or establishes a replacement assertion and marks the prior assertion `SUPERSEDED`, `RETIRED`, or `REJECTED` with an explicit relationship.

### `resolve_contradiction`

**Purpose:** Record how a contradiction was resolved or why it remains unresolved but non-blocking.

Must preserve the conflicting source records and the resolution basis.

### `update_closure`

**Purpose:** Set or change an explicit closure record under the Closure Protocol.

Allowed semantic states:

- `CLOSED_COMPLETE`;
- `CLOSED_NONE`;
- `NOT_APPLICABLE`;
- `KNOWN_INCOMPLETE`;
- `UNRESOLVED`;
- `NOT_YET_RECONCILED`.

`CLOSED_COMPLETE`, `CLOSED_NONE`, and `NOT_APPLICABLE` require explicit basis. The service must not accept them merely because no further records currently exist.

### `classify_ledger_candidate`

**Purpose:** Reconcile a Ledger candidate into one of the topology outcomes allowed by the governing Ledger topology contract.

Expected outcomes include:

- `SEPARATE_LEDGER`;
- `PART_OF_CURRENT_LEDGER`;
- `RELATED_EXTERNAL_FIELD`;
- `NOT_MATERIALLY_RELEVANT`;
- `UNRESOLVED`.

Classification must preserve the earlier candidate and its evidence.

### `record_acceptance_result`

**Purpose:** Record observed behavior for an acceptance case and adjudicate it as pass, fail, or unresolved.

Failure remains evidence and must not be deleted or rewritten after the fact.

## 6. Readiness and sealing operations

### `run_readiness_check`

**Purpose:** Compute whether the workspace satisfies the governing conditions for `READY_TO_SEAL`.

This operation is service-governed. The AI carrier may request it but may not dictate the result.

The check must examine at minimum:

- boundary status;
- material closure coverage;
- blocking unknowns;
- blocking contradictions;
- authority/responsibility coverage;
- standing-law/current-position separation where material;
- consequential transition interpretability;
- unresolved blocking Ledger topology;
- required acceptance results;
- provenance sufficiency for material established assertions.

Return:

- `ready: true|false`;
- blockers;
- non-blocking known unknowns;
- recommended next work;
- evaluated protocol version.

A passing readiness check may move the workspace to `READY_TO_SEAL` under service policy.

### `request_seal`

**Purpose:** Ask the service to create a fixed Ledger candidate release.

The service must refuse sealing unless readiness currently passes.

Where governing policy requires explicit human confirmation of the baseline, `request_seal` must trigger/require that confirmation rather than allowing an AI carrier to impersonate it.

Successful sealing must create an immutable release reference and move the workspace to `SEALED` without deleting the underlying Foundry history.

Sealing does **not** activate an Atlas Ledger.

### `export_workspace`

**Purpose:** Produce a portable representation of the workspace suitable for Baton fallback, transfer, audit, or import into another conforming Foundry carrier.

Export must preserve stable IDs, record stages, provenance, unknowns, contradictions, closure, topology candidates, and protocol version.

### `export_sealed_candidate`

**Purpose:** Produce the fixed Ledger candidate package defined by the Ledger Exchange contract.

Only sealed workspaces may produce this artifact.

## 7. Forbidden generic operations

The connected Foundry service must not expose tools equivalent to:

- `execute_sql`;
- unrestricted `insert/update/delete`;
- direct writes to canonical Atlas Reality;
- arbitrary lifecycle-state mutation;
- arbitrary assertion-stage mutation;
- delete-history / rewrite-provenance;
- force-seal;
- create-active-ledger;
- bypass-readiness;
- impersonate-principal-confirmation.

If an implementation needs one of these powers internally, it remains a server-side implementation detail behind governed service operations and authorization checks.

## 8. Idempotence and retries

Write operations should support idempotency keys or stable operation IDs so AI/tool retries do not create duplicate testimony, assertions, contradictions, or Ledger candidates.

The service must make it possible to distinguish:

- retry of the same operation;
- new testimony that happens to repeat prior wording;
- a revised interpretation;
- a deliberate correction.

## 9. Authorization scopes

A connected implementation should prefer narrow scopes such as:

- `foundry:read`;
- `foundry:testimony`;
- `foundry:propose`;
- `foundry:reconcile`;
- `foundry:seal-request`.

No scope should imply `atlas:reality-write`.

## 10. Carrier neutrality

The operation semantics are provider-independent.

ChatGPT, Claude, Gemini, a human practitioner interface, and native Atlas may all call different transport adapters, but `record_testimony`, `submit_candidate_assertions`, `run_readiness_check`, and other operations must retain the same meaning.

Transport is replaceable. Foundry semantics are not.
