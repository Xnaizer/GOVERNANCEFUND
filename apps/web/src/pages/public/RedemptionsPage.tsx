import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ListShell } from "../../components/layout/ListShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { Paginator, usePaginated } from "../../components/ui/Paginator";
import { SearchInput } from "../../components/ui/SearchInput";
import { FilterTabs } from "../../components/ui/FilterTabs";
import { DataTable } from "../../components/ui/DataTable";
import { UserCell } from "../../components/UserCell";
import { RedemptionStatusChip } from "../../components/RedemptionStatusChip";
import { RedemptionStatsCards } from "../../components/RedemptionStatsCards";
import { useRedemptions, useRedemptionStats } from "../../hooks/useRedemptions";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { formatIDR, formatDate } from "../../utils/format";

const FILTERS = [
  { key: "ALL", label: "Semua" }, { key: "PENDING", label: "Menunggu" },
  { key: "SETTLED", label: "Cair" }, { key: "CANCELLED", label: "Dibatalkan" },
] as const;

export function RedemptionsPage() {
  const q = useRedemptions();
  const statsQ = useRedemptionStats();
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search);

  const filtered = useMemo(() => {
    const s = debounced.trim().toLowerCase();
    return (q.data ?? []).filter((r) => {
      if (filter !== "ALL" && r.status !== filter) return false;
      if (!s) return true;
      const hay = [r.picWallet, r.pic?.name, r.pic?.username, String(r.redemptionId)]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [q.data, filter, debounced]);

  const { page, setPage, totalPages, pageItems } = usePaginated(filtered, 12);
  const stats = statsQ.data;

  type RedemptionRow = NonNullable<typeof q.data>[number];
  const columns: ColumnDef<RedemptionRow, unknown>[] = [
    { id: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-muted-foreground">#{row.original.redemptionId}</span> },
    { id: "pic", header: "PIC", cell: ({ row }) => <UserCell user={row.original.pic} wallet={row.original.picWallet} /> },
    { id: "jumlah", header: "JUMLAH", cell: ({ row }) => <span className="font-mono">{formatIDR(row.original.amount)}</span> },
    { id: "status", header: "STATUS", cell: ({ row }) => <RedemptionStatusChip status={row.original.status} /> },
    { id: "diajukan", header: "DIAJUKAN", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(row.original.requestedAt)}</span> },
  ];

  return (
    <ListShell max="max-w-5xl">
      <PageHeader
        title="Penukaran Token → Rupiah"
        subtitle="Transparansi penukaran e-IDR di Trusted Gateway (two-phase escrow): request → burn/fiat → atau dibatalkan."
      />

      {stats && <RedemptionStatsCards stats={stats} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterTabs items={FILTERS as unknown as { key: string; label: string }[]} value={filter} onChange={(k) => { setFilter(k); setPage(1); }} />
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari PIC / wallet / #ID…" className="sm:ml-auto sm:max-w-xs" />
      </div>

      <QueryState
        isLoading={q.isLoading}
        isError={q.isError}
        error={q.error}
        isEmpty={filtered.length === 0}
        onRetry={q.refetch}
        emptyTitle="Belum ada penukaran"
      >
        <DataTable columns={columns} data={pageItems} minWidth={640} />
      </QueryState>
      <Paginator page={page} totalPages={totalPages} onChange={setPage} />
    </ListShell>
  );
}
