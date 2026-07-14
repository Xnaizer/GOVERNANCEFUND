import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users2 } from "lucide-react";
import { ListShell } from "../../components/layout/ListShell";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { Reveal } from "../../components/motion/Reveal";
import { Paginator } from "../../components/ui/Paginator";
import { SearchInput } from "../../components/ui/SearchInput";
import { FilterTabs } from "../../components/ui/FilterTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchPublicUsers } from "../../services/publicUsersApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useBriefLoading } from "../../hooks/useBriefLoading";
import { formatShortenAddress } from "../../utils/format";

const ROLES = [
  { key: "ALL", label: "Semua" },
  { key: "ADMIN", label: "ADMIN" },
  { key: "VALIDATOR", label: "VALIDATOR" },
  { key: "AUDITOR", label: "AUDITOR" },
  { key: "PIC", label: "PIC" },
] as const;


const ROLE_COLOR: Record<string, string> = {
  ADMIN: "#4899EA",
  VALIDATOR: "#67F3CE",
  AUDITOR: "#C084FC",
  PIC: "#38BDF8",
  USER: "#94a3b8",
};

function initials(s: string): string {
  return (
    s
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function UsersPage() {
  const [role, setRole] = useState<string>("ALL");
  const [sort, setSort] = useState<"reputation" | "recent">("reputation");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedValue(search);

  const q = useQuery({
    queryKey: ["public-users", role, sort, page],
    queryFn: () =>
      fetchPublicUsers({
        role: role === "ALL" ? undefined : role,
        sort,
        page,
        limit: 12,
      }),
    placeholderData: (prev) => prev,
  });
  const totalPages = q.data?.pagination?.totalPages ?? 1;

  const filtered = useMemo(() => {
    const s = debounced.trim().toLowerCase();
    return (q.data?.users ?? []).filter(
      (u) =>
        !s ||
        (u.name ?? "").toLowerCase().includes(s) ||
        u.username.toLowerCase().includes(s) ||
        (u.walletAddress ?? "").toLowerCase().includes(s),
    );
  }, [q.data, debounced]);

  const flashing = useBriefLoading(`${role}|${sort}|${debounced}|${page}`);

  return (
    <ListShell>
      <PageHeader
        eyebrow="Direktori"
        title="Direktori Pengguna"
        gradient
        subtitle="Transparansi peserta tata kelola: admin, validator, auditor, dan PIC."
        actions={
          <Button
            size="sm"
            variant="secondary"
            className="shadow-none"
            onClick={() => {
              setSort((s) => (s === "reputation" ? "recent" : "reputation"));
              setPage(1);
            }}
          >
            Urut: {sort === "reputation" ? "Reputasi" : "Terbaru"}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterTabs
          items={ROLES as unknown as { key: string; label: string }[]}
          value={role}
          onChange={(k) => {
            setRole(k);
            setPage(1);
          }}
        />
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
        emptyIcon={<Users2 />}
        emptyTitle="Belum ada pengguna"
        emptyDescription="Tidak ada pengguna yang cocok dengan filter ini."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((u) => {
              const label = u.name ?? u.username;
              const accent = ROLE_COLOR[u.role] ?? ROLE_COLOR.USER;
              return (
                <Card
                  key={u.id}
                  className="rounded-sm border-black/5 shadow-none transition-colors duration-300 hover:border-brand-blue/30 hover:bg-muted/30"
                >
                  <Link to={`/users/${u.id}`}>
                    <CardContent className="flex flex-row items-center gap-3 p-4">
                      <Avatar className="h-11 w-11">
                        {u.profilePictureURL && (
                          <AvatarImage src={u.profilePictureURL} alt={label} />
                        )}
                        <AvatarFallback
                          style={{
                            backgroundColor: `${accent}1f`,
                            color: accent,
                          }}
                        >
                          {initials(label)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display font-semibold tracking-tight">
                          {label}
                        </p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {u.walletAddress
                            ? formatShortenAddress(u.walletAddress)
                            : "tanpa wallet"}
                          {u.institution ? ` · ${u.institution}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge
                          className="rounded-sm border-transparent"
                          style={{
                            backgroundColor: `${accent}1f`,
                            color: accent,
                          }}
                        >
                          {u.role}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Reputasi{" "}
                          <b className="font-mono text-foreground">
                            {u.reputationScore}
                          </b>
                        </span>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </Reveal>
      </QueryState>
      <Paginator page={page} totalPages={totalPages} onChange={setPage} />
    </ListShell>
  );
}
