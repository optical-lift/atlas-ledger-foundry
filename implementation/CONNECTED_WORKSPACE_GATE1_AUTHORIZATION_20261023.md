# Connected Foundry Workspace — Gate 1 authorization contract and acceptance

**Status:** source-only reference implementation / candidate; no production authorization, migration, MCP endpoint, or workspace creation
**Date:** October 23, 2026
**Companion:** Gate 0 [audit PR #1](https://github.com/optical-lift/atlas-ledger-foundry/pull/1)
**Source context:** Atlas main `bdfb5e117b42f0c22f20565437175e36b733336a`; Noel main `6ebde9a810152be9c5e51c674229df9f1483b004`; Foundry main `7d87fd90909c0e67460ba845b67424129e00baf3`.

## Deliverable

`reference/connected-authority.mjs` is a **pure, storage-free, fail-closed policy reference**, with negative tests in `connected-authority-self-test.mjs`. It is **not sufficient to authenticate a caller**, cannot distinguish genuine server facts from spoofed input, and must **not** be used as an authorization gate on raw MCP/HTTP input. The protected API must resolve its `trusted` facts itself, using server-owned authenticated session, principal, canonical identity, workspace registry and delegated-agent records. Call this function **only after** verifying those facts.

The ten admitted v0.1 operations are exact explicit allowlist entries, not a generic SQL/data-write surface. All allowed effects are pre-Ledger only. `confirm_assertion`, `request_seal`, generic mutations, and every Atlas canonical Reality write are not admitted.

## Interpretation of the existing Foundry contract

Keep `workspace.owner_principal_id` and the operation envelope `principal_id` as the **custody-owning authenticated Atlas Principal** whose authorization directs the onboarding work. That Principal does not necessarily equal the external **subject** being studied. The subject stays in `workspace.provisional_subject` with unresolved identity permitted.

Four roles remain distinct:

1. **Subject:** a Person or field of life/work under inquiry, perhaps without login, not inferred from label/email.
2. **Source/consenting human:** gives testimony or authorizes custody to a particular scope; consent provenance must be independently reviewable.
3. **Authenticated human operator / workspace owner:** uses their own Atlas Principal, not the subject's.
4. **Delegated AI carrier:** uses its provider identity plus a revocable workspace-scoped authorization, without becoming a Principal.

For a third-party subject, the workspace needs a **server-adjudicated source-custody scope** and basis refs. This authorizes *collecting and proposing* within bounds, not acting or confirming on the subject's behalf. Do not treat a supplied `basis_refs` array, a name, a message excerpt, or a user's ability to access a document as automatically sufficient authorization. First establish the source/authority receipt through a human-governed path.

A self-subject workspace must have server-verified canonical owner/subject identity; client declaration `verified_self` is not evidence.

## Reuse the real Atlas delegated-agent kernel

Live `atlas.delegated_agent_carriers`, `atlas.delegated_agent_authorizations`, `atlas.delegated_agent_credentials`, `atlas.agent_command_definitions`, and command invocation receipts remain the delegated-agent source. Do **not** create independent `foundry.agent_tokens` or parallel bearer-token grants.

Current command-definition scope CHECK admits `personal|ledger|either`, and the live command catalog has only Ledger commands. The new reference policy uses conceptual `foundry_workspace` **as a deliberate proposed scope, NOT a currently executable DB value**. Before release, a separately reviewed noel-core-db migration must extend the existing command scope/evaluators (or prove a semantics-equivalent existing scope). Reusing `personal` merely to make a null Ledger ID pass is not acceptable without confirming its meaning and workspace target containment.

The existing target evaluator checks supplied target kind/ID and optional allowlists; it does not independently query a Foundry workspace's owner/subject scope. Therefore a pre-Ledger target must be checked against a **server-owned workspace registry**, not trusted simply because `p_target.id` is allowlisted.

## Narrow persistence delta for next source candidate (not executed here)

The existing five historical `foundry.events` streams (93 events, five snapshots, 20 legacy-shaped envelopes, one snapshot behind events) must remain untouched. No retroactive default `owner_principal_id` or synthetic consent basis may be inferred.

For **new** connected workspaces only, propose a private `foundry.workspace_registry` holding:

- `workspace_id` text stable key; `owner_principal_id` references authenticated `atlas.principals`;
- `provisional_subject` (label + optional validated canonical subject reference), `provisional_field`, protocol version and lifecycle state;
- **server-reviewed subject source-custody decision** and immutable basis/receipt refs, distinct from final subject reality authority;
- created/revoked timestamps and a mechanism for suspension or correction without history deletion.

A new workspace is created through an authenticated protected command that verifies the owner Principal, subject-custody basis and protocol version; it generates the workspace ID server-side; it creates a registry record and a compliant `WORKSPACE_CREATED` event atomically. Direct table grants to `anon`/`authenticated` stay absent, RLS defense-in-depth must be reviewed, and security-definer command paths must have explicit grants and safe search paths.

Use an **existing** Atlas carrier delegation directed at that exact workspace to authorize calls. Operator != owner requires its own explicit, independently established human authority relation; the reference function models this as a verified operator grant, but the database route is NOT installed and must fail closed until it exists. For the first David pilot, the authenticated operator can own custody of the workspace with David as provisional subject; the AI carrier is then delegated *by the operator* and David's confirmation authority remains separate.

For any existing/unregistered historical workspace, do not bootstrap an owner from text or an old event. Return `legacy_workspace_reconciliation_required` until its authority/custody is reviewed.

## Boundaries for the production service

- The API authenticates a human or carrier and derives canonical actor IDs itself; a caller's `principal_id`, `carrier_id`, `workspace_id` are claims to compare, never authority.
- The service loads the current registry, verified subject-scope receipt and permitted operation grants in the same trusted server boundary. No `trusted` structure is accepted from the client.
- Carrier grants are exact operation allowlists, exact target workspace, effective time, and revocable.
- A carrier may record testimony/propose candidates but never `ESTABLISHED`, confirmation, closure, sealing, Ledger creation or Atlas domain change under Gate 1.
- Full source custody must survive candidate-validation failure. Historical event stores are append-preserving, and snapshots are rebuildable projections.
- Only a later canonical owning-domain command may establish Atlas Reality, under its own authority gates.

## Acceptance

Run `node --test reference/connected-authority-self-test.mjs` on Node 20+. The reference has cases for owner/operator/carrier attribution, prohibited operation, spoofed IDs, wrong workspace, revoked/wrong-scope/time-expired delegation, missing subject-custody basis, non-admitted historical status, sealed read-only lifecycle, and external operator authorization.

A pass proves **only this pure authorization decision on supplied trusted facts**. It does not prove the DB really validates those facts or that the API is operational. Before releasing, add production-schema-clone and authenticated denial tests exercising server-derived identity and tenant isolation, concurrent creation and retry, provenance-reconciled legacy streams, and no canonical Atlas mutation.

## Next executable step

In `noel-core-db` (once the neighboring identity database tranche is clear), prepare the smallest schema/command **source candidate** and rollback-only clone tests to resolve new workspace owner, third-party source-custody receipt, Foundry target authorization and existing delegated-agent command scope. Do not touch production until protected generation/clone/release approval. Then wire the authenticated Atlas dispatcher and finally MCP.
