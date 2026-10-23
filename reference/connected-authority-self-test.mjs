// Offline denial and allowed-scope tests for the Gate 1 reference.
import assert from "node:assert/strict";
import test from "node:test";
import { decideFoundryOperation } from "./connected-authority.mjs";

const owner = "principal-A", carrier = "carrier-A", workspace = "workspace-A";
const at = "2026-10-23T17:00:00.000Z";
const baseRequest = { operation:"record_testimony", protocol_version:"0.1", workspace_id:workspace, principal_id:owner, carrier_id:carrier };
const ctx = {
  "actor": {
    "kind": "carrier",
    "authenticated": true,
    "status": "active",
    "principal_id": "principal-A",
    "carrier_id": "carrier-A"
  },
  "workspace": {
    "workspace_id": "workspace-A",
    "owner_principal_id": "principal-A",
    "status": "DISCOVERY",
    "subject_scope": {
      "state": "documented_external",
      "basis_refs": [
        "src-consent"
      ]
    }
  },
  "carrier_delegation": {
    "status": "active",
    "scope_kind": "foundry_workspace",
    "workspace_id": "workspace-A",
    "principal_id": "principal-A",
    "carrier_id": "carrier-A",
    "allowed_operations": [
      "record_testimony",
      "resume_workspace",
      "get_next_question"
    ],
    "basis_refs": [
      "grant-human-1"
    ],
    "begins_at": "2026-10-23T00:00:00.000Z",
    "ends_at": "2026-10-24T00:00:00.000Z"
  }
};
const cases = [
  {
    "name": "valid limited carrier testimony",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": true
  },
  {
    "name": "other workspace ID",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-B",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "principal spoof",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-B",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "carrier spoof",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-B"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "unlisted operation",
    "req": {
      "operation": "request_seal",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "revoked delegation",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "revoked",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "wrong scope",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "ledger",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "wrong target",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-B",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "no documented subject basis",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": []
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "unknown legacy status",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY_OPEN",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "read-only sealed",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "SEALED",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "expired delegation",
    "req": {
      "operation": "record_testimony",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-22T00:00:00Z"
      }
    },
    "expected": false
  },
  {
    "name": "carrier cannot confirm",
    "req": {
      "operation": "confirm_assertion",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      }
    },
    "expected": false
  },
  {
    "name": "valid human owner",
    "req": {
      "operation": "record_source",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-A"
    },
    "env": {
      "actor": {
        "kind": "human",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      }
    },
    "expected": true
  },
  {
    "name": "foreign human blocked",
    "req": {
      "operation": "record_source",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-B"
    },
    "env": {
      "actor": {
        "kind": "human",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-B"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      }
    },
    "expected": false
  },
  {
    "name": "public orientation",
    "req": {
      "operation": "get_foundry_orientation",
      "protocol_version": "0.1"
    },
    "env": {},
    "expected": true
  },
  {
    "name": "valid human creates provisional subject",
    "req": {
      "operation": "start_workspace",
      "protocol_version": "0.1",
      "principal_id": "principal-A"
    },
    "env": {
      "actor": {
        "kind": "human",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A"
      },
      "creation_subject_scope": {
        "state": "documented_external",
        "basis_refs": [
          "basis-1"
        ]
      }
    },
    "expected": true
  },
  {
    "name": "carrier cannot choose workspace creation target",
    "req": {
      "operation": "start_workspace",
      "protocol_version": "0.1",
      "principal_id": "principal-A",
      "carrier_id": "carrier-A",
      "workspace_id": "bad"
    },
    "env": {
      "actor": {
        "kind": "carrier",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "carrier_delegation": {
        "status": "active",
        "scope_kind": "foundry_workspace",
        "workspace_id": "workspace-A",
        "principal_id": "principal-A",
        "carrier_id": "carrier-A",
        "allowed_operations": [
          "record_testimony",
          "resume_workspace",
          "get_next_question"
        ],
        "basis_refs": [
          "grant-human-1"
        ],
        "begins_at": "2026-10-23T00:00:00.000Z",
        "ends_at": "2026-10-24T00:00:00.000Z"
      },
      "creation_subject_scope": {
        "state": "documented_external",
        "basis_refs": [
          "basis-1"
        ]
      }
    },
    "expected": false
  },
  {
    "name": "foreign human with reviewed grant",
    "req": {
      "operation": "record_source",
      "protocol_version": "0.1",
      "workspace_id": "workspace-A",
      "principal_id": "principal-B"
    },
    "env": {
      "actor": {
        "kind": "human",
        "authenticated": true,
        "status": "active",
        "principal_id": "principal-B"
      },
      "workspace": {
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "status": "DISCOVERY",
        "subject_scope": {
          "state": "documented_external",
          "basis_refs": [
            "src-consent"
          ]
        }
      },
      "operator_grant": {
        "status": "active",
        "workspace_id": "workspace-A",
        "owner_principal_id": "principal-A",
        "operator_principal_id": "principal-B",
        "allowed_operations": [
          "record_source"
        ],
        "basis_refs": [
          "approved-human"
        ]
      }
    },
    "expected": true
  }
];
for (const {name, req, env, expected} of cases) test(name, () => {
  const result = decideFoundryOperation(req, env, at);
  assert.equal(result.allowed, expected, JSON.stringify(result));
  if (result.allowed) assert.equal(result.canonical_atlas_mutation, false);
});
