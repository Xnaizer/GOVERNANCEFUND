import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Glow } from "../backgrounds/Glow";
import { Grain } from "../backgrounds/Grain";
import { cn } from "@/utils/cn";

interface Props {
  eyebrow?: ReactNode;
  title: ReactNode;
  gradient?: boolean;
  subtitle?: ReactNode;
  chips?: ReactNode;
  children?: ReactNode;
  back?: { to: string; label: string };
  bannerUrl?: string | null;
  className?: string;
}

export function DarkHero({
  eyebrow,
  title,
  gradient,
  subtitle,
  chips,
  children,
  back,
  bannerUrl,
  className,
}: Props) {
  return (
    <div className="flex flex-col gap-5 pt-1">
      {back && (
        <Link
          to={back.to}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {back.label}
        </Link>
      )}
      <section
        data-nav-theme="dark"
        className={cn(
          "relative isolate overflow-hidden rounded-3xl bg-[#0b1220] px-6 py-8 text-white sm:px-9 sm:py-10",
          className,
        )}
      >
        {bannerUrl && (
          <>
            <img
              src={bannerUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-linear-to-t from-[#0b1220] via-[#0b1220]/85 to-[#0b1220]/60" />
          </>
        )}
        <Glow
          color="rgba(72,153,234,0.20)"
          size="55%"
          className="left-[-6%] top-[-20%] h-80 w-80"
        />
        <Glow
          color="rgba(103,243,206,0.14)"
          size="55%"
          className="right-[-6%] bottom-[-30%] h-72 w-72"
        />
        <Grain className="opacity-50" />

        <div className="relative">
          {eyebrow && (
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-brand-mint">
              {eyebrow}
            </span>
          )}
          <h1
            className={cn(
              "mt-2 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl",
              gradient && "text-gradient",
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 max-w-2xl text-pretty text-sm text-white/60 sm:text-base">
              {subtitle}
            </p>
          )}
          {chips && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chips}
            </div>
          )}
          {children}
        </div>
      </section>
    </div>
  );
}
