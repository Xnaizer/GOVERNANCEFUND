import { Card, CardBody } from "@heroui/react";
import { useStats } from "../hooks/usePrograms";

const ITEMS = [
  { key: "active", label: "Active", cls: "text-brand-blue" },
  { key: "finished", label: "Finished", cls: "text-success" },
  { key: "flagged", label: "Flagged", cls: "text-warning" },
  { key: "fraud", label: "Fraud", cls: "text-danger" },
] as const;

export function StatsBar() {
  const { data } = useStats();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ITEMS.map((it) => (
        <Card key={it.key} shadow="sm">
          <CardBody className="py-3">
            <p className="text-xs uppercase text-default-500">{it.label}</p>
            <p className={`text-2xl font-bold ${it.cls}`}>{data?.byTab[it.key] ?? "—"}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
