import { keccak256, toBytes } from "viem";

export type GovRole = "ADMIN_ROLE" | "VALIDATOR_ROLE" | "AUDITOR_ROLE" | "PIC_ROLE";

export function roleHash(name: GovRole): `0x${string}` {
  return keccak256(toBytes(name));
}

export const VOTABLE_ROLES: { label: string; value: GovRole }[] = [
  { label: "Validator", value: "VALIDATOR_ROLE" },
  { label: "Auditor", value: "AUDITOR_ROLE" },
  { label: "Admin", value: "ADMIN_ROLE" },
];
