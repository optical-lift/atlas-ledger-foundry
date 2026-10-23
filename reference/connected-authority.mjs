// Connected Foundry Gate 1: pure policy reference, NOT a public authorization service.
// All trusted.* values MUST be loaded by the authenticated server from governed
// Atlas/Foundry records. Passing client-controlled JSON as trusted is forbidden.
// This proves the pre-Ledger operation boundary without changing Atlas Reality.

export const POLICIES = Object.freeze({
  "get_foundry_orientation": {
    "level": "public",
    "write": false
  },
  "start_workspace": {
    "level": "create",
    "write": true
  },
  "resume_workspace": {
    "level": "workspace",
    "write": false
  },
  "get_workspace_state": {
    "level": "workspace",
    "write": false
  },
  "get_next_question": {
    "level": "workspace",
    "write": false
  },
  "record_source": {
    "level": "workspace",
    "write": true
  },
  "record_testimony": {
    "level": "workspace",
    "write": true
  },
  "submit_candidate_assertions": {
    "level": "workspace",
    "write": true
  },
  "record_unknown": {
    "level": "workspace",
    "write": true
  },
  "record_ledger_candidate": {
    "level": "workspace",
    "write": true
  }
});

export function decideFoundryOperation(request, trusted, at) {
  const deny=(reason)=>({allowed:false,reason,operation:request?.operation??null,workspace_id:null});
  if(!request||typeof request!=="object")return deny("invalid_request");
  const policy=POLICIES[request.operation];
  if(!policy)return deny("operation_not_admitted");
  if(request.protocol_version!=="0.1")return deny("protocol_not_admitted");
  if(policy.level==="public")return {allowed:true,reason:"public_orientation_only",operation:request.operation,workspace_id:null,canonical_atlas_mutation:false};
  const actor=trusted?.actor;
  if(!actor||actor.authenticated!==true||actor.status!=="active"||!actor.principal_id||
    !["human","carrier"].includes(actor.kind))return deny("authenticated_actor_required");
  if(request.principal_id!==actor.principal_id)return deny("principal_mismatch");
  if(actor.kind==="human"&&request.carrier_id)return deny("human_cannot_claim_carrier");
  if(actor.kind==="carrier"&&(!actor.carrier_id||request.carrier_id!==actor.carrier_id))return deny("carrier_mismatch");
  const scope=policy.level==="create"?trusted?.creation_subject_scope:trusted?.workspace?.subject_scope;
  if(!scope||!["verified_self","documented_external"].includes(scope.state)||
    (scope.state==="documented_external"&&
     (!Array.isArray(scope.basis_refs)||scope.basis_refs.length===0)))return deny("subject_scope_not_established");
  const workspace=policy.level==="workspace"?trusted.workspace:null;
  if(policy.level==="workspace"){
    if(!workspace||request.workspace_id!==workspace.workspace_id)return deny("workspace_not_authorized");
    if(!workspace.owner_principal_id)return deny("workspace_owner_unresolved");
    const statuses=["DISCOVERY","RECONCILIATION","CLOSURE","ACCEPTANCE","READY_TO_SEAL","SEALED","SUPERSEDED","ABANDONED"];
    if(!statuses.includes(workspace.status))return deny("legacy_workspace_reconciliation_required");
    if(policy.write&&["SEALED","SUPERSEDED","ABANDONED"].includes(workspace.status))return deny("workspace_read_only");
  }else if(request.workspace_id!==null&&request.workspace_id!==undefined){
    return deny("creation_cannot_choose_existing_workspace");
  }
  const ownerId=workspace?.owner_principal_id??actor.principal_id;
  if(policy.level==="workspace"&&actor.principal_id!==ownerId){
    const a=trusted?.operator_grant;
    if(!a||a.status!=="active"||a.workspace_id!==workspace.workspace_id||
       a.owner_principal_id!==ownerId||a.operator_principal_id!==actor.principal_id||
       !Array.isArray(a.allowed_operations)||!a.allowed_operations.includes(request.operation)||
       !Array.isArray(a.basis_refs)||a.basis_refs.length===0)return deny("operator_not_authorized");
  }
  if(actor.kind==="carrier"){
    const d=trusted?.carrier_delegation;
    if(!d||d.status!=="active"||d.carrier_id!==actor.carrier_id||
       d.principal_id!==actor.principal_id||d.scope_kind!=="foundry_workspace"||
       !Array.isArray(d.allowed_operations)||!d.allowed_operations.includes(request.operation))
       return deny("carrier_not_authorized");
    if(policy.level==="workspace"&&d.workspace_id!==workspace.workspace_id)return deny("carrier_workspace_mismatch");
    if(policy.level==="create"&&d.workspace_id!==null)return deny("carrier_creation_scope_required");
    if(!Array.isArray(d.basis_refs)||d.basis_refs.length===0)return deny("carrier_grant_basis_missing");
    if(!at||!Number.isFinite(Date.parse(at))||!d.begins_at||!Number.isFinite(Date.parse(d.begins_at))||
      Date.parse(at)<Date.parse(d.begins_at)||
      (d.ends_at&&Date.parse(at)>=Date.parse(d.ends_at)))return deny("carrier_delegation_outside_time");
  }
  return {
    allowed:true,reason:"governed_discovery_operation",
    operation:request.operation,workspace_id:workspace?.workspace_id??null,
    owner_principal_id:ownerId,actor_principal_id:actor.principal_id,
    carrier_id:actor.kind==="carrier"?actor.carrier_id:null,
    canonical_atlas_mutation:false,
    effect_limit:policy.write?"foundry_pre_ledger_only":"bounded_read_only"
  };
}
