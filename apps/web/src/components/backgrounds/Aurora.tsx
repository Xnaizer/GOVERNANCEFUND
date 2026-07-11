import { cn } from "@/utils/cn";

/** Blob mesh-gradient brand yang di-blur — nuansa "dreamy" tanpa WebGL. */
export function Aurora({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute -left-[15%] -top-[10%] h-[60vh] w-[60vh] rounded-full bg-brand-mint/30 blur-[110px]" />
      <div className="absolute right-[-10%] top-[15%] h-[55vh] w-[55vh] rounded-full bg-brand-blue/30 blur-[120px]" />
      <div className="absolute bottom-[-15%] left-[30%] h-[45vh] w-[45vh] rounded-full bg-violet-400/25 blur-[110px]" />
    </div>
  );
}
