import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useProgramsByStatus } from "../../hooks/useProgramsByStatus";
import { useVoteProposal } from "../../hooks/useVoteProposal";
import { useValidatorThreshold, useProposalVoteCount } from "../../hooks/useGovReads";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "../../utils/format";
import type { ProgramListItem } from "../../types/program";

function VoteCount({ programId, total, threshold }: { programId: number; total: number; threshold: number }) {
  const count = useProposalVoteCount(programId);
  return (
    <Badge variant={count >= threshold ? "success" : "secondary"}>
      {count}/{threshold} suara · {total} validator
    </Badge>
  );
}

function VoteBtn({ p }: { p: ProgramListItem }) {
  const { vote, busy } = useVoteProposal(p.programId);
  const [open, setOpen] = useState(false);
  const confirm = async () => {
    const pr = vote();
    toast.promise(pr, { loading: "Mengirim vote…", success: "Vote terkirim (tally menyusul via webhook).", error: (e) => (e as Error)?.message ?? "Gagal" });
    try {
      await pr;
      setOpen(false);
    } catch { /* biarkan dialog terbuka */ }
  };
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Setujui</Button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        isLoading={busy}
        title={`Setujui proposal #${p.programId}?`}
        confirmLabel="Ya, kirim vote"
        warnings={[
          "Vote persetujuan bersifat FINAL dan tidak bisa dibatalkan setelah masuk ke blockchain.",
          "Menyetujui berarti mengizinkan pencairan anggaran program ini bila ambang BFT (⌊2N/3⌋+1) tercapai.",
          "Transaksi memerlukan gas — pastikan wallet & jaringan Base Sepolia sudah benar.",
        ]}
      />
    </>
  );
}

export function ProposalsPage() {
  const { data, isLoading, isError, error, refetch } = useProgramsByStatus(["PENDING"]);
  const { total, threshold } = useValidatorThreshold();
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Voting Proposal"
        subtitle="Program PENDING menunggu persetujuan validator (BFT ⌊2N/3⌋+1)."
      />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={(data?.length ?? 0) === 0}
        onRetry={refetch}
        emptyTitle="Tidak ada proposal menunggu"
        emptyDescription="Proposal PENDING baru akan muncul di sini."
      >
        {data?.map((p) => (
          <Card key={p.programId}>
            <CardContent className="flex flex-row items-center gap-4 p-4">
              <div className="flex-1">
                <Link to={`/programs/${p.programId}`} className="font-semibold hover:underline">#{p.programId} {p.title}</Link>
                <p className="font-mono text-sm text-muted-foreground">{formatIDR(p.totalBudget)} · {p.milestoneCount} milestone</p>
                {p.pic && (
                  <p className="text-xs text-muted-foreground">
                    PIC: <Link to={`/users/${p.pic.id}`} className="text-brand-blue hover:underline">{p.pic.name ?? p.pic.username}</Link> · reputasi {p.pic.reputationScore}
                  </p>
                )}
                <div className="mt-1"><VoteCount programId={p.programId} total={total} threshold={threshold} /></div>
              </div>
              <VoteBtn p={p} />
            </CardContent>
          </Card>
        ))}
      </QueryState>
    </div>
  );
}
