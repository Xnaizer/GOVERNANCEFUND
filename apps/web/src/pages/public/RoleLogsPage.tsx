import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { ListShell } from "../../components/layout/ListShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { Reveal } from "../../components/motion/Reveal";
import { Paginator } from "../../components/ui/Paginator";
import { SearchInput } from "../../components/ui/SearchInput";
import { FilterTabs } from "../../components/ui/FilterTabs";
import { DataTable } from "../../components/ui/DataTable";
import { UserCell } from "../../components/UserCell";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { fetchRoleLogs } from "../../services/logsApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useBriefLoading } from "../../hooks/useBriefLoading";
import { formatDate } from "../../utils/format";

const FILTERS = [
  { key: "ALL", label: "Semua" },
  { key: "GRANT", label: "Grant" },
  { key: "REVOKE", label: "Revoke" },
] as const;

export function RoleLogsPage() {
  const [page, setPage] = useState(1);
  const q = useQuery({
    queryKey: ["role-logs", page],
    queryFn: () => fetchRoleLogs({ page, limit: 12 }),
    placeholderData: (prev) => prev,
  });
  const rows = q.data?.rows ?? [];
  const totalPages = q.data?.pagination?.totalPages ?? 1;
  const [filter, setFilter] = useState<string>("ALL");
  const [role, setRole] = useState("ALL");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search);

  const roles = useMemo(
    () => [
      "ALL",
      ...Array.from(new Set(rows.map((l) => l.targetRole).filter(Boolean))),
    ],
    [rows],
  );

  const filtered = useMemo(() => {
    const s = debounced.trim().toLowerCase();
    return rows.filter((l) => {
      const isRevoke = l.changeType.includes("REVOK");
      if (filter === "GRANT" && isRevoke) return false;
      if (filter === "REVOKE" && !isRevoke) return false;
      if (role !== "ALL" && l.targetRole !== role) return false;
      if (!s) return true;
      const hay = [
        l.targetUser?.name,
        l.targetUser?.username,
        l.targetWallet,
        l.actorUser?.name,
        l.actorUser?.username,
        l.actorWallet,
        l.changeType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [rows, filter, role, debounced]);

  const flashing = useBriefLoading(`${filter}|${role}|${debounced}|${page}`);

  type LogRow = (typeof rows)[number];
  const columns: ColumnDef<LogRow, unknown>[] = [
    {
      id: "aksi",
      header: "AKSI",
      cell: ({ row }) => {
        const isRevoke = row.original.changeType.includes("REVOK");
        return (
          <Badge
            variant={isRevoke ? "destructive" : "default"}
            className="gap-1"
          >
            <ArrowRight className="h-3 w-3" /> {isRevoke ? "Revoke" : "Grant"}
          </Badge>
        );
      },
    },
    {
      id: "role",
      header: "ROLE",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.targetRole}</Badge>
      ),
    },
    {
      id: "kepada",
      header: "KEPADA",
      cell: ({ row }) => (
        <UserCell
          user={row.original.targetUser}
          wallet={row.original.targetWallet}
        />
      ),
    },
    {
      id: "oleh",
      header: "OLEH",
      cell: ({ row }) =>
        row.original.actorUser || row.original.actorWallet ? (
          <UserCell
            user={row.original.actorUser}
            wallet={row.original.actorWallet}
          />
        ) : (
          <span className="text-xs text-muted-foreground">
            — (BFT kolektif)
          </span>
        ),
    },
    {
      id: "waktu",
      header: "WAKTU",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <ListShell max="max-w-5xl">
      <PageHeader
        eyebrow="Governance"
        title="Log Perubahan Peran"
        gradient
        subtitle="Jejak transparan setiap grant/revoke peran on-chain."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterTabs
          items={FILTERS as unknown as { key: string; label: string }[]}
          value={filter}
          onChange={(k) => {
            setFilter(k);
            setPage(1);
          }}
        />
        <Select
          value={role}
          onValueChange={(v) => {
            setRole(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 sm:max-w-45">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r} value={r}>
                {r === "ALL" ? "Semua role" : r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Cari nama / wallet…"
          className="sm:ml-auto sm:max-w-xs"
        />
      </div>

      <QueryState
        isLoading={q.isLoading || flashing}
        isError={q.isError}
        error={q.error}
        isEmpty={filtered.length === 0}
        onRetry={q.refetch}
        emptyTitle="Belum ada perubahan peran"
        emptyDescription="Jejak grant/revoke peran akan muncul di sini."
      >
        <Reveal>
          <DataTable columns={columns} data={filtered} minWidth={640} />
        </Reveal>
      </QueryState>
      <Paginator page={page} totalPages={totalPages} onChange={setPage} />
    </ListShell>
  );
}
