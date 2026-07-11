import { Badge } from "@/components/ui/badge";
import type { ProgramStatus } from "../types/program";
import type { Integrity } from "../types/common";

type Variant = "default" | "secondary" | "success" | "warning" | "destructive";

const STATUS_VARIANT: Record<ProgramStatus, Variant> = {
  PENDING: "secondary",
  APPROVED: "default",
  DRAWABLE: "default",
  MILESTONE_ACHIEVED: "success",
  COMPLETED: "success",
  FROZEN: "warning",
  FRAUD_CONFIRMED: "destructive",
};
export function StatusChip({ status }: { status: ProgramStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status.replace(/_/g, " ")}</Badge>;
}

const INTEGRITY_VARIANT: Record<Integrity, Variant> = {
  VERIFIED: "success",
  HASH_MISMATCH: "destructive",
  ORPHAN: "warning",
};
export function IntegrityChip({ integrity }: { integrity: Integrity }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className={
          INTEGRITY_VARIANT[integrity] === "success"
            ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
            : INTEGRITY_VARIANT[integrity] === "destructive"
              ? "h-1.5 w-1.5 rounded-full bg-destructive"
              : "h-1.5 w-1.5 rounded-full bg-amber-500"
        }
      />
      {integrity.replace(/_/g, " ")}
    </Badge>
  );
}
