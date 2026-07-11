import { useStats } from "../hooks/usePrograms";
import { Card, CardContent } from "@/components/ui/card";

const ITEMS = [
  { key: "active", label: "Active", cls: "text-brand-blue" },
  { key: "finished", label: "Finished", cls: "text-emerald-600" },
  { key: "flagged", label: "Flagged", cls: "text-amber-600" },
  { key: "fraud", label: "Fraud", cls: "text-destructive" },
] as const;

export function StatsBar() {
  const { data } = useStats();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ITEMS.map((it) => (
        <Card key={it.key}>
          <CardContent className="p-4">
            <p className="text-xs uppercase text-muted-foreground">{it.label}</p>
            <p className={`font-display text-2xl font-semibold ${it.cls}`}>
              {data ? data.byTab[it.key].toLocaleString("id-ID") : "—"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
