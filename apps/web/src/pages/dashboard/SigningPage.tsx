import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { SearchInput } from "../../components/ui/SearchInput";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useProgramsByStatus } from "../../hooks/useProgramsByStatus";
import { getProgramDetailAuthed } from "../../api/programApi";
import { useSignatures } from "../../hooks/useSignatures";
import { useSignMilestone } from "../../hooks/useSignMilestone";
import { useMe } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/error";
import type { SignerRole } from "../../types/common";

function SignCard({ programId }: { programId: number }) {
  const { data: me } = useMe();
  const { data: p } = useQuery({ queryKey: ["program-authed", programId], queryFn: () => getProgramDetailAuthed(programId) });
  const milestone = p?.milestones.find((m) => m.milestoneIndex === p.currentMilestone);
  const sigs = useSignatures(milestone?.id);
  const sign = useSignMilestone();
  const [open, setOpen] = useState(false);

  if (!p || !milestone || milestone.status !== "PLANNED") return null;
  const role = me?.role as SignerRole;
  const alreadySigned = sigs.data?.signatures.some((s) => s.signerRole === role) ?? false;
  const hasEvidence = !!milestone.evidenceHash;
  const canSign = hasEvidence && !alreadySigned;

  // Klik SELALU memberi feedback: toast alasan bila belum bisa, atau buka dialog konfirmasi.
  const onTrigger = () => {
    if (alreadySigned) { toast.error("Anda sudah menandatangani milestone ini."); return; }
    if (!hasEvidence) { toast.error("PIC belum mengunggah dokumen bukti — belum bisa ditandatangani."); return; }
    setOpen(true);
  };

  const confirm = async () => {
    const pr = sign.mutateAsync({
      milestoneId: milestone.id, programId: p.programId, milestoneIndex: milestone.milestoneIndex,
      milestoneBudget: milestone.milestoneBudget, evidenceHash: milestone.evidenceHash!, signerRole: role,
    });
    toast.promise(pr, { loading: "Menandatangani…", success: "Tanda tangan terkirim.", error: (e) => getErrorMessage(e) });
    try {
      await pr;
      setOpen(false);
    } catch { /* biarkan dialog terbuka */ }
  };

  return (
    <Card>
      <CardContent className="flex flex-row items-center gap-4 p-4">
        <div className="flex-1">
          <Link to={`/programs/${p.programId}`} className="font-semibold hover:underline">#{p.programId} {p.title}</Link>
          <p className="text-sm text-muted-foreground">
            Milestone #{milestone.milestoneIndex + 1} · {sigs.data?.collected ?? 0}/3 sig
            {!hasEvidence && " · evidence belum diunggah"}
          </p>
        </div>
        {alreadySigned ? (
          <Button size="sm" variant="secondary" className="text-emerald-600" disabled>Sudah ✓</Button>
        ) : (
          <Button size="sm" onClick={onTrigger} disabled={sign.isPending}>
            {sign.isPending && <Spinner size={16} className="text-current" />}
            Tanda Tangani
          </Button>
        )}
        <ConfirmDialog
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={confirm}
          isLoading={sign.isPending}
          title={`Tanda tangani milestone #${milestone.milestoneIndex + 1}?`}
          confirmLabel="Ya, tanda tangani"
          confirmDisabled={!canSign}
          checkboxLabel="Saya telah memeriksa dokumen bukti dan setuju menandatanganinya."
          warnings={[
            "Tanda tangan Anda MENGIKAT ke dokumen bukti pertama dan TIDAK bisa di-overwrite.",
            "Set tanda tangan hanya bisa direset oleh PIC saat milestone masih PLANNED.",
            "Menandatangani = menyetujui pencairan sesuai bukti & anggaran milestone ini.",
          ]}
        />
      </CardContent>
    </Card>
  );
}

export function SigningPage() {
  const { data, isLoading, isError, error, refetch } = useProgramsByStatus(["APPROVED", "DRAWABLE"]);
  const [q, setQ] = useState("");
  const filtered = (data ?? []).filter((p) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return String(p.programId).includes(s) || (p.title ?? "").toLowerCase().includes(s);
  });
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Tanda Tangan Milestone"
        subtitle="Tanda tangani milestone aktif (EIP-712). Butuh 1 ADMIN + 1 VALIDATOR + 1 AUDITOR."
      />
      <SearchInput value={q} onChange={setQ} placeholder="Cari judul atau #ID program…" className="max-w-sm" />
      <QueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={filtered.length === 0}
        onRetry={refetch}
        emptyTitle="Tidak ada milestone menunggu tanda tangan"
      >
        {filtered.map((p) => <SignCard key={p.programId} programId={p.programId} />)}
      </QueryState>
    </div>
  );
}
