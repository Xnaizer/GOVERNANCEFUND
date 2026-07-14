import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "../../components/ui/PageHeader";
import { FormInput, FormTextarea } from "../../components/ui/FormField";
import { SkeletonList } from "../../components/ui/Skeleton";
import { ConfirmButton } from "../../components/ui/ConfirmButton";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { getProgramDetailAuthed } from "../../services/programApi";
import {
  uploadMilestoneEvidence,
  uploadWithdrawalReceipt,
} from "../../services/uploadApi";
import {
  useWithdraw,
  useFinalizeMilestone,
  useProposeAppeal,
} from "../../hooks/usePicActions";
import { withdrawSchema, type WithdrawForm } from "../../schemas/withdraw";
import { StatusChip } from "../../components/StatusChip";
import { formatIDR, formatDate } from "../../utils/format";
import { getErrorMessage } from "../../utils/error";
import { useReleaseMilestone } from "../../hooks/useReleaseMilestone";
import { useSignatures } from "../../hooks/useSignatures";
import { useResetSignatures } from "../../hooks/useResetSignatures";
import type { Milestone } from "../../types/milestone";
import type { Withdrawal } from "../../types/program";

function WithdrawalManageRow({
  programId,
  w,
}: {
  programId: number;
  w: Withdrawal;
}) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      await toast.promise(uploadWithdrawalReceipt(w.id, file), {
        loading: "Mengunggah receipt…",
        success: "Receipt terunggah.",
        error: (e) => getErrorMessage(e),
      });
      await qc.invalidateQueries({ queryKey: ["program-authed", programId] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-black/5 py-2.5 text-sm last:border-0">
      <span className="font-mono">{formatIDR(w.amount)}</span>
      <span className="text-muted-foreground">{w.recipientName ?? "—"}</span>
      <span className="text-muted-foreground/70">
        {formatDate(w.timestamp)}
      </span>
      <div className="ml-auto flex items-center gap-2">
        {w.receiptUrl ? (
          <a href={w.receiptUrl} target="_blank" rel="noreferrer">
            <Badge variant="success" className="rounded-sm">
              lihat receipt
            </Badge>
          </a>
        ) : (
          <Button asChild size="sm" variant="secondary">
            <label htmlFor={`receipt-${w.id}`} className="cursor-pointer">
              {busy && <Spinner size={16} className="text-current" />}
              Unggah receipt
              <input
                id={`receipt-${w.id}`}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
            </label>
          </Button>
        )}
      </div>
    </div>
  );
}

