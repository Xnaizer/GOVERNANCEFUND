import { useMemo, useState } from "react";
import { ListShell } from "../components/layout/ListShell";
import { PageHeader } from "../components/ui/PageHeader";
import { StatsBar } from "../components/StatsBar";
import { ProgramBento } from "../components/ProgramBento";
import { Reveal } from "../components/motion/Reveal";
import { Paginator } from "../components/ui/Paginator";
import { SearchInput } from "../components/ui/SearchInput";
import { FilterTabs } from "../components/ui/FilterTabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { usePrograms } from "../hooks/usePrograms";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useBriefLoading } from "../hooks/useBriefLoading";
import type { DisplayTab } from "../types/common";

const TABS: { key: DisplayTab; label: string }[] = [
  { key: "ACTIVE", label: "Active" },
  { key: "FINISHED", label: "Finished" },
  { key: "FLAGGED", label: "Flagged" },
  { key: "FRAUD", label: "Fraud" },
];

export function ExplorerPage() {
  const [tab, setTab] = useState<DisplayTab>("ACTIVE");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const debounced = useDebouncedValue(search);
  const { data, isLoading, isFetching } = usePrograms(tab, page);

  const programs = data?.programs ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const categories = useMemo(
    () => ["ALL", ...Array.from(new Set(programs.map((p) => p.category).filter(Boolean) as string[]))],
    [programs],
  );

  // Search + kategori bekerja pada halaman server yang aktif (kompromi skala akademik).
  const filtered = useMemo(() => {
    const s = debounced.trim().toLowerCase();
    return programs.filter((p) => {
      if (category !== "ALL" && p.category !== category) return false;
      if (!s) return true;
      return String(p.programId).includes(s) || (p.title ?? "").toLowerCase().includes(s);
    });
  }, [programs, debounced, category]);

  const flashing = useBriefLoading(`${tab}|${category}|${debounced}|${page}`);

  return (
    <ListShell max="max-w-6xl">
      <PageHeader
        eyebrow="Explorer publik"
        title="Public Budget Explorer"
        gradient
        subtitle="Pantau sirkulasi dana publik secara transparan — tanpa perlu login."
      />

      <StatsBar />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterTabs items={TABS} value={tab} onChange={(k) => { setTab(k); setPage(1); }} />
        <div className="flex flex-col gap-3 sm:ml-auto sm:flex-row">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari judul atau #ID…" className="sm:max-w-xs" />
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
            <SelectTrigger className="h-8 sm:max-w-45"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c === "ALL" ? "Semua kategori" : c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Reveal>
        <ProgramBento programs={filtered} isLoading={isLoading || isFetching || flashing} />
      </Reveal>
      <Paginator page={page} totalPages={totalPages} onChange={setPage} />
    </ListShell>
  );
}
