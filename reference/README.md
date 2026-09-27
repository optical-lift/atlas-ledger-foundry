# Reference Engines

This directory contains storage-free reference logic for Atlas Ledger Foundry.

It is not the production Foundry Service. It exists so governing behavior can be executed before persistence, MCP, OAuth, or Atlas-native implementation exists.

## Files

- `foundry-engines.mjs` — deterministic Question Selection and Readiness reference functions.
- `question-operators.mjs` — the fourteen-operator inquiry library, operator selection, escalation modifiers, and question rendering.
- `answer-processing.mjs` — cases, interpretation validation, conservative-vs-truth-changing adjudication gates, dependency impact, and structural-delta construction.
- `session-context.mjs` — bounded resume-packet projection for a fresh carrier.
- `self-test.mjs` — priority and readiness checks.
- `operator-self-test.mjs` — every question operator plus bidirectional completeness and signpost behavior.
- `answer-self-test.mjs` — authority scoping, explicit new unknowns, dependency reopening, signals, and no-change behavior.
- `session-self-test.mjs` — bounded session context and operator-aware resume behavior.

## Run locally

With Node.js 20+:

```bash
node reference/self-test.mjs
node reference/operator-self-test.mjs
node reference/answer-self-test.mjs
node reference/session-self-test.mjs
```

No database, network access, package install, or Atlas credentials are required.

## Design rule

A later implementation may be more sophisticated, but it must preserve the governing semantics in the public specification.

The reference implementation is deliberately conservative. It does not infer absent material domains, silently establish assertions, decide readiness from record count, let a carrier force a truth-changing disposition, or hand a carrier the entire workspace merely for convenience.

An AI may help generate candidate gaps, natural-language phrasing, interpretation plans, discrepancies, signals, and proposed dispositions. The service retains an inspectable layer for priority, operator selection, answer adjudication, dependency impact, readiness, context selection, and authority gates.
