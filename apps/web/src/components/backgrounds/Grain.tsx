import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";

const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export function Grain({
  opacity = 0.045,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  const style: CSSProperties = {
    opacity,
    backgroundImage: `url("${NOISE}")`,
    backgroundSize: "180px 180px",
  };
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 mix-blend-overlay",
        className,
      )}
      style={style}
    />
  );
}
