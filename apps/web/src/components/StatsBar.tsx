import { useStats } from "../hooks/usePrograms";
import { StatStrip } from "./ui/StatStrip";

const ITEMS = [
  { key: "active", label: "Active", color: "#4899EA" },
  { key: "finished", label: "Finished", color: "#10b981" },
  { key: "flagged", label: "Flagged", color: "#f59e0b" },
  { key: "fraud", label: "Fraud", color: "#ef4444" },
] as const;

export function StatsBar() {
  const { data } = useStats();
  return (
    <StatStrip
      items={ITEMS.map((it) => ({
        label: it.label,
        color: it.color,
        dot: true,
        value: data ? data.byTab[it.key].toLocaleString("id-ID") : "—",
      }))}
    />
  );
}
