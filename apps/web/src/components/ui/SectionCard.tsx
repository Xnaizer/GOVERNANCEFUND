import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface Props {
  title?: ReactNode;
  /** Label kecil uppercase brand di atas judul section. */
  eyebrow?: string;
  /** Ikon berwarna di kiri judul (mis. <Layers/>), diwarnai lewat `accent`. */
  icon?: ReactNode;
  /** Warna aksen ikon (hex). Default brand-blue. */
  accent?: string;
  /** Elemen di kanan header (mis. count / tombol). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Padding konten. Default true. */
  padded?: boolean;
}

/**
 * Kartu section standar untuk halaman detail — rounded-2xl + shadow-soft + header display.
 * Pengganti pola `Section` lokal, dipakai konsisten lintas detail publik.
 */
export function SectionCard({
  title,
  eyebrow,
  icon,
  accent = "#4899EA",
  action,
  children,
  className,
  padded = true,
}: Props) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-black/5 bg-white", className)}>
      {(title || eyebrow || action) && (
        <header className="flex items-center gap-3 border-b border-black/5 px-5 py-4">
          {icon && (
            <span className="shrink-0" style={{ color: accent }}>
              {icon}
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-blue">{eyebrow}</span>
            )}
            {title && <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>}
          </div>
          {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn(padded && "p-5")}>{children}</div>
    </section>
  );
}