function MilestoneRow({
  programId,
  currentMilestone,
  m,
}: {
  programId: number;
  currentMilestone: number;
  m: Milestone;
}) {
  const qc = useQueryClient();
  const isActive =
    m.milestoneIndex === currentMilestone && m.status === "PLANNED";
  const sigs = useSignatures(isActive ? m.id : undefined);
  const rel = useReleaseMilestone(
    programId,
    m.id,
    m.milestoneIndex,
    m.milestoneBudget,
    m.evidenceHash,
  );
  const resetSig = useResetSignatures(programId);
  const [file, setFile] = useState<File | null>(null);

  const uploadEvidence = async () => {
    if (!file) return;
    await uploadMilestoneEvidence(m.id, file);
    setFile(null);
    await qc.invalidateQueries({ queryKey: ["program-authed", programId] });
  };

  const canRelease = !!sigs.data?.complete && !!m.evidenceHash;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-black/5 py-2.5 text-sm last:border-0">
      <b>#{m.milestoneIndex + 1}</b> {m.title ?? "—"}
      <Badge variant="secondary" className="rounded-sm">
        {m.status}
      </Badge>
      {m.evidenceHash ? (
        <Badge variant="success" className="rounded-sm">
          bukti ✓
        </Badge>
      ) : (
        isActive && (
          <Badge variant="warning" className="rounded-sm">
            belum ada bukti
          </Badge>
        )
      )}
      <span className="ml-auto font-mono">{formatIDR(m.milestoneBudget)}</span>
      {isActive && (
        <span className="text-xs text-muted-foreground">
          {sigs.data?.collected ?? 0}/3 sig
        </span>
      )}
      {isActive && !m.evidenceHash && (
        <ConfirmButton
          triggerLabel="Unggah Bukti"
          triggerProps={{ size: "sm", color: "secondary", variant: "flat" }}
          title={`Unggah bukti milestone #${m.milestoneIndex + 1}`}
          confirmLabel="Ya, unggah bukti"
          confirmColor="secondary"
          confirmDisabled={!file}
          checkboxLabel="Saya sudah memastikan berkas benar dan menyadari bukti ini permanen."
          toasts={{
            loading: "Mengunggah bukti…",
            success: "Bukti terunggah (hash di-anchor).",
          }}
          action={uploadEvidence}
          warnings={[
            "Dokumen akan di-hash (SHA-256) dan di-anchor ON-CHAIN sebagai evidenceHash.",
            "Setelah para penanda tangan menandatangani dokumen ini, bukti TIDAK bisa dihapus atau diganti.",
            "Pastikan berkas sudah benar sebelum mengunggah.",
          ]}
          dialogChildren={
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`evidence-${m.id}`}>Dokumen bukti</Label>
              <Input
                id={`evidence-${m.id}`}
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          }
        />
      )}
      {isActive && (sigs.data?.collected ?? 0) > 0 && (
        <ConfirmButton
          triggerLabel="Reset TTD"
          triggerProps={{ size: "sm", color: "danger", variant: "light" }}
          title={`Reset tanda tangan milestone #${m.milestoneIndex + 1}?`}
          confirmLabel="Ya, reset tanda tangan"
          confirmColor="danger"
          toasts={{ loading: "Mereset…", success: "Set tanda tangan direset." }}
          action={() => resetSig.mutateAsync(m.id)}
          warnings={[
            "Semua tanda tangan yang sudah terkumpul untuk milestone ini akan DIHAPUS.",
            "Lakukan hanya bila dokumen bukti diganti. Penandatangan harus tanda tangan ulang.",
            "Hanya bisa saat milestone masih PLANNED.",
          ]}
        />
      )}
      {isActive &&
        (canRelease ? (
          <ConfirmButton
            triggerLabel="Rilis"
            triggerProps={{ size: "sm", color: "success", variant: "flat" }}
            title={`Rilis milestone #${m.milestoneIndex + 1}?`}
            confirmLabel="Ya, rilis milestone"
            confirmColor="success"
            toasts={{
              loading: "Rilis…",
              success: "Milestone dirilis (DRAWABLE).",
            }}
            action={() => rel.release()}
            warnings={[
              "Merilis milestone mengunci 3 tanda tangan EIP-712 secara permanen on-chain.",
              "Status milestone menjadi DRAWABLE dan kuota siap ditarik. Aksi tidak bisa dibatalkan.",
            ]}
          />
        ) : (
          <Button size="sm" variant="secondary" disabled>
            Rilis {!m.evidenceHash ? "(butuh bukti)" : "(butuh 3 sig)"}
          </Button>
        ))}
    </div>
  );
}

