import type { ReactNode } from "react";
import { Link } from "react-router-dom";
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

// Warna ikon selaras tone (tanpa latar — ikon diwarnai saja).
const ICON_TONE: Record<Tone, string> = {
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

/** Tile statistik ringkas (rounded-2xl + shadow-soft). Jadi tautan bila `to` diisi. */
export function StatCard({ label, value, icon, tone = "default", hint, to }: Props) {
  const inner = (
    <div className="flex items-start gap-3 p-5">
      {icon && (
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center text-2xl", ICON_TONE[tone])}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className={cn("mt-1 font-display text-2xl font-semibold leading-tight", TONE[tone])}>{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );

  const base = "rounded-2xl border border-black/5 bg-white shadow-none";
  if (to) {
    return (
      <Link
        to={to}
        className={cn(base, "block transition-colors duration-300 hover:border-brand-blue/30")}
      >
        {inner}
      </Link>
    );
  }
  return <div className={base}>{inner}</div>;
}
