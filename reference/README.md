# Reference Engines

This directory contains storage-free reference logic for Atlas Ledger Foundry.

It is not the production Foundry Service. It exists so governing behavior can be executed before persistence, MCP, OAuth, or Atlas-native implementation exists.

## Files

- `foundry-engines.mjs` — deterministic Question Selection and Readiness reference functions.
- `self-test.mjs` — executable checks proving priority and readiness behavior against synthetic workspaces.

## Run locally

With Node.js 20+:

```bash
node reference/self-test.mjs
```

No database, network access, package install, or Atlas credentials are required.

## Design rule

A later implementation may be more sophisticated, but it must preserve the governing semantics in `spec/QUESTION_SELECTION_V0.1.md` and `spec/READINESS_ENGINE_V0.1.md`.

The reference implementation is deliberately conservative. It does not infer absent material domains, silently establish assertions, or decide readiness from record count.

An AI may help generate candidate gaps and natural-language phrasing, but the service retains an inspectable layer for consequential priority and readiness gates.
