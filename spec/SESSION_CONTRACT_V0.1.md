# Foundry Session Contract v0.1

**Status:** governing carrier-session contract  
**Version:** 0.1

A Foundry session is a temporary working encounter between a human principal and a carrier such as ChatGPT, Claude, Gemini, a practitioner interface, or native Atlas.

The session is disposable. The Foundry workspace is durable.

## 1. Governing principle

**Send the carrier the smallest sufficient governed context for the next material inquiry.**

A session packet is a projection over the workspace. It is not the workspace itself. The carrier may reason over the projection, ask the human a question, preserve the answer as testimony, submit an interpretation plan, and request adjudication. It may not replace the durable workspace with its own summary or force a truth-changing disposition.

## 2. Session start

A new or resumed session receives a `session_context` containing:

- session/workspace/checkpoint/protocol identity;
- provisional subject and field;
- boundary and lifecycle status;
- compact governing orientation;
- current material blockers;
- relevant established reality;
- relevant unresolved records;
- relevant evidence/testimony refs;
- primary next question plus operator metadata and optional alternates;
- allowed operations/scopes;
- an omissions notice explaining that the packet is partial.

## 3. North-star injection

At minimum the carrier must preserve these distinctions:

- function before inherited label;
- source is not carrier;
- evidence, interpretation, and reality are distinct;
- role is not bearer;
- access/capability is not authority;
- state is not event;
- operation is not outcome;
- possibility/permission/requirement/expectation are not occurrence;
- unknown is not none;
- similarity is not identity;
- success does not establish lawful method;
- a new named thing is not automatically a new Ledger;
- faithful incompleteness is superior to invented completeness.

Private benchmark answers, hidden evaluation controls, and research adjudication keys do not enter the carrier orientation.

## 4. Context selection

Build the session around the primary question selected by Question Selection and its Question Operator.

Include the smallest evidence neighborhood needed to avoid category collapse: the target unresolved record, directly referenced records, material source/testimony wording, established assertions whose meaning depends on the answer, conflicts, relevant topology/closure/acceptance records, and required current-state/standing-law distinctions.

Do not load unrelated low-materiality history merely because it exists.

## 5. Evidence-neighborhood rule

Relevant evidence is selected by relationship to the inquiry, not recency alone.

Prefer exact records over summaries when exact wording materially affects interpretation. Summaries must retain stable source refs and never replace testimony/evidence.

If material omitted evidence might exist, disclose that limitation and allow `get_relevant_evidence` rather than treating the packet as exhaustive.

## 6. Conversation-turn rule

A normal human answer enters Foundry in three ordered stages.

### Stage A — preserve testimony

The session processor preserves `human_input` through `record_testimony` semantics **before** any interpretation/adjudication work from that turn.

The turn supplies a local alias such as `$turn_testimony`. The processor binds it to the created stable testimony ID. If preservation fails, later stages do not execute.

### Stage B — interpretation

After the testimony alias resolves, the carrier may submit a bounded `interpretation_plan` describing what the preserved answer **could** structurally mean.

The plan may propose findings, assertions, unknowns, contradictions, discrepancies, signals, competing interpretations, topology implications, signposts, and dependency roots.

The carrier may not establish those proposals merely by including them in the plan.

`difference ≠ correction`

`signal ≠ assertion`

`interpretation ≠ adjudication`

### Stage C — governed adjudication

The service evaluates the interpretation/reconciliation plan against current workspace state, provenance, authority, materiality, discrepancies, signals, and dependency structure.

Conservative effects that make uncertainty explicit may be authorized without pretending certainty. Truth-changing effects require lawful confirmation/adjudication authority.

The result is an append-preserving `structural_delta` plus residual gaps. The carrier cannot directly apply that delta or force a disposition.

## 7. Turn-local testimony references

Candidate interpretation records in the same turn may cite `$turn_testimony`. The service resolves the alias to the stable testimony ID before validating basis refs.

This prevents the carrier from inventing future IDs while preserving the rule that interpretation cannot outrun custody.

## 8. No whole-workspace replacement

A carrier never returns a complete replacement workspace after every turn.

The lawful pattern is:

`workspace projection → testimony → case/interpretation plan → adjudication → bounded delta`

This prevents accidental deletion, identity renumbering, unknown-to-none collapse, provenance rewrite, contradiction-history loss, and model-summary style from becoming ontology.

## 9. Concurrency and stale context

Every context identifies the workspace version/checkpoint it was built from.

If state has materially changed, the service may accept still-valid append-only testimony, re-evaluate proposals, require confirmation, block adjudication, or require refresh. A stale carrier context never gains authority to overwrite newer state.

## 10. Session resumption

A new carrier/chat may call `resume_workspace` without requiring the human to paste prior conversations.

The carrier should be able to say, approximately:

> I have the current Foundry state. The most important unresolved issue is X because Y depends on it. Here is the next question.

It should not recite the whole workspace unless asked.

## 11. Session end

Durable continuity belongs to Foundry, not model memory.

No summary upload is required if consequential testimony, interpretation plans, and governed case results were recorded. Optional session notes remain non-authoritative.

## 12. Privacy / minimum disclosure

Disclose only workspace information needed for the current inquiry and lawful carrier function. Carrier convenience is not sufficient reason to expose the whole Foundry workspace.

## 13. Carrier neutrality

The same contract applies to external AI, practitioner interface, and native Atlas.

The durable invariant is:

`workspace state → governed session projection → preserved testimony → interpretation → adjudication → structural delta → updated workspace state`

The conversation is a working surface. The workspace is custody.
