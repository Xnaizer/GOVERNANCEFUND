import { useEffect, type ReactNode } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Menyambungkan Lenis (smooth scroll) dgn GSAP ticker + ScrollTrigger.update. */
function LenisGsapBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
    };
  }, [lenis]);
  return null;
}

/**
 * Smooth scroll (Lenis) — HANYA membungkus Landing. Karena mount cuma di route "/",
 * ia unmount saat pindah ke dashboard → dashboard tetap native scroll.
 * `autoRaf={false}`: RAF di-drive via gsap.ticker agar sinkron dgn ScrollTrigger (tak double-step).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root autoRaf={false} options={{ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 }}>
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  );
}
