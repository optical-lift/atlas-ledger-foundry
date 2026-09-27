# Atlas Ledger Exchange v0.1

**Status:** governing interchange contract  
**Version:** 0.1

Atlas Ledger Exchange is the carrier-independent handoff format between Foundry work and a sealed Ledger candidate.

It does not itself admit anything into canonical Atlas Reality.

## 1. Purpose

The exchange format must allow the same Foundry work to move lawfully between:

- manual Baton workflows;
- remote Foundry workspaces;
- different AI providers;
- human practitioners;
- native Atlas Foundry;
- final Atlas admission review.

The format must preserve structure, uncertainty, provenance, correction history, and closure rather than flattening the work into a summary.

## 2. Package forms

An exchange package may be represented as:

- a directory/archive of structured files;
- a JSON document or JSONL bundle;
- a service-generated export conforming to the same contract.

Human-readable companion files are encouraged but are not authoritative substitutes for the structured records.

## 3. Required package sections

A sealed candidate package must contain at least:

1. `manifest` — package identity and version;
2. `subject` — the reconciled subject and field boundary;
3. `sources` — evidence/source index;
4. `testimony` — preserved testimony references needed for provenance;
5. `assertions` — established structured claims included in the candidate;
6. `current_position` — as-of state/configuration claims;
7. `standing_law` — rules, constraints, modal relations, timing, dependencies, and exceptions;
8. `authority` — authority, responsibility, jurisdiction, custody, and verification relations;
9. `commitments` — active material promises/obligations where applicable;
10. `unknowns` — explicit known unknowns retained at seal time;
11. `closure` — closure register for material domains/collections;
12. `ledger_topology` — related Ledger candidates and resolved boundary decisions;
13. `acceptance` — scenario set and results used for readiness;
14. `history` — supersession/correction references necessary to reconstruct material adjudication;
15. `release` — seal declaration, version, timestamp, and authorization evidence.

## 4. Manifest

The manifest should identify at minimum:

- `exchange_version`;
- `foundry_protocol_version`;
- `package_id`;
- `workspace_id` or source workspace reference;
- `ledger_candidate_id`;
- `subject_name`;
- `field_description`;
- `as_of`;
- `sealed_at`;
- `release_version`;
- record counts by class;
- known-unknown count;
- blocking-unknown count (must be zero for a sealed ready candidate);
- acceptance summary;
- integrity/hash information where supported.

## 5. Assertion preservation

Assertions must preserve stable IDs and stage history.

The sealed package normally includes the current established projection plus references sufficient to recover how a materially consequential assertion became established.

A package must not silently erase rejected, superseded, or conflicted material when that history is necessary to understand present truth.

## 6. Unknowns

Unknown is first-class data.

A sealed Ledger candidate may contain non-blocking known unknowns.

Each retained unknown should identify:

- the unresolved question/condition;
- affected subject/domain;
- materiality;
- blocking status;
- what future observation or testimony could resolve it, when known.

## 7. Closure

The exchange package must contain explicit closure state for every material domain used in readiness review.

Absence of a closure record must be treated as `NOT_YET_RECONCILED`, never as complete.

## 8. Topology

The package must state which discovered Ledger candidates were:

- promoted as separately governable Ledger candidates;
- folded into the current Ledger;
- classified as related external reality;
- retired/not material;
- left unresolved but non-blocking.

A sealed package may not hide an unresolved topology issue that would materially duplicate or split governing truth.

## 9. Import semantics

An Atlas importer must validate before admission:

- schema conformance;
- stable identity/reference integrity;
- contradiction and blocking-unknown status;
- closure completeness;
- release/seal validity;
- authority to import;
- collision with Reality Atlas already knows;
- duplicate identity risk;
- Ledger boundary compatibility.

A structurally valid package is not automatically an admissible Ledger.

## 10. Atomicity

Atlas should treat the sealed candidate as one governed object.

If admission fails on a material integrity or authority condition, Atlas should reject or stage the candidate for reconciliation rather than partially importing a misleading subset as though the Ledger were complete.

## 11. Compatibility

Exchange versions must be explicit.

A newer Foundry implementation may read an older package only through a documented compatibility path.

It must not silently reinterpret older records under newer semantics.

## 12. Portability invariant

A person must be able to leave one AI carrier and continue with another without losing the durable Foundry state.

The exchange format belongs to the person/Foundry protocol, not to any AI provider.
