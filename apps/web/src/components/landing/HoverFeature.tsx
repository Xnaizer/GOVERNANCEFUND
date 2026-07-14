import { useState } from "react";
import { Reveal } from "../motion/Reveal";
import { Glow } from "../backgrounds/Glow";
import { cn } from "@/utils/cn";

const ITEMS = [
  {
    tag: "Bagi warga",
    title: "Pantau ke mana dana mengalir.",
    body: "Buka Explorer publik dan telusuri setiap program, pencairan, hingga percobaan kecurangan — tanpa perlu akun.",
    img: "/media/monitoring.jpg",
    color: "#4899EA",
    glow: "rgba(72,153,234,0.5)",
  },
  {
    tag: "Bagi auditor",
    title: "Bekukan yang mencurigakan seketika.",
    body: "Auditor independen bisa menghentikan program dalam satu transaksi on-chain — publik, terlihat, dan tak bisa ditutupi.",
    img: "/media/audit.jpg",
    color: "#C084FC",
    glow: "rgba(192,132,252,0.5)",
  },
  {
    tag: "Bagi institusi",
    title: "Kelola anggaran tanpa celah.",
    body: "Alur multi-signature dan hash on-chain memastikan tak ada satu pihak pun yang bisa memindahkan dana sendirian.",
    img: "/media/stakeholder.jpg",
    color: "#67F3CE",
    glow: "rgba(103,243,206,0.5)",
  },
];

export function HoverFeature() {
  const [active, setActive] = useState(0);
  const item = ITEMS[active];

  return (
    <section data-nav-theme="light" className="bg-background py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-blue">
              Satu sistem, banyak mata
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              Transparansi bukan sekadar janji.{" "}
              <span className="text-gradient">Ini bisa dibuktikan.</span>
            </h2>
          </Reveal>

          <div className="mt-8 flex flex-col">
            {ITEMS.map((it, i) => {
              const on = i === active;
              return (
                <button
                  key={it.tag}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="group relative border-t border-black/5 py-5 pl-5 text-left last:border-b"
                >
                  <span
                    className="absolute left-0 top-1/2 h-0 w-0.75 -translate-y-1/2 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: it.color,
                      height: on ? "70%" : "0%",
                    }}
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-[0.2em] transition-colors",
                      !on && "text-muted-foreground",
                    )}
                    style={on ? { color: it.color } : undefined}
                  >
                    {it.tag}
                  </span>
                  <h3
                    className={cn(
                      "mt-2 font-display text-lg font-semibold tracking-tight transition-opacity sm:text-xl",
                      !on && "lg:opacity-55",
                    )}
                  >
                    {it.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-1.5 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground transition-all",
                      on ? "opacity-100" : "opacity-100 lg:opacity-0",
                    )}
                  >
                    {it.body}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <Reveal className="relative">
          <Glow color={item.glow} size="65%" className="scale-110" />
          <div className="relative aspect-4/5 overflow-hidden rounded-4xl shadow-glow">
            <img
              src={item.img}
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Overlay gelap 30% agar foto lebih redup */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-5 bottom-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-semibold text-white">
                  {item.tag}
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
