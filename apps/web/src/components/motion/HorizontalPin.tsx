import { useRef, type ReactNode, type MutableRefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { cn } from "@/utils/cn";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Pin section lalu geser track horizontal seiring scroll vertikal (scrub).
 * `onProgress` mengabari progres 0→1. `seekRef` diisi fungsi untuk melompat
 * ke fraksi progres tertentu (dipakai navigasi tab bawah).
 */
export function HorizontalPin({
  children,
  className,
  trackClassName,
  onProgress,
  overlay,
  seekRef,
}: {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  onProgress?: (p: number) => void;
  /** Layer yang TIDAK ikut bergeser (mis. navigasi tab) — absolute inset-0 di dalam container. */
  overlay?: ReactNode;
  /** Ref yang diisi fungsi seek(fraction 0→1) → smooth-scroll ke posisi itu. */
  seekRef?: MutableRefObject<((f: number) => void) | null>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  useGSAP(
    () => {
      const el = track.current!;
      const distance = () => Math.max(0, el.scrollWidth - window.innerWidth);
      const tween = gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => onProgress?.(self.progress),
        },
      });

      if (seekRef) {
        const st = tween.scrollTrigger!;
        seekRef.current = (f) => {
          const frac = Math.max(0, Math.min(1, f));
          const target = st.start + frac * (st.end - st.start);
          if (lenisRef.current) lenisRef.current.scrollTo(target, { duration: 0.9 });
          else window.scrollTo({ top: target, behavior: "smooth" });
        };
      }
    },
    { scope: container },
  );

  return (
    <div ref={container} className={cn("relative overflow-hidden", className)}>
      <div ref={track} className={cn("flex", trackClassName)}>
        {children}
      </div>
      {overlay && <div className="pointer-events-none absolute inset-0">{overlay}</div>}
    </div>
  );
}
