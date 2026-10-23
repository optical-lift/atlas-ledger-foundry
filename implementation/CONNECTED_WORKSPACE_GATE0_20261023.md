# Connected Foundry Workspace — Gate 0 contract audit

**Status:** source-only implementation gate / NOT an admitted service, migration, or production release  
**Audit date:** 2026-10-23  
**Foundry source:** `optical-lift/atlas-ledger-foundry@7d87fd90909c0e67460ba845b67424129e00baf3`  
**Atlas source inspected:** `optical-lift/atlas@cca65d32cf9dc4d1d021413457a045e998243fe4`  
**Noel DB source inspected:** `optical-lift/noel-core-db@6ebde9a810152be9c5e51c674229df9f1483b004`  
**Live database:** `noel-core`, read-only inspection; current migration tail includes `20261023163914`.

## Objective and boundary

Establish the first **connected, durable, pre-Ledger** Foundry discovery loop usable by an authenticated Atlas operator and an explicitly authorized AI carrier. The tool session may end; the workspace, source custody, uncertainties, and selected next inquiry must persist.

**No customer-specific schema, no production mutation, no Atlas Ledger creation, no generic SQL/CRUD MCP tool, and no AI promotion to canonical Atlas Reality.**

This is the mandatory contract gate before building the public API/MCP adapter. It is deliberately **not** a new governing protocol. The standing authority is `spec/FOUNDRY_SERVICE_OPERATIONS_V0.1.md`, `spec/SESSION_CONTRACT_V0.1.md`, and the rest of Foundry's existing governing documents.

## Verified live facts

1. Private `foundry.events` and `foundry.snapshots` tables and the following DB functions already exist: `foundry.append_event`, `foundry.has_event`, `foundry.read_events`, `foundry.write_snapshot`, `foundry.read_latest_snapshot`. A direct count (not the approximate `list_tables` row estimates) found **93 events across five workspaces and five snapshots**: event timestamps span 2026-09-27 through 2026-10-15, and the most recent snapshot was written 2026-10-15. These records predate this audit and need a provenance/lifecycle inventory before any schema change. This is persistence, **not** evidence of a connected Foundry API/MCP service.
2. `foundry.append_event` requires a caller-supplied positive contiguous sequence and stable `event_id`. Exact identical replay returns `REPLAYED`; reusing an ID with different content rejects; workspace sequencing is serialized with an advisory transaction lock.
3. `foundry.write_snapshot` refuses a future event sequence and a regression below the prior snapshot, but a separate append followed by a snapshot write is **not one atomic transaction**. Snapshots are rebuildable projections; the event log is authoritative. A connected service must read/replay unprojected events and must not report snapshot currency until verified.
4. The two Foundry tables currently have RLS disabled. The inspected direct table grants list only `postgres` (not `anon` or `authenticated`); the Foundry service RPC grants list only `postgres` and `service_role`. Absence of direct grants is *not* proof of all security boundaries. Before any public bridge, verify schema exposure, grants, RLS defense-in-depth, RPC definer boundaries, authorization and negative tests. Do not open direct table access.
5. Atlas has `atlas.delegated_agent_carriers`, `atlas.delegated_agent_authorizations`, `atlas.delegated_agent_credentials`, command definitions, authority evaluators, invocation custody, and principal confirmation. The current command catalog observed at audit contained only `scope_kind='ledger'` commands, and the authorization table requires an existing `atlas.principals` row.
6. The existing delegated-command evaluator requires a Ledger-scoped authorization for Ledger commands. `ledger_id = NULL` does not manufacture pre-Ledger Foundry authorization. Registered carrier credentials are not automatically authorized to inspect an unrelated workspace.
7. Atlas Person identity, `atlas.principals`, canonical Reality Person/Auth bindings, and the October 23 existing-Person account-claim / transition-readiness work must be preserved. Login, Person, account claim, Ledger context, responsibility, institution relationship, and source testimony are not synonyms. Source, validated migration, feature flag, and live release are independent receipts.
8. There is currently **no** connected `foundry.start_workspace`, `foundry.resume_workspace`, `foundry.record_source`, `foundry.record_testimony`, or `foundry.get_next_question` DB service operation.
9. Foundry's storage-free reference engines, answer-processing, question-selection, session-context, and Mock Relay are available and must not be reimplemented inside MCP.
10. Existing Atlas Implementation Reality Candidate and first-day Reality Discovery systems do not automatically create a Foundry workspace. They remain distinct evidence/admission systems.

## Critical authority question (requires implementation disposition before schema)

The existing Foundry v0.1 operation envelope contains `principal_id`, but a pre-Atlas external subject may not possess an Atlas Principal or Auth account. Do **not** quietly reinterpret `principal_id` as any one of these:

