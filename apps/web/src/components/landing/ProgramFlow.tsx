import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, ArrowUpRight, Sparkles, ShieldCheck } from "lucide-react";
import { Reveal } from "../motion/Reveal";
import { Glow } from "../backgrounds/Glow";

const STEPS = [
  {
    title: "Ajukan proposal",
    body: "PIC menyusun program lengkap dengan rincian milestone. Hash SHA-256-nya di-anchor on-chain sejak detik pertama.",
    img: "/alurprogram/proposal.svg",
    color: "#67F3CE",
    glow: "rgba(103,243,206,0.45)",
  },
  {
    title: "Voting validator",
    body: "Minimal tiga validator memberi suara. Program hanya disetujui bila menembus ambang konsensus dua-pertiga (67%).",
    img: "/alurprogram/voting.svg",
    color: "#4899EA",
    glow: "rgba(72,153,234,0.45)",
  },
  {
    title: "Tiga tanda tangan",
    body: "Admin, validator, dan auditor menandatangani milestone secara EIP-712. Tanpa tiga tanda tangan sah, dana tak bisa cair.",
    img: "/alurprogram/threesignature.svg",
    color: "#818CF8",
    glow: "rgba(129,140,248,0.45)",
  },
  {
    title: "Pencairan bertahap",
    body: "Token dicetak sesuai kebutuhan tiap penarikan — bukan dicetak di muka. Setiap rupiah disertai bukti yang di-anchor.",
    img: "/alurprogram/withdraw.svg",
    color: "#38BDF8",
    glow: "rgba(56,189,248,0.45)",
  },
  {
    title: "Selesai atau dibekukan",
    body: "Program tuntas menaikkan reputasi PIC. Bila mencurigakan, auditor membekukannya — dan governance memutuskan lewat voting.",
    img: "/alurprogram/successfreeze.svg",
    color: "#C084FC",
    glow: "rgba(192,132,252,0.45)",
  },
];

export function ProgramFlow() {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start center", "end center"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    mass: 0.5,
  });

  return (
    <section className="bg-background py-6 sm:py-10">
      <div
        data-nav-theme="dark"
        className="relative mx-auto w-[95%] max-w-none overflow-hidden rounded-4xl bg-[#080a0f] px-6 py-20 text-white sm:rounded-[2.5rem] sm:px-10 sm:py-28 lg:px-16"
      >
        <Glow
          color="rgba(72,153,234,0.16)"
          size="55%"
          className="left-[-8%] top-[8%] h-[40rem] w-[40rem]"
        />
        <Glow
          color="rgba(103,243,206,0.12)"
          size="55%"
          className="right-[-8%] bottom-[10%] h-[36rem] w-[36rem]"
        />

        <div className="relative max-w-2xl">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <Sparkles className="h-3.5 w-3.5 text-brand-mint" /> Alur program
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight sm:text-4xl">
              Satu garis lurus dari pengajuan ke pencairan.
            </h2>
            <p className="mt-4 text-pretty text-sm text-white/60 sm:text-base">
              Lima langkah, semuanya terekam. Tiap simpul adalah pemeriksaan
              yang tak bisa dilewati.
            </p>
          </Reveal>
        </div>

        <div ref={track} className="relative mt-16">
          <div className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 bg-white/10 lg:block">
            <motion.div
              style={{ scaleY: fill, transformOrigin: "top" }}
              className="absolute inset-0 bg-linear-to-b from-brand-mint via-brand-blue to-brand-blue"
            />
          </div>

          {STEPS.map((s) => {
            const [first, ...rest] = s.title.split(" ");
            return (
              <div key={s.title} className="relative py-8 lg:py-14">
                <span
                  className="absolute left-1/2 top-12 z-10 hidden h-3.5 w-3.5 -translate-x-1/2 rounded-full ring-4 ring-[#080a0f] lg:block"
                  style={{
                    backgroundColor: s.color,
                    boxShadow: `0 0 20px ${s.color}`,
                  }}
                />
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                  <Reveal className="order-2 lg:order-1">
                    <div className="mx-auto max-w-sm lg:mr-0 lg:ml-auto">
                      <h3 className="font-display text-xl font-semibold tracking-tight sm:text-3xl">
                        <span style={{ color: s.color }}>{first}</span>{" "}
                        {rest.join(" ")}
                      </h3>
                      <p className="mt-3 text-pretty text-sm leading-relaxed text-white/60">
                        {s.body}
                      </p>
                    </div>
                  </Reveal>

                  <Reveal
                    className="relative order-1 lg:order-2 lg:pl-16"
                    delay={0.08}
                  >
                    <div className="relative mx-auto w-full max-w-[20rem] lg:mx-0">
                      <Glow color={s.glow} size="75%" className="scale-155" />
                      <figure className="relative aspect-square overflow-hidden rounded-2xl">
                        <img
                          src={s.img}
                          alt={s.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </figure>
                    </div>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative mx-auto max-w-2xl pt-24 text-center">
          <div className="absolute left-1/2 top-0 hidden h-24 w-px -translate-x-1/2 bg-linear-to-b from-white/10 via-brand-blue/60 to-brand-blue lg:block" />
          <span className="absolute left-1/2 top-18 z-20 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-2xl bg-linear-to-br from-brand-mint to-brand-blue shadow-glow ring-4 ring-[#080a0f]">
            <ShieldCheck className="h-6 w-6 text-white" />
          </span>

          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-white/4 px-8 py-14 sm:px-14">
            <Glow
              color="rgba(103,243,206,0.22)"
              size="60%"
              className="left-[12%] top-[-15%] h-64 w-64"
            />
            <Glow
              color="rgba(72,153,234,0.26)"
              size="60%"
              className="left-1/2 top-[-25%] h-80 w-80 -translate-x-1/2"
            />
            <Glow
              color="rgba(192,132,252,0.22)"
              size="60%"
              className="right-[12%] top-[-10%] h-64 w-64"
            />
            <h3 className="relative font-display text-2xl font-semibold tracking-tight sm:text-4xl">
              Siap mengawal dana publik?
            </h3>
            <p className="relative mx-auto mt-3 max-w-md text-pretty text-sm text-white/60 sm:text-base">
              Daftarkan institusi Anda dan mulai kelola anggaran yang tak bisa
              dicurangi — atau telusuri dulu lewat Explorer publik.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-6 py-3 text-sm font-medium text-[#080a0f] transition-transform hover:scale-[1.03]"
              >
                Mulai sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/programs"
                className="group inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
              >
                Buka Explorer publik
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
