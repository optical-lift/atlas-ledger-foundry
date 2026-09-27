# Reality Grammar

Foundry represents reality with a small structural grammar and explicit derived views.

The grammar is intentionally domain-independent.

## Core constructs

### Entity

A distinguishable participant, referent, object, place, person, organization, value-bearing thing, durable role, document, account, asset, or other identifiable node that can participate in relations or events.

Entity creation does not by itself establish identity, continuity, ownership, authority, or truth.

### Relation

A typed assertion connecting one or more referents or structures.

Relations may express, among other things:

- containment;
- belonging;
- responsibility;
- authority;
- custody;
- dependency;
- source and derivation;
- identity and continuity;
- representation;
- evidence;
- support or opposition;
- timing;
- ordering;
- quantity;
- capacity;
- threshold;
- permission;
- prohibition;
- requirement;
- jurisdiction;
- commitment.

A relation type is not automatically a new primitive.

### Event

An occurrence or operation that can create, terminate, modify, preserve, transfer, divide, join, transform, execute, or otherwise affect entities and relations.

Events may have roles such as source, carrier, recipient, object, instrument, bearer, observer, authorizer, or affected party.

## Derived but mandatory views

### State / configuration

A state is a time- or context-bounded view of relation assertions.

Events explain change between configurations.

`configuration_before + event + applicable constraints → configuration_after`

### Identity / continuity

Represent continuity explicitly through relations such as:

- same as;
- different from;
- continues as;
- version of;
- copied from;
- derived from;
- supersedes.

Similarity of appearance, name, effect, content, role, or sequence does not establish identity.

### Constraint / modal structure

Represent permission, prohibition, requirement, possibility, sequence, threshold, capacity, boundary, and conditionality explicitly.

`permitted / required / possible ≠ occurred`

### Representation

A carrier may represent, denote, depict, signal, or assert something under a context.

`carrier ≠ referent`

### Evidence

Evidence connects an available observation, testimony, record, item, event, or configuration to a claim or inquiry.

`evidence ≠ reality ≠ interpretation`

### Provenance

Provenance preserves source, custody, derivation, transformation, and adjudication history.

Unknown lineage edges remain unknown rather than being invented for continuity.

### Transition / outcome

A transition is the change between configurations associated with an event and applicable constraints.

An outcome is the resulting effect or configuration.

`operation ≠ outcome`

## Epistemic status

Every material assertion must be able to remain one of:

- `ESTABLISHED`
- `CANDIDATE`
- `UNKNOWN`
- `UNRESOLVED`
- `NOT_APPLICABLE`
- `SUPERSEDED`
- `RETIRED`

Additional workflow states may exist, but no carrier may remove the ability to preserve genuine uncertainty.

## Temporal status

Where time matters, preserve whether an assertion is:

- current;
- historical;
- planned;
- expected;
- conditional;
- recurring;
- effective from a known time;
- effective until a known time;
- time-unknown.

## Foundry invariant

The goal is not to maximize the number of records.

The goal is to preserve enough typed structure that Atlas can later distinguish what exists, how it relates, what state it is in, what governs its changes, who has authority or responsibility, what is committed, what remains unknown, and what events change the field.