- **Subject:** whose world is being studied, possibly provisional and unverified;
- **Source/consenting human:** whose testimony or documented authorization warrants processing;
- **Authenticated operator:** the person carrying out work, with their own Atlas identity;
- **Carrier:** ChatGPT/Atlas/practitioner technical client, never the source of human authority.

**Preferred proposed resolution, not yet an approved v0.1 contract change:** assign workspace IDs independently; retain a provisional **subject reference** with explicit canonical-resolution state, not a second canonical Person; authenticate and authorize the operator on the server; preserve the external subject's consent/authorization **basis and scope**; bind a separately authorized carrier to the workspace. A future subject→Person link is a governed identity-resolution event, not a merge by name/email and not account creation.

Do not create `foundry.principal_subjects` as a duplicate of `atlas.people` / canonical Reality Person. Do not call the operator's existing Atlas Principal the subject's Principal. Before implementation select and document an exact, versioned envelope mapping/backwards-compatibility approach for `principal_id`; a provider-supplied value is never authoritative.

## Proposed first connected surface

Read: `get_foundry_orientation`, `resume_workspace`, `get_workspace_state`, `get_next_question`.

Write: `start_workspace`, `record_source`, `record_testimony`, `submit_candidate_assertions`, `record_unknown`, `record_ledger_candidate`.

Every operation is authenticated by the server, authorized for the exact workspace and operation, version-checked, evidence-linked where required, idempotent on stable IDs, and append-preserving. A candidate can never establish Atlas canonical truth by itself.

The MCP adapter must call the **same service** as Atlas-native/implementation carriers, have no database credentials, and contain no independent Foundry adjudication rules.

## Safe build sequence

**Gate 0 — this audit:** reconcile exact live production migration tail and protected source heads; classify existing identity and delegated-agent command authority; freeze the outstanding pre-Ledger authorization decision.

**Gate 1 — authority foundation:** choose the narrowest reuse/extension of canonical Atlas identity and delegated-agent machinery that permits a pre-Ledger workspace, including legitimate operator-over-external-subject basis, scope, revocation, and independent carrier credentials. Validate in isolated/disposable tests before source migration promotion.

**Gate 2 — durable workspace:** workspace registry only if needed for access/indexing; no duplicate truth state; atomic or replay-recoverable event/snapshot reducer contract; no blind trust of client-supplied sequence/version.

**Gate 3 — API:** one versioned governed operation dispatcher, closed allowlist, protocol/schema validation, server-derived actors, source custody, idempotency, bounded resume projection and reference-engine compatibility.

**Gate 4 — MCP:** thin external adapter, secure authentication/authorization, workspace isolation, verified protocol/version support and user-controlled revocation.

**Gate 5 — acceptance:** synthetic authorized subject/operator/carrier, synthetic external subject, denial cases, parallel retries, stale snapshot reconstruction, testimony surviving failed interpretation, unrelated-workspace isolation, no Ledger or canonical Atlas writes, fresh-carrier resume. Only then consider consented real customer onboarding.

## Mandatory negative tests

- Carrier chooses a different `principal_id` or `workspace_id` in the envelope → server refuses unauthorized cross-workspace access.
- Operator has an active Atlas Principal but no valid authority basis for the external subject → no subject impersonation or canonical identity claim.
- Missing, expired, revoked, or wrong-scope carrier authorization → no read or write.
- Existing Person is named in a document, but not canonically resolved → no new Person and no match by display name/email.
- An existing canonical Person is subject of external onboarding but has no Auth account → may remain a properly authorized pre-Ledger subject; do not require login or create duplicate Person.
- Repeated event ID + same payload → safe replay; same event ID + changed content → reject.
- Contiguous events newer than the snapshot → rebuild projection; don't claim stale snapshot is current.
- Failed candidate assertion due to missing source/testimony basis → custody survives; no assertion promoted.
- Mentioning a program, place, organization, property or project → no automatic Ledger creation.
- AI model/provider offline → authorized manual testimony/candidate path remains operable.
- Unexpected model output, invalid operation, arbitrary SQL, generic mutation, force-seal, canonical Atlas write → fail closed.

## Release and concurrency rule

No SQL mutation and no production deployment is authorized by this document. The adjacent Person/Auth and Ledger-context identity build is active; future implementation must refresh migrations and source SHAs immediately before opening its database tranche. Protected source merge, migration publication, actual database release, and authenticated application proof are four different statuses.

**Gate 0 is done when this inventory is source-controlled and the exact pre-Ledger authority/envelope disposition is selected. Gate 1 is *not* done by writing this document.**
