# Canon-Governed Discovery Intake v0.1

**Status:** governing intake operations contract  
**Version:** 0.1

This contract defines how an ingesting AI turns new testimony into Foundry questions without using the person's declared industry as an ontology template.

## 1. Intake sequence

For every new field or materially new testimony:

`preserve testimony`
→ `extract supported structural observations`
→ `map observations to canon discovery lenses`
→ `generate candidate gaps`
→ `rank gaps`
→ `select Question Operator`
→ `ask one ordinary-language question`
→ `preserve answer`
→ `adjudicate bounded effects`
→ `measure residual gap`

Question Selection still decides what matters next. The discovery grammar decides what kinds of structural gaps may be noticed upstream.

## 2. Preserve testimony before interpretation

The person's own wording is evidence.

Do not rewrite testimony into industry-standard language before preserving it.

If the person says:

> We hand it to Anna once the beds are ready.

preserve that wording before proposing any interpretation about custody, readiness, responsibility, transfer, or authority.

## 3. Structural observation contract

The ingesting AI may emit a `discovery_observation` only when it can cite preserved evidence.

Recommended shape:

```json
{
  "observation_id": "OBS-001",
  "discovery_lens": "CUSTODY",
  "subject_label": "responsibility for the work",
  "description": "Testimony describes responsibility moving from one bearer to another.",
  "supporting_refs": ["T-001"],
  "cluster_refs": [],
  "materiality": "HIGH",
  "blocking": false,
  "industry_assumption": false
}
```

An observation is not an established assertion.

## 4. Industry handling

A declared industry may be stored as testimony or context.

It may influence:

- word sense;
- source retrieval;
- question phrasing.

It must not generate a gap merely because the industry usually contains a familiar structure.

The ingesting AI must be able to state:

`What preserved evidence activated this lens?`

If the answer is only “businesses in this industry usually work this way,” the candidate is invalid.

## 5. Gap generation

A valid observation may generate a candidate gap with:

- `discovery_lens`;
- `supporting_refs`;
- `cluster_refs`;
- `industry_assumption: false`;
- priority hint;
- operator hint;
- subject label;
- ordinary-language reason.

Question Selection may re-rank the priority. The lens's default operator is a hint, not an override of the governing operator-selection rules.

## 6. Cluster behavior

Multiple observations may activate one stronger gap.

A cluster must cite all participating observations or their testimony basis.

Do not convert a cluster into an established law without reconciliation.

## 7. Repair operator

`REPAIR` is a first-class Question Operator.

Its semantic job is to determine:

`breach → detection → authorized restoration → restored-state test`

Use `REPAIR` when the unresolved distinction concerns restoration after a failed, damaged, invalid, rejected, or breached state.

Do not substitute `EXCEPTION`. An exception changes which rule applies. Repair restores a state after failure.

## 8. Cross-domain invariance

Acceptance tests must include differently named fields that exhibit the same preserved structural observations.

The test passes when industry names do not change the governing discovery lenses or primary question operator.

## 9. Audit trail

For every AI-generated onboarding question, Foundry should be able to show:

`testimony refs`
→ `structural observation`
→ `discovery lens`
→ `candidate gap`
→ `priority`
→ `operator`
→ `question`

After the answer:

`answer testimony`
→ `bounded interpretation`
→ `disposition`
→ `structural delta`
→ `residual gap`

## 10. Failure conditions

The intake method fails governance if it:

- creates assumed roles from an industry label;
- imports a standard org chart;
- assumes authority from a title;
- assumes a workflow from profession;
- asks an industry checklist without evidence that its branches apply;
- omits supporting evidence for a generated gap;
- sets `industry_assumption: true`;
- uses canon vocabulary as a substitute for ordinary human language;
- treats a discovery lens as proof of reality.
