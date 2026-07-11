import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ListShell } from "../../components/layout/ListShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { Paginator, usePaginated } from "../../components/ui/Paginator";
import { SearchInput } from "../../components/ui/SearchInput";
import { FilterTabs } from "../../components/ui/FilterTabs";
import { DataTable } from "../../components/ui/DataTable";
import { UserCell } from "../../components/UserCell";
import { Badge } from "@/components/ui/badge";
import { fetchRoleVotes } from "../../api/votesApi";
import { useAdminThreshold } from "../../hooks/useGovReads";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const FILTERS = [
  { key: "ALL", label: "Semua" }, { key: "ONGOING", label: "Berjalan" }, { key: "DONE", label: "Selesai" },
  { key: "GRANT", label: "Grant" }, { key: "DEVOTE", label: "Devote" },
] as const;

export function VotesPage() {
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["role-votes"], queryFn: fetchRoleVotes });
  const { total, threshold } = useAdminThreshold();
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search);

  const filtered = useMemo(() => {
    const s = debounced.trim().toLowerCase();
    return (q.data ?? []).filter((v) => {
      if (filter === "ONGOING" && v.executed) return false;
      if (filter === "DONE" && !v.executed) return false;
      if (filter === "GRANT" && v.isDevote) return false;
      if (filter === "DEVOTE" && !v.isDevote) return false;
      if (!s) return true;
      const hay = [v.candidate, v.candidateUser?.name, v.candidateUser?.username, String(v.voteId), v.roleToTarget]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [q.data, filter, debounced]);

  const { page, setPage, totalPages, pageItems } = usePaginated(filtered, 12);

  type VoteRow = NonNullable<typeof q.data>[number];
  const columns: ColumnDef<VoteRow, unknown>[] = [
    { id: "id", header: "ID", cell: ({ row }) => <span className="font-semibold">#{row.original.voteId}</span> },
    { id: "jenis", header: "JENIS", cell: ({ row }) => <Badge variant={row.original.isDevote ? "destructive" : "default"}>{row.original.isDevote ? "Devote" : "Grant"}</Badge> },
    { id: "role", header: "ROLE", cell: ({ row }) => <Badge variant="secondary">{row.original.roleToTarget}</Badge> },
    { id: "kandidat", header: "KANDIDAT", cell: ({ row }) => <UserCell user={row.original.candidateUser} wallet={row.original.candidate} /> },
    { id: "status", header: "STATUS", cell: ({ row }) => <Badge variant={row.original.executed ? "success" : "secondary"}>{row.original.executed ? "Selesai" : `${row.original.voteCount}/${threshold} suara`}</Badge> },
  ];

  return (
    <ListShell max="max-w-5xl">
      <PageHeader title="Voting Perubahan Peran" subtitle={`Transparansi voting BFT admin. ${total} admin · ambang ${threshold} suara.`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterTabs items={FILTERS as unknown as { key: string; label: string }[]} value={filter} onChange={(k) => { setFilter(k); setPage(1); }} />
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari kandidat / #ID…" className="sm:ml-auto sm:max-w-xs" />
      </div>

      <QueryState
        isLoading={q.isLoading}
        isError={q.isError}
        error={q.error}
        isEmpty={filtered.length === 0}
        onRetry={q.refetch}
        emptyTitle="Belum ada voting peran"
      >
        <DataTable columns={columns} data={pageItems} minWidth={640} onRowClick={(v) => navigate(`/governance/votes/${v.voteId}`)} />
      </QueryState>
      <Paginator page={page} totalPages={totalPages} onChange={setPage} />
    </ListShell>
  );
}
