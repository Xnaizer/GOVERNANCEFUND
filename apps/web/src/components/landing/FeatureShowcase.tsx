import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "../motion/Reveal";
import { AnimatedCounter } from "../motion/AnimatedCounter";
import { cn } from "@/utils/cn";

type Stat = { label: string; value: number; suffix?: string };
type Feature = {
  logo: string;
  color: string;
  label: string;
  title: string;
  blurb: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  stats: Stat[];
};

const FEATURES: Feature[] = [
  {
    logo: "solidity",
    color: "#4899EA",
    label: "Lapisan On-Chain",
    title: "Kebenaran yang tak bisa diubah.",
    blurb: "Setiap proposal dan pencairan diikat ke smart contract di Base Sepolia — sumber kebenaran yang tahan rusak.",
    quote: "Sekali tercatat, tak ada yang bisa memutar balik angkanya. Buktinya ada di rantai, bukan di laci.",
    name: "Rani Wibowo",
    role: "Auditor Independen",
    avatar: "/media/avatars/women-68.jpg",
    stats: [
      { label: "Layer kontrak", value: 5 },
      { label: "Aksi tercatat", value: 1240, suffix: "+" },
    ],
  },
  {
    logo: "walletconnect",
    color: "#12B981",
    label: "Multi-Signature",
    title: "Tak ada aktor tunggal.",
    blurb: "Tiga tanda tangan EIP-712 dari peran berbeda wajib terkumpul sebelum satu rupiah pun bisa cair.",
    quote: "Kolusi jadi hampir mustahil — perannya sengaja dipisah, dan keputusan besar butuh konsensus.",
    name: "Bagus Prasetyo",
    role: "Multi Validator",
    avatar: "/media/avatars/men-32.jpg",
    stats: [
      { label: "Tanda tangan / milestone", value: 3 },
      { label: "Ambang konsensus", value: 67, suffix: "%" },
    ],
  },
  {
    logo: "prisma",
    color: "#6366F1",
    label: "Data Terindeks",
    title: "Web2 disamakan dengan rantai.",
    blurb: "Reconciliation berkala membandingkan setiap catatan Postgres dengan on-chain — anomali langsung tertandai.",
    quote: "Kalau ada yang menghapus data untuk menyembunyikan program, sistem malah membongkarnya.",
    name: "Nadia Kusuma",
    role: "Analis Data",
    avatar: "/media/avatars/women-44.jpg",
    stats: [
      { label: "Model data", value: 15 },
      { label: "Audit / jam", value: 24 },
    ],
  },
  {
    logo: "react",
    color: "#0EA5E9",
    label: "Explorer Publik",
    title: "Terbuka untuk siapa saja.",
    blurb: "Empat tab publik — Aktif, Selesai, Ditandai, dan Kecurangan — bisa ditelusuri tanpa perlu login sama sekali.",
    quote: "Bahkan percobaan bypass ditampilkan terbuka, bukan disembunyikan. Ini transparansi yang bisa diverifikasi.",
    name: "Rizal Mahendra",
    role: "Jurnalis",
    avatar: "/media/avatars/men-75.jpg",
    stats: [
      { label: "Tab publik", value: 4 },
      { label: "Perlu login", value: 0 },
    ],
  },
];

const CYCLE_MS = 10000;

/** Merecolor SVG logo ke satu warna solid (via CSS mask) agar cocok dgn warna garis. */
function logoMask(src: string, color: string): CSSProperties {
  return {
    backgroundColor: color,
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };
}

export function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0); // 0→1 garis loading tab aktif
  const startRef = useRef<number>(0);
  const f = FEATURES[active];

  // Satu loop rAF menggerakkan garis 10 dtk lalu pindah tab — deterministik.
  useEffect(() => {
    let raf = 0;
    startRef.current = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startRef.current) / CYCLE_MS, 1);
      setProgress(p);
      if (p >= 1) {
        startRef.current = now;
        setActive((i) => (i + 1) % FEATURES.length);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const select = (i: number) => {
    startRef.current = performance.now();
    setProgress(0);
    setActive(i);
  };

  return (
    <section data-nav-theme="light" className="bg-background pb-24 pt-10 sm:pb-28 sm:pt-14">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-blue">Dibangun untuk dipercaya</span>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-4xl">
            Empat lapisan, satu janji.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base">
            Setiap bagian sistem menutup satu celah kecurangan — dari rantai hingga antarmuka publik.
          </p>
        </Reveal>

        {/* Baris 4 tab: garis loading terpisah di atas, logo berwarna di bawah */}
        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
          {FEATURES.map((item, i) => {
            const on = i === active;
            return (
              <button
                key={item.logo}
                type="button"
                onClick={() => select(i)}
                className="group flex flex-col items-start gap-4 text-left"
              >
                {/* Garis loading — terpisah dari logo */}
                <span className="relative h-1 w-full overflow-hidden rounded-full bg-black/8">
                  <span
                    className="absolute inset-y-0 left-0 block rounded-full"
                    style={{ backgroundColor: item.color, width: on ? `${progress * 100}%` : "0%" }}
                  />
                </span>

                {/* Logo (diwarnai = warna garis) + label */}
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className={cn("h-7 w-7 shrink-0 transition-opacity duration-500", on ? "opacity-100" : "opacity-45 group-hover:opacity-70")}
                    style={logoMask(`/logos/${item.logo}.svg`, on ? item.color : "#94a3b8")}
                  />
                  <span
                    className={cn("font-display text-sm font-semibold tracking-tight transition-colors", on ? "text-foreground" : "text-muted-foreground")}
                  >
                    {item.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Konten aktif — 1 testimoni tanpa bg (kiri 3/4) + stats (kanan 1/4) */}
        <div className="mt-14 grid gap-10 lg:grid-cols-4 lg:gap-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-3"
            >
              <h3 className="font-display text-xl font-semibold tracking-tight sm:text-3xl" style={{ color: f.color }}>
                {f.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">{f.blurb}</p>

              <blockquote className="mt-6 max-w-2xl font-display text-lg font-medium leading-snug tracking-tight text-foreground sm:mt-8 sm:text-2xl">
                “{f.quote}”
              </blockquote>
              <div className="mt-6 flex items-center gap-4">
                <img
                  src={f.avatar}
                  alt={f.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-soft"
                  style={{ outline: `2px solid ${f.color}`, outlineOffset: 1 }}
                  loading="lazy"
                />
                <span>
                  <span className="block text-sm font-semibold">{f.name}</span>
                  <span className="block text-xs text-muted-foreground">{f.role}</span>
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`stats-${active}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-center gap-8 border-t border-black/5 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
            >
              {f.stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: f.color }}>
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
