import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { ConfirmButton } from "../../components/ui/ConfirmButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyPrograms } from "../../hooks/useMyPrograms";
import { useSubmitProposal } from "../../hooks/useSubmitProposal";
import { StatusChip } from "../../components/StatusChip";
import { formatIDR } from "../../utils/format";
import type { ProgramListItem } from "../../types/program";

function SubmitButton({ p }: { p: ProgramListItem }) {
  const { submit, state, error } = useSubmitProposal(p.programId);
  return (
    <div className="flex items-center gap-2">
      <ConfirmButton
        triggerLabel="Submit on-chain"
        triggerProps={{ size: "sm", color: "primary" }}
        title={`Submit program #${p.programId} ke blockchain?`}
        confirmLabel="Ya, submit on-chain"
        toasts={{ loading: "Submit on-chain…", success: "Ter-anchor on-chain." }}
        action={() => submit()}
        warnings={[
          "Men-submit mengunci hash data program ON-CHAIN — data yang tersegel tidak bisa diubah lagi.",
          "Program masuk antrean voting validator (butuh min. 3 validator). Transaksi memerlukan gas.",
        ]}
      />
      {state === "syncing" && <span className="text-xs text-amber-600">menunggu webhook…</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

export function MyProgramsPage() {
  const { data: programs, isLoading, isError, error, refetch } = useMyPrograms();
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Program Saya"
        subtitle="Kelola draft & program on-chain Anda."
        actions={<Button asChild><Link to="/dashboard/programs/new">+ Buat Program</Link></Button>}
      />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={(programs?.length ?? 0) === 0}
        onRetry={refetch}
        emptyTitle="Belum ada program"
        emptyDescription="Buat draft program pertama Anda."
        emptyAction={<Button asChild variant="secondary"><Link to="/dashboard/programs/new">Buat Program</Link></Button>}
      >
        {programs?.map((p) => (
          <Card key={p.programId}>
            <CardContent className="flex flex-row flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/programs/${p.programId}`} className="font-semibold hover:underline">
                    #{p.programId} {p.title ?? "(draft)"}
                  </Link>
                  <StatusChip status={p.status} />
                  {!p.isOnChain && <Badge variant="warning">draft (off-chain)</Badge>}
                </div>
                <p className="font-mono text-sm text-muted-foreground">{formatIDR(p.totalBudget)}</p>
              </div>
              {!p.isOnChain && <SubmitButton p={p} />}
              <Button asChild size="sm" variant="secondary">
                <Link to={`/dashboard/programs/${p.programId}/manage`}>Kelola</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </QueryState>
    </div>
  );
}
