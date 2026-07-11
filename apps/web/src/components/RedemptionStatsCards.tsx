import { StatCard } from "./ui/StatCard";
import { formatIDR } from "../utils/format";
import type { RedemptionStats } from "../types/redemption";

/** Baris 4 kartu ringkasan redemption — dipakai di halaman publik & dashboard operator. */
export function RedemptionStatsCards({ stats }: { stats: RedemptionStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Menunggu" value={stats.pending} tone="warning" />
      <StatCard label="Cair" value={stats.settled} tone="success" />
      <StatCard label="Total Dibakar" tone="primary" value={<span className="font-mono text-base">{formatIDR(stats.totalSettledAmount)}</span>} />
      <StatCard label="Escrow Berjalan" value={<span className="font-mono text-base">{formatIDR(stats.totalPendingAmount)}</span>} />
    </div>
  );
}
