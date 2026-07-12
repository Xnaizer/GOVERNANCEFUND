import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { useProgramsByStatus } from "../../hooks/useProgramsByStatus";
import { useVoteProposal } from "../../hooks/useVoteProposal";
import { useValidatorThreshold, useProposalVoteCount } from "../../hooks/useGovReads";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { FilterTabs } from "../../components/ui/FilterTabs";
import { SearchInput } from "../../components/ui/SearchInput";
import { DataTable } from "../../components/ui/DataTable";
import { UserCell, MissingUser } from "../../components/UserCell";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { formatIDR } from "../../utils/format";
import type { ProgramListItem } from "../../types/program";

function isAnomaly(p: ProgramListItem): boolean {
  return p.isOrphan || !p.pic || p.integrity !== "VERIFIED";
}

/** Sel suara: count/threshold + mini bar. */
function VoteCell({ programId, total, threshold }: { programId: number; total: number; threshold: number }) {
  const count = useProposalVoteCount(programId);
  const reached = threshold > 0 && count >= threshold;
  const pct = threshold > 0 ? Math.min(100, (count / threshold) * 100) : 0;
  return (
    <div className="min-w-32">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-semibold text-foreground">{count}/{threshold}</span>
        <span className="text-muted-foreground">{total} val</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-muted">
        <div className={cn("h-full rounded-sm transition-all", reached ? "bg-emerald-500" : "bg-brand-blue")} style={{ width: `${pct}%` }} />
      </div>
    </div>
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
  const [tab, setTab] = useState<string>("VALID");
  const [search, setSearch] = useState("");

  const { valid, anomaly } = useMemo(() => {
    const valid: ProgramListItem[] = [];
    const anomaly: ProgramListItem[] = [];
    (data ?? []).forEach((p) => (isAnomaly(p) ? anomaly : valid).push(p));
    return { valid, anomaly };
  }, [data]);

  const shown = useMemo(() => {
    const base = tab === "ANOMALY" ? anomaly : valid;
    const s = search.trim().toLowerCase();
    if (!s) return base;
    return base.filter((p) => {
      const hay = [String(p.programId), p.title, p.pic?.name, p.pic?.username, p.executorName].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [tab, valid, anomaly, search]);

  const columns: ColumnDef<ProgramListItem, unknown>[] = [
    { id: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{row.original.programId}</span> },
    {
      id: "program",
      header: "PROGRAM",
      cell: ({ row }) => (
        <Link to={`/programs/${row.original.programId}`} className="block max-w-55 truncate font-display font-medium tracking-tight hover:text-brand-blue">
          {row.original.title ?? "(tanpa judul)"}
        </Link>
      ),
    },
    {
      id: "pic",
      header: "PIC",
      cell: ({ row }) =>
        isAnomaly(row.original) ? (
          <MissingUser wallet={row.original.picWallet} reason={row.original.isOrphan ? "Orphan" : "PIC tidak terdaftar"} />
        ) : (
          <UserCell user={row.original.pic} wallet={row.original.picWallet} />
        ),
    },
    { id: "budget", header: "ANGGARAN", cell: ({ row }) => <span className="font-mono text-sm font-semibold text-brand-blue">{formatIDR(row.original.totalBudget)}</span> },
    { id: "suara", header: "SUARA", cell: ({ row }) => <VoteCell programId={row.original.programId} total={total} threshold={threshold} /> },
    {
      id: "aksi",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button asChild size="sm" variant="secondary"><Link to={`/programs/${row.original.programId}`}>Detail</Link></Button>
          {isAnomaly(row.original) ? (
            <span className="whitespace-nowrap text-[11px] text-amber-600">tinjau dulu</span>
          ) : (
            <VoteBtn p={row.original} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Validator"
        title="Voting Proposal"
        gradient
        subtitle="Program PENDING menunggu persetujuan validator (BFT ⌊2N/3⌋+1)."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <FilterTabs
          items={[
            { key: "VALID", label: `Bisa Divote (${valid.length})` },
            { key: "ANOMALY", label: `Anomali (${anomaly.length})` },
          ] as unknown as { key: string; label: string }[]}
          value={tab}
          onChange={setTab}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama program atau PIC…" className="sm:ml-auto sm:max-w-xs" />
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={shown.length === 0}
        onRetry={refetch}
        emptyTitle={tab === "ANOMALY" ? "Tidak ada proposal anomali" : "Tidak ada proposal menunggu"}
        emptyDescription={
          tab === "ANOMALY"
            ? "Proposal tanpa PIC terdaftar / orphan akan dipisahkan ke sini."
            : "Proposal PENDING yang valid akan muncul di sini."
        }
      >
        <DataTable columns={columns} data={shown} minWidth={820} />
      </QueryState>
    </div>
  );
}
