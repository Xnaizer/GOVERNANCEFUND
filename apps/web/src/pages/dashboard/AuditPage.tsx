import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useProgramsByStatus } from "../../hooks/useProgramsByStatus";
import { useFreezeProgram } from "../../hooks/useFreezeProgram";
import { submitFreezeEvidence } from "../../api/freezeApi";
import { getErrorMessage } from "../../utils/error";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatIDR } from "../../utils/format";
import type { ProgramListItem } from "../../types/program";

function FreezeBtn({ p }: { p: ProgramListItem }) {
  const { freeze, busy, state } = useFreezeProgram(p.programId);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const confirm = async () => {
    // 1) Bekukan on-chain (aksi kritis).
    const fr = freeze();
    toast.promise(fr, { loading: "Membekukan…", success: "Program dibekukan.", error: (e) => (e as Error)?.message ?? "Gagal" });
    try {
      await fr;
      // 2) Simpan alasan/bukti ke Web2 (metadata mengikuti aksi; kegagalan simpan TIDAK membatalkan freeze).
      try {
        await submitFreezeEvidence(p.programId, {
          reason,
          description: description.trim() || undefined,
          evidenceUrl: evidenceUrl.trim() || undefined,
        });
      } catch (e) {
        toast.error(`Program dibekukan, tapi bukti gagal tersimpan: ${getErrorMessage(e)}`);
      }
      setOpen(false);
    } catch { /* freeze gagal → biarkan dialog terbuka */ }
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-600/90" onClick={() => setOpen(true)}>Bekukan</Button>
      {state === "syncing" && <span className="text-xs text-amber-600">menunggu webhook…</span>}
      <ConfirmDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={confirm}
        isLoading={busy}
        title={`Bekukan program #${p.programId}?`}
        confirmLabel="Ya, bekukan program"
        confirmColor="danger"
        confirmDisabled={reason.trim().length === 0}
        checkboxLabel="Saya bertanggung jawab atas pembekuan ini dan telah menyiapkan bukti."
        warnings={[
          "Pembekuan menghentikan SELURUH pencairan dana seketika (status → FROZEN).",
          "Jika PIC ternyata TIDAK bersalah (banding disetujui validator), reputasi Anda sebagai auditor akan TURUN (FALSE_FREEZE) dan Anda menjadi penanggung jawab pembekuan ini.",
          "PIC berhak mengajukan banding — voting unfreeze dua arah selama 7 hari.",
          "Alasan & bukti Anda tersimpan sebagai catatan akuntabilitas dan tampil publik.",
        ]}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Alasan pembekuan <span className="text-destructive">*</span></Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ringkas indikasi kecurangan (mis. penarikan tak wajar)…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Uraian detail (opsional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detail temuan, kronologi, atau angka pendukung…" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tautan bukti (opsional)</Label>
            <Input value={evidenceUrl} onChange={(e) => setEvidenceUrl(e.target.value)} placeholder="URL dokumen/arsip bukti (mis. Google Drive, IPFS)" />
            <p className="text-xs text-muted-foreground">URL dokumen/arsip bukti (mis. Google Drive, IPFS).</p>
          </div>
        </div>
      </ConfirmDialog>
    </div>
  );
}

export function AuditPage() {
  const { data, isLoading, isError, error, refetch } = useProgramsByStatus(["DRAWABLE"]);
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Freeze / Audit"
        subtitle="Hanya program DRAWABLE yang bisa dibekukan (guard on-chain)."
      />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={(data?.length ?? 0) === 0}
        onRetry={refetch}
        emptyTitle="Tidak ada program DRAWABLE"
        emptyDescription="Program yang sedang mencairkan dana akan muncul di sini."
      >
        {data?.map((p) => (
          <Card key={p.programId}>
            <CardContent className="flex flex-row items-center gap-4 p-4">
              <div className="flex-1">
                <Link to={`/programs/${p.programId}`} className="font-semibold hover:underline">#{p.programId} {p.title}</Link>
                <p className="font-mono text-sm text-muted-foreground">{formatIDR(p.totalBudget)}</p>
              </div>
              <FreezeBtn p={p} />
            </CardContent>
          </Card>
        ))}
      </QueryState>
    </div>
  );
}
