import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { ListShell } from "../../components/layout/ListShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StatusChip } from "../../components/StatusChip";
import { fetchPublicUser } from "../../api/publicUsersApi";
import type { ProgramStatus } from "../../types/program";
import { formatIDR, formatShortenAddress, formatDate } from "../../utils/format";

function initials(s: string): string {
  return s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

export function UserDetailPage() {
  const { id } = useParams();
  const { data: u, isLoading, isError } = useQuery({
    queryKey: ["public-user", id],
    queryFn: () => fetchPublicUser(id!),
    enabled: !!id,
  });

  return (
    <ListShell max="max-w-4xl">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/users"><ArrowLeft className="h-4 w-4" /> Direktori Pengguna</Link>
      </Button>
      {isLoading && <Spinner label="Memuat…" />}
      {isError && <Badge variant="destructive">Pengguna tidak ditemukan.</Badge>}

      {u && (
        <>
          <Card className="overflow-hidden pt-0">
            <div className="h-32 w-full bg-linear-to-br from-brand-mint to-brand-blue">
              {u.profileBannerURL && <img src={u.profileBannerURL} alt="banner" className="h-full w-full object-cover" />}
            </div>
            <CardContent className="flex flex-row items-center gap-4 p-4">
              <Avatar className="-mt-10 h-20 w-20 text-lg ring-4 ring-background">
                {u.profilePictureURL && <AvatarImage src={u.profilePictureURL} alt={u.username} />}
                <AvatarFallback>{initials(u.name ?? u.username)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold">{u.name ?? u.username}</h1>
                  <Badge>{u.role}</Badge>
                  {u.isVerified && <Badge variant="success">Verified</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  Reputasi {u.reputationScore}
                  {u.walletAddress ? ` · ${formatShortenAddress(u.walletAddress)}` : ""}
                  {u.institution ? ` · ${u.institution}` : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="font-semibold">Program ({u.programs.length})</CardHeader>
            <CardContent className="flex flex-col gap-2">
              {u.programs.length === 0 && <p className="text-sm text-muted-foreground">Belum ada program.</p>}
              {u.programs.map((p) => (
                <Link key={p.programId} to={`/programs/${p.programId}`} className="flex items-center gap-3 rounded-lg px-2 py-1 text-sm hover:bg-muted">
                  <span className="font-semibold">#{p.programId} {p.title ?? "(draft)"}</span>
                  <StatusChip status={p.status as ProgramStatus} />
                  <span className="ml-auto font-mono text-muted-foreground">{formatIDR(p.totalBudget)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>

          {u.reputationLogs && u.reputationLogs.length > 0 && (
            <Card>
              <CardHeader className="font-semibold">Riwayat Reputasi</CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                {u.reputationLogs.map((l, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Badge variant={l.change >= 0 ? "success" : "destructive"}>{l.change >= 0 ? `+${l.change}` : l.change}</Badge>
                    <span className="text-muted-foreground">{l.reason}</span>
                    <span className="text-muted-foreground/70">→ {l.scoreAfter}</span>
                    <span className="ml-auto text-muted-foreground/70">{formatDate(l.createdAt)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </ListShell>
  );
}
