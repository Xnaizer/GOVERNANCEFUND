import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "../../utils/cn";

type Tone = "default" | "primary" | "success" | "warning" | "danger" | "secondary";

const TONE: Record<Tone, string> = {
  default: "text-foreground",
  primary: "text-brand-blue",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-destructive",
  secondary: "text-muted-foreground",
};

interface Props {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  hint?: string;
  to?: string;
}

/** Kartu statistik ringkas untuk baris ringkasan dashboard. Bisa jadi tautan bila `to` diisi. */
export function StatCard({ label, value, icon, tone = "default", hint, to }: Props) {
  const inner = (
    <CardContent className="flex flex-row items-center gap-3 p-4">
      {icon && <span className={cn("text-2xl", TONE[tone])}>{icon}</span>}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={cn("font-display text-2xl font-semibold leading-tight", TONE[tone])}>{value}</p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </CardContent>
  );

  if (to) {
    return (
      <Card className="transition-transform hover:scale-[1.01]">
        <Link to={to} className="block">{inner}</Link>
      </Card>
    );
  }
  return <Card>{inner}</Card>;
}
