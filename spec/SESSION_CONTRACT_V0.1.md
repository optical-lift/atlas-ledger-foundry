# Foundry Session Contract v0.1

**Status:** governing carrier-session contract  
**Version:** 0.1

A Foundry session is a temporary working encounter between a human principal and a carrier such as ChatGPT, Claude, Gemini, a practitioner interface, or native Atlas.

The session is disposable. The Foundry workspace is durable.

The purpose of this contract is to let a completely fresh carrier resume useful work without receiving unrestricted database access, without requiring the human to restate preserved reality, and without allowing the carrier to rewrite the workspace as a monolithic document.

## 1. Governing principle

**Send the carrier the smallest sufficient governed context for the next material inquiry.**

A session packet is a projection over the workspace. It is not the workspace itself.

The carrier may reason over the projection, ask the human a question, preserve the answer as testimony, and submit candidate interpretations through lawful Foundry operations. It may not replace the durable workspace with its own summary.

## 2. Session start

A new or resumed session receives a `session_context` containing:

- `session_id` — temporary carrier-session identifier;
- `workspace_id`;
- `workspace_version` or checkpoint used to construct the context;
- `protocol_version`;
- `governing_order_version`;
- `generated_at`;
- current workspace lifecycle status;
- provisional subject and field;
- boundary status;
- a compact governing orientation;
- current material blockers;
- relevant established reality for the active inquiry;
- relevant unresolved records;
- relevant evidence/testimony references;
- primary next question and optional alternates;
- allowed operation names/scopes for this carrier;
- context omissions notice describing material categories deliberately not loaded into this packet.

## 3. North-star injection

Every carrier must receive enough of the current governing order to preserve the non-negotiable distinctions of Foundry.

At minimum the session orientation must preserve:

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

A carrier may retrieve fuller governing rules through `get_governing_rule` when needed.

The orientation must not include private benchmark answers, hidden evaluation controls, or research adjudication keys.

## 4. Context-selection rule

A session context should normally be built around the primary question selected by the Question Selection Engine.

For that inquiry, include:

1. the unresolved record that generated the question;
2. records directly referenced by it;
3. source/testimony records needed to understand those references;
4. current established assertions whose interpretation would change depending on the answer;
5. directly conflicting assertions/testimony;
6. material closure/topology/acceptance records affected by the answer;
7. relevant current-position and standing-law assertions needed to avoid category collapse.

Do not load unrelated low-materiality history merely because it exists.

## 5. Evidence-neighborhood rule

Relevant evidence should be selected by relationship to the inquiry, not by recency alone.

The service should prefer exact records over summaries when the exact wording materially affects interpretation.

Summaries may be supplied for context efficiency, but each summary must identify stable source records and must never replace preserved testimony or evidence.

If the service cannot determine whether omitted evidence is material to the inquiry, it should disclose that limitation and allow the carrier to request `get_relevant_evidence` rather than silently treating the context as exhaustive.

## 6. Stable reality projection

The session context may include a compact projection of established Foundry assertions.

This projection should prioritize:

- identities and continuity distinctions relevant to the inquiry;
- authority/responsibility/custody relations;
- current state relevant to the inquiry;
- standing law and conditions relevant to the inquiry;
- Ledger boundaries/topology relevant to the inquiry;
- active commitments or dependencies relevant to the inquiry.

The projection must keep stable record IDs so the carrier can cite its basis in later operations.

## 7. Conversation-turn rule

A human answer enters Foundry in two ordered stages.

### Stage A — preserve testimony

For a normal `session_turn`, the session processor must preserve `human_input` through the lawful `record_testimony` semantics **before** executing any interpretation operation from that turn.

The turn supplies a reserved local `testimony_alias` such as `$turn_testimony`. The processor binds that alias to the stable testimony ID created during Stage A.

This means a carrier can propose interpretations in the same turn without guessing the future testimony ID. Any `basis_refs` containing the turn-local alias are resolved to the created testimony record before those operations execute.

If testimony preservation fails, interpretation operations from that turn must not execute.

The preserved testimony should retain exact or recoverable wording whenever practical.

### Stage B — propose interpretation

Only after the testimony alias has been resolved may the carrier's bounded interpretation operations execute, such as:

- `submit_candidate_assertions`;
- `record_unknown`;
- `record_contradiction`;
- `record_ledger_candidate`;
- `record_acceptance_case`;
- governed reconciliation operations when the carrier has the required authority.

Candidate interpretations must cite the testimony/source records they depend on, either by stable ID or by the resolved turn-local testimony alias.

The carrier must not rewrite the user's answer into structured truth and discard the original testimony.

A carrier may still call `record_testimony` directly outside the session-turn envelope for source recovery or other governed intake. The automatic Stage A rule applies specifically to a conversational `session_turn`.

## 8. No whole-workspace replacement

A carrier must never be asked to return a complete replacement workspace after every conversational turn.

The lawful write pattern is a sequence of bounded operations against stable records.

This prevents:

- accidental deletion of records omitted from model context;
- renumbering stable identity;
- collapsing unknown into none;
- overwriting provenance;
- rewriting contradiction history;
- one model's summary style becoming durable ontology.

The Baton remains an exception only because it is a portable fallback carrier for the entire state; even there, Baton preservation rules apply.

## 9. Concurrency and stale context

Every session context must identify the workspace version/checkpoint it was built from.

If a carrier submits an operation against materially changed state, the service may:

- accept it when the operation is append-only and still valid;
- re-evaluate it against the current workspace;
- return `NEEDS_CONFIRMATION`, `BLOCKED`, or `UNRESOLVED`;
- require a refreshed session context.

A stale AI context never grants authority to overwrite newer reality.

## 10. Session resumption

A new carrier or new chat may resume by calling `resume_workspace`.

The human should not need to paste the prior conversation or recount already-preserved information.

The returned packet should make it possible for the carrier to say, in ordinary language, approximately:

> I have the current Foundry state. The most important unresolved issue is X because Y depends on it. Here is the next question.

The carrier should not recite the entire workspace unless the human asks for a review.

## 11. Session end

The service, not the AI's conversational memory, is responsible for durable continuity.

At session end there is no required summary upload if all consequential testimony and candidate operations have already been recorded.

A carrier may optionally record a non-authoritative session note, but it must not substitute for the structured operations performed during the session.

## 12. Privacy/minimum-disclosure rule

The session packet should disclose only workspace information required for the current inquiry and lawful carrier function.

A future authorization layer may further constrain records by sensitivity, role, Ledger field, or source permission.

Carrier convenience is not sufficient reason to disclose the entire Foundry workspace.

## 13. Carrier neutrality

The same session contract applies whether the carrier is an external AI, practitioner interface, or Atlas itself.

Provider context windows, memory features, system prompts, and UI conventions are transport details.

The durable invariant is:

`workspace state → governed session projection → human testimony → bounded Foundry operations → updated workspace state`

The conversation is a working surface. The workspace is custody.