export function ProgramManagePage() {
  const { id } = useParams();
  const programId = Number(id);
  const { data: p, isLoading } = useQuery({
    queryKey: ["program-authed", programId],
    queryFn: () => getProgramDetailAuthed(programId),
    enabled: programId > 0,
  });

  const wd = useWithdraw(programId);
  const fin = useFinalizeMilestone(programId);
  const appeal = useProposeAppeal(programId);

  const [wdOpen, setWdOpen] = useState(false);
  const [pending, setPending] = useState<WithdrawForm | null>(null);
  const { control, handleSubmit, reset } = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    mode: "onTouched",
  });

  
  const onSubmit = handleSubmit((v) => {
    setPending(v);
    setWdOpen(true);
  });
  const confirmWithdraw = async () => {
    if (!pending) return;
    await wd.withdraw(
      pending.amount,
      pending.recipientName,
      pending.description,
    );
    reset();
    setPending(null);
  };

  if (isLoading) return <SkeletonList />;
  if (!p) return <p>Program tidak ditemukan.</p>;

  return (
    <>
      <div className="flex max-w-2xl flex-col gap-6">
        <PageHeader
          back="/dashboard/programs"
          eyebrow="PIC · Kelola"
          title={`#${p.programId} ${p.title ?? "(draft)"}`}
          subtitle={
            <span className="font-mono">
              Budget {formatIDR(p.totalBudget)} · Teralokasi{" "}
              {formatIDR(p.totalAllocatedSoFar)} · Milestone{" "}
              {p.currentMilestone}/{p.milestoneCount}
            </span>
          }
          actions={<StatusChip status={p.status} />}
        />

        {!p.isOnChain && (
          <Badge variant="warning" className="w-fit rounded-sm">
            Belum on-chain — submit dulu dari Program Saya.
          </Badge>
        )}

        {p.status === "DRAWABLE" && (
          <>
            <Card>
              <CardHeader className="font-semibold">
                Tarik Dana (micro-withdrawal)
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="flex flex-col gap-3">
                  <FormInput
                    control={control}
                    name="amount"
                    label="Jumlah (Rupiah)"
                  />
                  <FormInput
                    control={control}
                    name="recipientName"
                    label="Penerima"
                  />
                  <FormTextarea
                    control={control}
                    name="description"
                    label="Deskripsi"
                  />
                  <Button type="submit" disabled={wd.busy} className="w-fit">
                    {wd.busy && <Spinner size={16} className="text-current" />}
                    Tarik
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="font-semibold">
                Finalisasi Milestone
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Tutup milestone & kembalikan sisa kuota (dapat +reputasi).
                </p>
                <ConfirmButton
                  triggerLabel="Finalisasi Milestone"
                  triggerProps={{
                    color: "secondary",
                    variant: "flat",
                    className: "w-fit",
                    isLoading: fin.busy,
                  }}
                  title="Finalisasi milestone ini?"
                  confirmLabel="Ya, finalisasi"
                  confirmColor="secondary"
                  toasts={{
                    loading: "Finalisasi…",
                    success: "Milestone difinalisasi.",
                  }}
                  action={() => fin.finalize()}
                  warnings={[
                    "Sisa kuota milestone akan DIBATALKAN permanen dan TIDAK kembali ke pool alokasi.",
                    "Milestone langsung ditutup (MILESTONE_ACHIEVED). Aksi tidak bisa dibatalkan.",
                  ]}
                />
              </CardContent>
            </Card>
          </>
        )}

        {p.status === "FROZEN" && (
          <Card className="rounded-2xl border-amber-400 shadow-none">
            <CardHeader className="font-display font-semibold tracking-tight">
              Program Dibekukan
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                Ajukan banding (sekali) untuk membuka voting unfreeze 7 hari dua
                arah.
              </p>
              <ConfirmButton
                triggerLabel="Ajukan Banding Unfreeze"
                triggerProps={{
                  color: "primary",
                  className: "w-fit",
                  isLoading: appeal.busy,
                }}
                title="Ajukan banding unfreeze?"
                confirmLabel="Ya, ajukan banding"
                toasts={{
                  loading: "Mengajukan…",
                  success: "Banding diajukan.",
                }}
                action={() => appeal.propose()}
                warnings={[
                  "Banding hanya bisa diajukan SEKALI per program — tidak ada kesempatan kedua.",
                  "Membuka voting validator dua arah selama 7 hari; hasil reject = FRAUD_CONFIRMED (permanen).",
                ]}
              />
            </CardContent>
          </Card>
        )}

        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader className="font-display font-semibold tracking-tight">
            Milestones
          </CardHeader>
          <CardContent className="flex flex-col">
            {p.milestones.map((m) => (
              <MilestoneRow
                key={m.id}
                programId={p.programId}
                currentMilestone={p.currentMilestone}
                m={m}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader className="font-display font-semibold tracking-tight">
            Riwayat Penarikan &amp; Receipt
          </CardHeader>
          <CardContent className="flex flex-col">
            {p.withdrawals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada penarikan.
              </p>
            ) : (
              p.withdrawals.map((w) => (
                <WithdrawalManageRow key={w.id} programId={p.programId} w={w} />
              ))
            )}
          </CardContent>
        </Card>

        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link to={`/programs/${p.programId}`}>Lihat halaman publik →</Link>
        </Button>
      </div>

     
      <ConfirmDialog
        isOpen={wdOpen}
        onClose={() => {
          setWdOpen(false);
          setPending(null);
        }}
        onConfirm={async () => {
          const pr = confirmWithdraw();
          toast.promise(pr, {
            loading: "Menarik…",
            success: "Penarikan terkirim (tunggu webhook).",
            error: (e) => getErrorMessage(e),
          });
          try {
            await pr;
            setWdOpen(false);
          } catch {
           
          }
        }}
        isLoading={wd.busy}
        title="Konfirmasi penarikan dana"
        confirmLabel="Ya, tarik dana"
        warnings={[
          `Menarik ${
            pending ? formatIDR(pending.amount) : ""
          } akan MENCETAK token ke wallet Anda dan tercatat permanen on-chain.`,
          "Penarikan melebihi 90% budget milestone akan memicu peringatan otomatis ke Auditor.",
          "Pastikan jumlah & penerima sudah benar — aksi tidak bisa dibatalkan.",
        ]}
      />
    </>
  );
}
