# Foundry Answer-Processing Operations v0.1

**Status:** service-operation extension  
**Version:** 0.1

This contract extends the Foundry service surface for the interpretation → adjudication → structural-delta pipeline.

## `open_case`

Creates or joins a bounded adjudication case around preserved testimony/source material and the active question/operator context.

May not establish assertions, resolve contradictions, or alter canonical Atlas Reality.

## `get_case`

Returns the governed case projection: origin refs, findings, discrepancies, signals, competing interpretations, dispositions, dependency impacts, structural delta, and residual issues.

## `submit_interpretation_plan`

Allows an authorized carrier to propose what preserved testimony could structurally mean.

The plan may contain findings, candidate assertions, candidate unknowns, candidate contradictions, discrepancies, signals, competing interpretations, topology implications, signposts, and proposed dependency roots.

Submission does **not** establish any candidate or authorize a truth-changing disposition.

## `request_case_adjudication`

Requests governed adjudication of an interpretation/reconciliation plan against current workspace state.

The carrier may request adjudication but may not dictate the result.

## `adjudicate_case`

Service/governed-confirmation operation that evaluates proposed dispositions, authority, evidence sufficiency, discrepancy/signal state, and dependency impacts.

Conservative effects may be authorized without pretending certainty where they only make uncertainty explicit, such as:

- opening an unknown;
- opening a contradiction;
- opening a signal;
- requesting more evidence;
- escalating evidence requirements;
- recording explicit no-change.

Truth-changing effects require lawful confirmation/adjudication authority, including:

- confirming/correcting/superseding an assertion;
- scoping/temporalizing/conditionalizing established structure;
- splitting/merging identity or structure;
- resolving an unknown/contradiction/signal;
- reopening established dependent structure.

The operation returns dispositions, dependency impacts, structural delta, residual blockers, and required confirmation/evidence.

## `get_structural_delta`

Returns the append-preserving delta produced by an adjudicated case.

A structural delta is a change description, not permission for a carrier to replace the workspace.

## Forbidden carrier operations

No external carrier receives operations equivalent to:

- `force_disposition`;
- `apply_structural_delta_directly`;
- `mark_case_closed_without_basis`;
- `delete_discrepancy`;
- `delete_losing_evidence`;
- `silently_resolve_signal`;
- `skip_dependency_review`.

The service applies authorized deltas through internal implementation mechanisms only.
