import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const LOGOS = [
  "solidity",
  "ethereum",
  "react",
  "typescript",
  "prisma",
  "express",
  "postgresql",
  "tailwindcss",
  "supabase",
  "redis",
  "walletconnect",
  "vite",
];

const REEL = [...LOGOS, ...LOGOS];

export function TechMarquee() {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      tween.current = gsap.to(track.current, {
        xPercent: -50,
        ease: "none",
        duration: 32,
        repeat: -1,
      });
    },
    { scope: wrap },
  );

  const slow = () =>
    tween.current &&
    gsap.to(tween.current, { timeScale: 0, duration: 0.9, ease: "power3.out" });
  const resume = () =>
    tween.current &&
    gsap.to(tween.current, { timeScale: 1, duration: 0.9, ease: "power2.out" });

  return (
    <section data-nav-theme="light" className="bg-background py-8 pt-32">
      <div
        ref={wrap}
        className="overflow-hidden"
        onMouseEnter={slow}
        onMouseLeave={resume}
      >
        <div ref={track} className="flex w-max items-center">
          {[...REEL, ...REEL].map((l, i) => (
            <img
              key={i}
              src={`/logos/${l}.svg`}
              alt={l}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="mx-9 h-8 w-auto shrink-0 select-none opacity-60 grayscale transition-all duration-500 ease-out hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
