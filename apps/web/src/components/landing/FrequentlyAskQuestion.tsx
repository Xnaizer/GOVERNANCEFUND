import { useState } from "react";
import { HelpCircle, Plus } from "lucide-react";
import { Reveal } from "../motion/Reveal";
import { cn } from "@/utils/cn";

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: "Apa yang membuat dana tidak bisa diselewengkan?",
    a: "Otoritas keuangan sepenuhnya berada on-chain. Pencairan dana hanya terjadi bila 3 tanda tangan EIP-712 yang sah (admin, validator, auditor) terkumpul, dan sebuah program hanya disetujui lewat voting 67% validator. Tidak ada satu orang pun yang bisa menggerakkan dana sendirian.",
  },
  {
    q: "Kalau ada yang memanggil kontrak langsung (bypass aplikasi), apakah berbahaya?",
    a: "Tidak. Kontrak memang publik dan bisa dipanggil siapa saja, tetapi bypass hanya menghasilkan proposal 'yatim' (orphan) yang tidak pernah divoting dan tidak pernah didanai. Sistem justru menampilkannya secara terbuka di tab Flagged sebagai bukti percobaan bypass.",
  },
  {
    q: "Bagaimana dokumen dijamin tidak dipalsukan?",
    a: "Setiap dokumen bukti di-hash dengan SHA-256 dan hash-nya ditanam on-chain (evidenceHash). Mengubah 1 byte saja akan mengubah hash sehingga verifikasi gagal. Program juga di-hash atas 15 field kanonik; bila data Web2 diubah setelah disegel, sistem menandainya sebagai HASH_MISMATCH.",
  },
  {
    q: "Apa peran Auditor yang independen?",
    a: "Auditor bisa membekukan program yang dicurigai curang lewat satu transaksi on-chain yang terlihat publik. Pembekuan lalu diuji lewat voting banding dua-arah oleh validator. Auditor punya skor reputasi sendiri: dihukum untuk pembekuan keliru, dihargai untuk pembekuan yang terbukti benar.",
  },
  {
    q: "Bisakah publik memantau aliran dana tanpa login?",
    a: "Bisa. Public Budget Explorer terbuka untuk semua orang, dengan tab Active, Finished, Flagged, dan Fraud. Bahkan percobaan kecurangan tidak disembunyikan — ditampilkan apa adanya sebagai fitur transparansi.",
  },
  {
    q: "Apa bedanya tab 'Flagged' dan 'Fraud'?",
    a: "Flagged berarti anomali teknis yang masih dugaan (orphan atau hash mismatch). Fraud berarti kecurangan yang sudah terbukti lewat keputusan governance — validator secara aktif menolak banding sehingga status menjadi FRAUD_CONFIRMED yang final.",
  },
];

function FaqRow({
  item,
  open,
  onToggle,
}: {
  item: Faq;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-black/5 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 py-5 text-left"
      >
        <span className="flex-1 font-display text-base font-medium tracking-tight text-foreground sm:text-lg">
          {item.q}
        </span>
        <span
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center   transition-transform duration-300",
            open && "rotate-45 ",
          )}
        >
          <Plus className="h-5 w-5" />
        </span>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open
            ? "grid-rows-[1                                                                                                              fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-5 pr-12 text-sm leading-relaxed text-muted-foreground">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FrequentlyAskQuestion() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section
      data-nav-theme="light"
      className="bg-background px-6 pb-24 pt-4 sm:pb-28"
    >
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.25em] text-brand-blue">
            <HelpCircle className="h-3.5 w-3.5" /> Pertanyaan umum
          </span>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-4xl">
            Hal yang sering ditanyakan.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Ringkas soal bagaimana GovernanceFund membuat kecurangan mustahil
            secara mekanis — bukan sekadar mengauditnya setelah terjadi.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-8">
          <div className="rounded-3xl border border-black/5 bg-white px-6 shadow-soft sm:px-8 dark:bg-white/5">
            {FAQS.map((item, i) => (
              <FaqRow
                key={item.q}
                item={item}
                open={openFaq === i}
                onToggle={() => setOpenFaq((cur) => (cur === i ? null : i))}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
