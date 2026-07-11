import { useMemo, useState } from "react";
import { ListShell } from "../components/layout/ListShell";
import { StatsBar } from "../components/StatsBar";
import { ProgramBento } from "../components/ProgramBento";
import { Paginator, usePaginated } from "../components/ui/Paginator";
import { SearchInput } from "../components/ui/SearchInput";
import { FilterTabs } from "../components/ui/FilterTabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { usePrograms } from "../hooks/usePrograms";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { DisplayTab } from "../types/common";

const TABS: { key: DisplayTab; label: string }[] = [
  { key: "ACTIVE", label: "Active" },
  { key: "FINISHED", label: "Finished" },
  { key: "FLAGGED", label: "Flagged" },
  { key: "FRAUD", label: "Fraud" },
];

export function ExplorerPage() {
  const [tab, setTab] = useState<DisplayTab>("ACTIVE");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const debounced = useDebouncedValue(search);
  const { data, isLoading } = usePrograms(tab);

  const programs = data?.programs ?? [];
  const categories = useMemo(
    () => ["ALL", ...Array.from(new Set(programs.map((p) => p.category).filter(Boolean) as string[]))],
    [programs],
  );

  const filtered = useMemo(() => {
    const s = debounced.trim().toLowerCase();
    return programs.filter((p) => {
      if (category !== "ALL" && p.category !== category) return false;
      if (!s) return true;
      return String(p.programId).includes(s) || (p.title ?? "").toLowerCase().includes(s);
    });
  }, [programs, debounced, category]);

  const { page, setPage, totalPages, pageItems } = usePaginated(filtered, 12);

  return (
    <ListShell max="max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold">Public Budget Explorer</h1>
        <p className="text-muted-foreground">Pantau sirkulasi dana publik secara transparan.</p>
      </div>

      <StatsBar />

      <FilterTabs items={TABS} value={tab} onChange={(k) => { setTab(k); setPage(1); }} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari judul atau #ID…" className="sm:max-w-xs" />
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="h-8 sm:max-w-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map((c) => <SelectItem key={c} value={c}>{c === "ALL" ? "Semua kategori" : c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <ProgramBento programs={pageItems} isLoading={isLoading} />
      <Paginator page={page} totalPages={totalPages} onChange={setPage} />
    </ListShell>
  );
}
