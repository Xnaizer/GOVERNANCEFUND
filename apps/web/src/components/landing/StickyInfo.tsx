import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Fingerprint,
  Snowflake,
  Scale,
  Layers,
} from "lucide-react";
import { Reveal } from "../motion/Reveal";
import { cn } from "@/utils/cn";

const POINTS = [
  {
    icon: Layers,
    color: "#4899EA",
    title: "Pemisahan wewenang",
    body: "Tak ada satu orang pun yang bisa memindahkan dana sendirian. Admin, validator, dan auditor punya peran terpisah yang saling mengunci.",
  },
  {
    icon: Fingerprint,
    color: "#67F3CE",
    title: "Jejak kriptografis",
    body: "Setiap program diikat oleh hash SHA-256 yang di-anchor on-chain. Ubah satu huruf pun, sistem langsung menandainya sebagai anomali.",
  },
  {
    icon: Scale,
    color: "#818CF8",
    title: "Konsensus 67%",
    body: "Persetujuan program dan pergantian peran butuh ambang BFT dua-pertiga suara — keputusan kolektif, bukan kehendak individu.",
  },
  {
    icon: Snowflake,
    color: "#38BDF8",
    title: "Pembekuan independen",
    body: "Auditor yang sepenuhnya independen bisa membekukan program mencurigakan dalam satu transaksi — publik, terlihat semua orang.",
  },
  {
    icon: ShieldCheck,
    color: "#C084FC",
    title: "Reputasi berbasis hasil",
    body: "Skor dihitung dari kejadian on-chain, bukan ditetapkan manual. PIC curang kehilangan standing; auditor gegabah pun ikut dinilai.",
  },
];

export function StickyInfo() {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const activeColor = POINTS[active].color;

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.idx));
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    items.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section data-nav-theme="light" className="bg-background py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:h-fit lg:self-start">
          <Reveal>
            <span
              className="text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: activeColor, transition: "color 0.5s" }}
            >
              Cara kerja
            </span>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              Kecurangan dibuat{" "}
              <span style={{ color: activeColor, transition: "color 0.5s" }}>
                mustahil
              </span>{" "}
              — bukan sekadar terdeteksi.
            </h2>
            <p className="mt-5 max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
              Audit tradisional menemukan kecurangan setelah uang lenyap. Di
              sini, setiap celah ditutup secara mekanis sebelum kecurangan
              sempat terjadi — dijamin oleh kode, bukan oleh kepercayaan.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <dt
                  className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
                  style={{ color: activeColor, transition: "color 0.5s" }}
                >
                  5
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  peran dengan wewenang terpisah
                </dd>
              </div>
              <div>
                <dt
                  className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
                  style={{ color: activeColor, transition: "color 0.5s" }}
                >
                  100%
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">
                  aksi finansial di on-chain
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <div className="flex flex-col">
          {POINTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05}>
              <div
                ref={(el) => {
                  items.current[i] = el;
                }}
                data-idx={i}
                className={cn(
                  "flex gap-5 py-7 transition-opacity",
                  i > 0 && "border-t border-black/5",
                  active === i ? "opacity-100" : "opacity-60",
                )}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${p.color}1a`, color: p.color }}
                >
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
