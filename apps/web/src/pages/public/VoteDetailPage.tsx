import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { ListShell } from "../../components/layout/ListShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { fetchRoleVote } from "../../api/votesApi";
import { useAdminThreshold, useRoleVoteCount } from "../../hooks/useGovReads";
import { formatShortenAddress } from "../../utils/format";

export function VoteDetailPage() {
  const { id } = useParams();
  const voteId = Number(id);
  const { data: v, isLoading, isError } = useQuery({
    queryKey: ["role-vote", voteId],
    queryFn: () => fetchRoleVote(voteId),
    enabled: voteId >= 0,
  });
  const { total, threshold } = useAdminThreshold();
  const onchainCount = useRoleVoteCount(voteId);

  return (
    <ListShell max="max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/governance/votes"><ArrowLeft className="h-4 w-4" /> Voting Peran</Link>
      </Button>
      {isLoading && <Spinner label="Memuat…" />}
      {isError && <Badge variant="destructive">Voting tidak ditemukan.</Badge>}

      {v && (
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0 font-semibold">
            Voting #{v.voteId}
            <Badge variant={v.isDevote ? "destructive" : "default"}>{v.isDevote ? "Devote" : "Grant"}</Badge>
            <Badge variant={v.executed ? "success" : "secondary"}>{v.executed ? "Selesai" : "Berjalan"}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div>
              <span className="text-xs uppercase text-muted-foreground">Peran</span>
              <p>{v.roleToTarget}</p>
            </div>
            <div>
              <span className="text-xs uppercase text-muted-foreground">Kandidat / Target</span>
              <p className="font-mono">{formatShortenAddress(v.candidate)}</p>
            </div>
            <div>
              <span className="text-xs uppercase text-muted-foreground">Suara</span>
              <p>
                <b>{onchainCount || v.voteCount}</b> / {threshold} ambang · dari {total} admin
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </ListShell>
  );
}
