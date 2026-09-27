# Baton Protocol

The Baton is the portable continuity format for Foundry when no connected Foundry workspace is available.

It allows a human to move between disposable AI sessions without relying on the AI provider's memory.

The Baton is not a conversational summary. It is a structured checkpoint of the Foundry state.

## Governing rule

**The file is the memory. The AI session is disposable.**

A new AI session must be able to continue Foundry work using only:

1. the Foundry governing instructions;
2. the latest Baton;
3. any newly supplied source material.

## Required Baton sections

A Baton should preserve at least:

- protocol version;
- Ledger candidate name or subject;
- checkpoint identifier;
- as-of time;
- provisional boundary;
- source index;
- established entities;
- established relations;
- established events and current states;
- standing rules and constraints;
- authority and responsibility;
- commitments;
- explicit absences / not applicable domains;
- known unknowns;
- unresolved candidates;
- contradictions;
- Ledger candidates / topology questions;
- closure register;
- acceptance work completed;
- next most useful questions;
- correction and supersession history sufficient to preserve provenance.

## Preservation rules

When updating a Baton:

- do not remove established records merely to shorten it;
- do not collapse multiple material relations into prose;
- do not remove an unknown because it was not discussed this session;
- do not convert a candidate into established truth without the required basis;
- do not convert missing information into none;
- do not renumber stable records merely for neatness;
- preserve superseded or retired records when they remain relevant to history;
- preserve contradictions until they are actually reconciled;
- preserve Ledger topology candidates until classified.

## Session workflow

At the beginning of a session:

1. read the governing instructions;
2. read the entire current Baton available to the session;
3. identify the current Ledger field, open holes, and next useful question;
4. continue without asking the human to restate already preserved information.

During the session:

1. preserve new testimony;
2. extract candidate structure;
3. reconcile or flag ambiguity;
4. update closure and topology state;
5. avoid relying on chat memory as the sole durable record.

At the end of the session, or whenever the human asks for the Baton:

1. emit a complete replacement Baton;
2. include all prior durable state plus this session's lawful changes;
3. identify the next useful unresolved work;
4. increment the checkpoint.

## Suggested checkpoint header

```text
ATLAS_FOUNDRY_PROTOCOL: <version>
LEDGER_CANDIDATE: <name>
CHECKPOINT: <stable sequence>
AS_OF: <timestamp/date>
```

## Connected-workspace equivalence

A connected Foundry service may store the same conceptual state remotely instead of requiring the human to move a file.

The Baton remains the portable export/fallback representation of that workspace.

A connected implementation must not weaken the Baton invariants merely because persistence is automatic.

## Handoff invariant

The human must be able to change AI carriers without losing the Foundry state.

AI provider memory is optional. Foundry continuity is not.
