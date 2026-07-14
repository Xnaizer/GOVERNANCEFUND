import { cn } from "@/utils/cn";

const DOTS = [
  { color: "#67f3ce", delay: "0ms" },
  { color: "#4899ea", delay: "150ms" },
  { color: "#818cf8", delay: "300ms" },
];


export function BrandLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2 py-20", className)}
    >
      {DOTS.map((d) => (
        <span
          key={d.color}
          className="h-2.5 w-2.5 rounded-full motion-safe:animate-bounce"
          style={{
            backgroundColor: d.color,
            animationDelay: d.delay,
            animationDuration: "0.7s",
          }}
        />
      ))}
    </div>
  );
}
