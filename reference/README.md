# Reference Engines

This directory contains storage-free reference logic for Atlas Ledger Foundry.

It is not the production Foundry Service. It exists so governing behavior can be executed before persistence, MCP, OAuth, or Atlas-native implementation exists.

## Files

- `foundry-engines.mjs` — deterministic Question Selection and Readiness reference functions.
- `session-context.mjs` — bounded resume-packet projection for a fresh carrier.
- `self-test.mjs` — executable checks proving priority and readiness behavior against synthetic workspaces.
- `session-self-test.mjs` — executable checks proving session context stays bounded, includes the governing orientation, carries stable evidence references, and excludes unrelated low-materiality history.

## Run locally

With Node.js 20+:

```bash
node reference/self-test.mjs
node reference/session-self-test.mjs
```

No database, network access, package install, or Atlas credentials are required.

## Design rule

A later implementation may be more sophisticated, but it must preserve the governing semantics in `spec/QUESTION_SELECTION_V0.1.md`, `spec/READINESS_ENGINE_V0.1.md`, and `spec/SESSION_CONTRACT_V0.1.md`.

The reference implementation is deliberately conservative. It does not infer absent material domains, silently establish assertions, decide readiness from record count, or hand a carrier the entire workspace merely for convenience.

An AI may help generate candidate gaps, natural-language phrasing, and proposed structure, but the service retains an inspectable layer for consequential priority, readiness, context selection, and authority gates.
