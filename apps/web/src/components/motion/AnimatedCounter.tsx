import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { useReducedMotionSafe } from "../../hooks/useReducedMotionSafe";

/** Angka yang menghitung naik dari 0 saat masuk viewport. */
export function AnimatedCounter({
  value,
  className,
  suffix = "",
  prefix = "",
  duration = 1.3,
}: {
  value: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotionSafe();
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display.toLocaleString("id-ID")}{suffix}
    </span>
  );
}
