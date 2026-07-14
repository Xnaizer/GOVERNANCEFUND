import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Grain } from "../backgrounds/Grain";

export function LandingHero() {
  const frame = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const { scrollYProgress } = useScroll({
    target: frame,
    offset: ["start start", "end start"],
  });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.24]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mvX = useSpring(rawX, { stiffness: 50, damping: 18, mass: 0.4 });
  const mvY = useSpring(rawY, { stiffness: 50, damping: 18, mass: 0.4 });
  const bgMX = useTransform(mvX, (v) => v * 28);
  const bgMY = useTransform(mvY, (v) => v * 28);
  const glowMX = useTransform(mvX, (v) => v * -44);
  const glowMY = useTransform(mvY, (v) => v * -44);

  const onMouseMove = (e: React.MouseEvent) => {
    const r = frame.current?.getBoundingClientRect();
    if (!r) return;
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section className="bg-background px-3 pb-6 pt-3 sm:px-4 sm:pb-10">
      <div
        ref={frame}
        onMouseMove={onMouseMove}
        data-nav-theme="dark"
        className="relative isolate flex min-h-[92vh] flex-col overflow-hidden rounded-3xl bg-[#0b1220] text-white shadow-2xl"
      >
        <motion.div
          style={{ x: bgMX, y: bgMY }}
          className="absolute inset-0 z-0"
        >
          <motion.img
            src="/media/hero.jpg"
            alt=""
            style={{ y: imgY, scale: imgScale }}
            className="h-full w-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Overlay gelap 30% agar foto hero lebih redup & teks kontras */}
        <div className="absolute inset-0 z-1 bg-black/30" />

        <motion.div
          style={{ x: glowMX, y: glowMY }}
          className="absolute left-[16%] top-[26%] z-1 h-80 w-80 rounded-full bg-brand-blue/25 blur-[120px]"
        />
        <div className="absolute inset-0 z-1 bg-linear-to-r from-[#0b1220]/85 via-[#0b1220]/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-1 h-40 bg-linear-to-t from-[#0b1220]/70 to-transparent" />
        <Grain className="z-2 opacity-60" />

        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pt-24 sm:px-12"
        >
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Dana publik untuk{" "}
            <span className="text-gradient">setiap warga.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-4 max-w-xl text-sm text-white/75 sm:mt-5 sm:text-lg"
          >
            Bangun, pantau, dan buktikan setiap rupiah anggaran — tanpa bisa
            dicurangi, tanpa perlu percaya siapa pun.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            onSubmit={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
            className="mt-9 flex w-full max-w-md items-center gap-1 rounded-2xl border border-white/25 bg-white/10 p-1.5 pl-5 shadow-soft backdrop-blur-md"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email institusi"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/50"
            />
            <button
              type="submit"
              className="flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#0b1220] transition-transform hover:scale-[1.03]"
            >
              Mulai <ArrowRight className="h-4 w-4" />
            </button>
          </motion.form>
        </motion.div>

        <div className="relative z-10 flex justify-center pb-8">
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white/70 backdrop-blur"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </div>
      </div>
    </section>
  );
}
