import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ListShell } from "../../components/layout/ListShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { Paginator, usePaginated } from "../../components/ui/Paginator";
import { SearchInput } from "../../components/ui/SearchInput";
import { FilterTabs } from "../../components/ui/FilterTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchPublicUsers } from "../../api/publicUsersApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { formatShortenAddress } from "../../utils/format";

const ROLES = [
  { key: "ALL", label: "Semua" }, { key: "ADMIN", label: "ADMIN" }, { key: "VALIDATOR", label: "VALIDATOR" },
  { key: "AUDITOR", label: "AUDITOR" }, { key: "PIC", label: "PIC" },
] as const;

function initials(s: string): string {
  return s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

export function UsersPage() {
  const [role, setRole] = useState<string>("ALL");
  const [sort, setSort] = useState<"reputation" | "recent">("reputation");
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search);

  const q = useQuery({
    queryKey: ["public-users", role, sort],
    queryFn: () => fetchPublicUsers({ role: role === "ALL" ? undefined : role, sort, limit: 100 }),
  });

  const filtered = useMemo(() => {
    const s = debounced.trim().toLowerCase();
    return (q.data?.users ?? []).filter((u) =>
      !s || (u.name ?? "").toLowerCase().includes(s) || u.username.toLowerCase().includes(s) || (u.walletAddress ?? "").toLowerCase().includes(s),
    );
  }, [q.data, debounced]);

  const { page, setPage, totalPages, pageItems } = usePaginated(filtered, 12);

  return (
    <ListShell>
      <PageHeader
        title="Direktori Pengguna"
        subtitle="Transparansi peserta tata kelola: admin, validator, auditor, dan PIC."
        actions={
          <Button size="sm" variant="secondary" onClick={() => setSort((s) => (s === "reputation" ? "recent" : "reputation"))}>
            Urut: {sort === "reputation" ? "Reputasi" : "Terbaru"}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterTabs items={ROLES as unknown as { key: string; label: string }[]} value={role} onChange={(k) => { setRole(k); setPage(1); }} />
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Cari nama / wallet…" className="sm:ml-auto sm:max-w-xs" />
      </div>

      <QueryState
        isLoading={q.isLoading}
        isError={q.isError}
        error={q.error}
        isEmpty={filtered.length === 0}
        onRetry={q.refetch}
        emptyTitle="Tidak ada pengguna"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pageItems.map((u) => {
            const label = u.name ?? u.username;
            return (
              <Card key={u.id} className="transition-transform hover:scale-[1.01]">
                <Link to={`/users/${u.id}`}>
                  <CardContent className="flex flex-row items-center gap-3 p-4">
                    <Avatar className="h-11 w-11">
                      {u.profilePictureURL && <AvatarImage src={u.profilePictureURL} alt={label} />}
                      <AvatarFallback>{initials(label)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{label}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.walletAddress ? formatShortenAddress(u.walletAddress) : "tanpa wallet"}
                        {u.institution ? ` · ${u.institution}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge>{u.role}</Badge>
                      <span className="text-xs text-muted-foreground">Reputasi {u.reputationScore}</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      </QueryState>
      <Paginator page={page} totalPages={totalPages} onChange={setPage} />
    </ListShell>
  );
}
