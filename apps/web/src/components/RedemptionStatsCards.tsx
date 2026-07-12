import { StatStrip } from "./ui/StatStrip";
import { formatIDR } from "../utils/format";
import type { RedemptionStats } from "../types/redemption";

/** Ringkasan redemption dalam satu bar terbagi — dipakai di halaman publik & dashboard operator. */
export function RedemptionStatsCards({ stats }: { stats: RedemptionStats }) {
  return (
    <StatStrip
      items={[
        { label: "Menunggu", color: "#f59e0b", dot: true, value: stats.pending },
        { label: "Cair", color: "#10b981", dot: true, value: stats.settled },
        { label: "Total Dibakar", color: "#4899EA", value: <span className="font-mono text-base">{formatIDR(stats.totalSettledAmount)}</span> },
        { label: "Escrow Berjalan", value: <span className="font-mono text-base">{formatIDR(stats.totalPendingAmount)}</span> },
      ]}
    />
  );
}
