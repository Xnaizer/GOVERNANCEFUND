import { keccak256, toBytes } from "viem";
import type { Role, SignerRole } from "@repo/database";

const ADMIN_ROLE = keccak256(toBytes("ADMIN_ROLE"));
const VALIDATOR_ROLE = keccak256(toBytes("VALIDATOR_ROLE"));
const AUDITOR_ROLE = keccak256(toBytes("AUDITOR_ROLE"));
const PIC_ROLE = keccak256(toBytes("PIC_ROLE"));

export function mapRoleHashToRole(roleHash: string): Role | null {
  const hash = roleHash.toLowerCase();
  switch (hash) {
    case ADMIN_ROLE.toLowerCase():     return "ADMIN";
    case VALIDATOR_ROLE.toLowerCase(): return "VALIDATOR";
    case AUDITOR_ROLE.toLowerCase():   return "AUDITOR";
    case PIC_ROLE.toLowerCase():       return "PIC";
    default:                            return null;
  }
}

export function mapRoleHashToSignerRole(roleHash: string): SignerRole | null {
  const hash = roleHash.toLowerCase();
  switch (hash) {
    case ADMIN_ROLE.toLowerCase():     return "ADMIN";
    case VALIDATOR_ROLE.toLowerCase(): return "VALIDATOR";
    case AUDITOR_ROLE.toLowerCase():   return "AUDITOR";
    default:                            return null; 
  }
}

export function mapSignerRoleToRoleHash(role: SignerRole): `0x${string}` {
    switch(role) {
        case "ADMIN": return ADMIN_ROLE;
        case "VALIDATOR": return VALIDATOR_ROLE;
        case "AUDITOR": return AUDITOR_ROLE
    }
}