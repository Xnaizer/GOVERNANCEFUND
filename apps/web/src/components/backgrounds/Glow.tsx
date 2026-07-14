import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";

export function Glow({
  className,
  color = "rgba(72,153,234,0.45)",
  size = "60%",
}: {
  className?: string;
  color?: string;
  size?: string;
}) {
  const style: CSSProperties = {
    background: `radial-gradient(circle at center, ${color} 0%, transparent ${size})`,
  };
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 blur-2xl", className)}
      style={style}
    />
  );
}
