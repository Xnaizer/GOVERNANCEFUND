import { Badge } from "@/components/ui/badge";
import type { RedemptionStatus } from "../types/redemption";

const MAP: Record<RedemptionStatus, { label: string; variant: "warning" | "success" | "secondary" }> = {
  PENDING: { label: "Menunggu bank", variant: "warning" },
  SETTLED: { label: "Cair (burned)", variant: "success" },
  CANCELLED: { label: "Dibatalkan", variant: "secondary" },
};

export function RedemptionStatusChip({ status }: { status: RedemptionStatus }) {
  const s = MAP[status] ?? MAP.PENDING;
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
