import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Marquee horizontal loop mulus (dua track identik). Arah default kanan→kiri.
 * Pakai utility `animate-marquee` (translateX -100%) yang sudah ada di index.css.
 */
export function Marquee({
  children,
  className,
  duration = 32,
  reverse = false,
  pauseOnHover = false,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  const style = {
    "--marquee-dur": `${duration}s`,
    animationDirection: reverse ? "reverse" : "normal",
  } as CSSProperties;
  return (
    <div className={cn("group flex w-full overflow-hidden", className)}>
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn("flex shrink-0 animate-marquee items-center", pauseOnHover && "group-hover:[animation-play-state:paused]")}
          style={style}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
