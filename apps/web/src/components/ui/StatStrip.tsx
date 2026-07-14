import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface StatItem {
  label: string;
  value: ReactNode;
  color?: string;
  dot?: boolean;
  icon?: ReactNode;
}


export function StatStrip({
  items,
  className,
}: {
  items: StatItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col divide-y divide-black/5 rounded-xl border border-black/5 bg-white",
        "sm:flex-row sm:divide-x sm:divide-y-0",
        className,
      )}
    >
      {items.map((it, i) => (
        <div key={i} className="flex-1 px-5 py-4">
          <span className="flex items-center gap-2">
            {it.icon ? (
              <span
                className="shrink-0"
                style={{ color: it.color ?? "#4899EA" }}
              >
                {it.icon}
              </span>
            ) : it.dot ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: it.color ?? "#4899EA" }}
              />
            ) : null}
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {it.label}
            </span>
          </span>
          <p
            className="mt-1.5 font-display text-2xl font-semibold tracking-tight"
            style={it.color ? { color: it.color } : undefined}
          >
            {it.value}
          </p>
        </div>
      ))}
    </div>
  );
}
