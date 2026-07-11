import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

/** Spinner sederhana (lucide Loader2 + animate-spin). Pengganti HeroUI Spinner. */
export function Spinner({
  className,
  label,
  size = 20,
}: {
  className?: string;
  label?: string;
  size?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-muted-foreground", className)}>
      <Loader2 className="animate-spin text-brand-blue" style={{ width: size, height: size }} />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}
