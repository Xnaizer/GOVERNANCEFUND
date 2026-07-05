import { Chip } from "@heroui/react";
import type { ProgramStatus } from "../types/program";
import type { Integrity } from "../types/common";

const STATUS_COLOR: Record<ProgramStatus, "default" | "primary" | "success" | "warning" | "danger"> = {
  PENDING: "default",
  APPROVED: "primary",
  DRAWABLE: "primary",
  MILESTONE_ACHIEVED: "success",
  COMPLETED: "success",
  FROZEN: "warning",
  FRAUD_CONFIRMED: "danger",
};
export function StatusChip({ status }: { status: ProgramStatus }) {
  return <Chip size="sm" variant="flat" color={STATUS_COLOR[status]}>{status.replace(/_/g, " ")}</Chip>;
}

const INTEGRITY_COLOR: Record<Integrity, "success" | "warning" | "danger"> = {
  VERIFIED: "success",
  HASH_MISMATCH: "danger",
  ORPHAN: "warning",
};
export function IntegrityChip({ integrity }: { integrity: Integrity }) {
  return <Chip size="sm" variant="dot" color={INTEGRITY_COLOR[integrity]}>{integrity.replace(/_/g, " ")}</Chip>;
}
