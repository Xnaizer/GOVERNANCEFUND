import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Bagi array jadi halaman client-side + kontrol Pagination. */
export function usePaginated<T>(items: T[], perPage = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const clampedPage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => items.slice((clampedPage - 1) * perPage, clampedPage * perPage),
    [items, clampedPage, perPage],
  );
  return { page: clampedPage, setPage, totalPages, pageItems };
}

/** Deret nomor halaman berjendela: 1 … p-1 p p+1 … N */
function pageWindow(page: number, total: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  const add = (n: number) => out.push(n);
  const lo = Math.max(2, page - 1);
  const hi = Math.min(total - 1, page + 1);
  add(1);
  if (lo > 2) out.push("…");
  for (let i = lo; i <= hi; i++) add(i);
  if (hi < total - 1) out.push("…");
  if (total > 1) add(total);
  return out;
}

export function Paginator({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <Button size="icon" variant="outline" className="h-8 w-8" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Sebelumnya">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-sm text-muted-foreground">…</span>
        ) : (
          <Button
            key={p}
            size="icon"
            variant={p === page ? "default" : "outline"}
            className="h-8 w-8 text-xs"
            onClick={() => onChange(p)}
          >
            {p}
          </Button>
        ),
      )}
      <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Berikutnya">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
