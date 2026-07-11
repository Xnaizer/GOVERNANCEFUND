import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useProgramsByStatus } from "../../hooks/useProgramsByStatus";
import { useVoteUnfreeze } from "../../hooks/useVoteUnfreeze";
import { useValidatorThreshold, useUnfreezeAppealVotes } from "../../hooks/useGovReads";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "../../utils/format";
import type { ProgramListItem } from "../../types/program";

function AppealCounts({ programId, threshold, total }: { programId: number; threshold: number; total: number }) {
  const { approve, reject } = useUnfreezeAppealVotes(programId);
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      <Badge variant={approve >= threshold ? "success" : "secondary"}>Setuju {approve}/{threshold}</Badge>
      <Badge variant={reject >= threshold ? "destructive" : "secondary"}>Tolak {reject}/{threshold}</Badge>
      <Badge variant="secondary">{total} validator</Badge>
    </div>
  );
}

function AppealBtns({ p }: { p: ProgramListItem }) {
  const { vote, busy } = useVoteUnfreeze(p.programId);
  const [open, setOpen] = useState(false);
  const [approve, setApprove] = useState(true);

  const openDlg = (a: boolean) => { setApprove(a); setOpen(true); };
  const confirm = async () => {
    const pr = vote(approve);
    toast.promise(pr, { loading: "Mengirim vote…", success: "Vote terkirim.", error: (e) => (e as Error)?.message ?? "Gagal" });
    try {
      await pr;
      setOpen(false);
    } catch { /* biarkan dialog terbuka */ }
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="secondary" className="text-emerald-600" onClick={() => openDlg(true)}>Setujui unfreeze</Button>
      <Button size="sm" variant="secondary" className="text-destructive" onClick={() => openDlg(false)}>Tolak (dukung fraud)</Button>
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        isLoading={busy}
        title={approve ? `Setujui unfreeze #${p.programId}?` : `Tolak banding #${p.programId}?`}
        confirmLabel={approve ? "Ya, setujui unfreeze" : "Ya, tolak (dukung fraud)"}
        confirmColor={approve ? "success" : "danger"}
        warnings={
          approve
            ? [
                "Menyetujui = menyatakan PIC TIDAK terbukti bersalah; program kembali ke status DRAWABLE.",
                "Vote bersifat FINAL dan tidak bisa dibatalkan setelah masuk blockchain.",
              ]
            : [
                "Menolak = MENDUKUNG tuduhan fraud terhadap PIC.",
                "Bila ambang tercapai, program menjadi FRAUD_CONFIRMED — status final & PERMANEN, pencairan diblokir selamanya.",
                "Vote bersifat FINAL dan tidak bisa dibatalkan.",
              ]
        }
      />
    </div>
  );
}

export function AppealsPage() {
  const { data, isLoading, isError, error, refetch } = useProgramsByStatus(["FROZEN"]);
  const { total, threshold } = useValidatorThreshold();
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Banding Unfreeze"
        subtitle="Program FROZEN dengan banding aktif. Approve = bebaskan; Reject = kukuhkan fraud."
      />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={(data?.length ?? 0) === 0}
        onRetry={refetch}
        emptyTitle="Tidak ada program beku"
        emptyDescription="Banding unfreeze yang menunggu suara Anda akan muncul di sini."
      >
        {data?.map((p) => (
          <Card key={p.programId}>
            <CardContent className="flex flex-row items-center gap-4 p-4">
              <div className="flex-1">
                <Link to={`/programs/${p.programId}`} className="font-semibold hover:underline">#{p.programId} {p.title}</Link>
                <p className="font-mono text-sm text-muted-foreground">{formatIDR(p.totalBudget)}</p>
                <AppealCounts programId={p.programId} total={total} threshold={threshold} />
              </div>
              <AppealBtns p={p} />
            </CardContent>
          </Card>
        ))}
      </QueryState>
    </div>
  );
}
