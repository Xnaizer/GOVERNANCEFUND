import { useState, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ListShell } from "../components/layout/ListShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProgram } from "../hooks/usePrograms";
import { StatusChip, IntegrityChip } from "../components/StatusChip";
import { WithdrawalDetailModal } from "../components/ui/WithdrawalDetailModal";
import { StatCard } from "../components/ui/StatCard";
import { AllocationMeter } from "../components/charts/AllocationMeter";
import { WithdrawalTrend } from "../components/charts/WithdrawalTrend";
import { useValidatorThreshold, useProposalVoteCount } from "../hooks/useGovReads";
import { formatIDR, formatShortenAddress, formatDate } from "../utils/format";
import type { Withdrawal } from "../types/program";

function initials(s: string): string {
  return s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

function ProposalVoteBadge({ programId }: { programId: number }) {
  const { total, threshold } = useValidatorThreshold();
  const count = useProposalVoteCount(programId);
  return (
    <Badge variant={count >= threshold ? "success" : "secondary"}>
      Voting: {count}/{threshold} · {total} validator
    </Badge>
  );
}

function Field({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className={mono ? "break-all font-mono text-sm" : ""}>{value ?? "—"}</p>
    </div>
  );
}

/** Kartu section standar. */
function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="font-display font-semibold">{title}</CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ProgramDetailPage() {
  const { id } = useParams();
  const { data: p, isLoading, isError } = useProgram(Number(id));
  const [selectedW, setSelectedW] = useState<Withdrawal | null>(null);

  return (
    <ListShell max="max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/programs"><ArrowLeft className="h-4 w-4" /> Kembali ke Explorer</Link>
      </Button>

      {isLoading && <Spinner label="Memuat…" />}
      {isError && <Badge variant="destructive">Program tidak ditemukan.</Badge>}

      {p && (
        <>
          {p.isOrphan && (
            <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950">
              <CardContent className="p-4 text-sm">
                ⚠️ <b>Orphan program</b> — disubmit langsung ke kontrak tanpa data Web2. Judul & deskripsi hilang; hanya jejak on-chain yang tersisa.
              </CardContent>
            </Card>
          )}

          {/* Hero band */}
          <div className="rounded-[1.75rem] border bg-background p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                {p.title ?? `Program #${p.programId}`}
              </h1>
              <StatusChip status={p.status} />
              <IntegrityChip integrity={p.integrity} />
              {p.isOnChain && p.status === "PENDING" && <ProposalVoteBadge programId={p.programId} />}
            </div>
            {p.description && <p className="mt-3 max-w-2xl text-pretty text-muted-foreground">{p.description}</p>}
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Budget" tone="primary" value={<span className="font-mono text-lg">{formatIDR(p.totalBudget)}</span>} />
            <StatCard label="Teralokasi" value={<span className="font-mono text-lg">{formatIDR(p.totalAllocatedSoFar)}</span>} />
            <StatCard label="Milestone" value={`${p.currentMilestone}/${p.milestoneCount}`} />
            <StatCard label="Penarikan" value={p.withdrawals.length} hint={p.pic ? `PIC reputasi ${p.pic.reputationScore}` : undefined} />
          </div>

          {/* Alokasi anggaran */}
          <Section title="Alokasi Anggaran">
            <AllocationMeter allocated={p.totalAllocatedSoFar} total={p.totalBudget} />
          </Section>

          {p.pic && (
            <Card>
              <CardContent className="flex flex-row items-center gap-3 p-4">
                <Avatar className="h-10 w-10">
                  {p.pic.profilePictureURL && <AvatarImage src={p.pic.profilePictureURL} alt={p.pic.username} />}
                  <AvatarFallback>{initials(p.pic.name ?? p.pic.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-xs uppercase text-muted-foreground">Penanggung Jawab (PIC)</p>
                  <Link to={`/users/${p.pic.id}`} className="font-semibold text-brand-blue hover:underline">
                    {p.pic.name ?? p.pic.username}
                  </Link>
                  <span className="ml-2 text-sm text-muted-foreground">Reputasi {p.pic.reputationScore}</span>
                </div>
                <Button asChild size="sm" variant="secondary">
                  <Link to={`/users/${p.pic.id}`}>Lihat profil</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {p.programURLs && p.programURLs.length > 0 && (
            <Section title="Foto Program">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {p.programURLs.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt={`Foto ${i + 1}`} className="h-32 w-full rounded-lg border object-cover transition-transform hover:scale-[1.02]" loading="lazy" />
                  </a>
                ))}
              </div>
            </Section>
          )}

          <Section title="Ringkasan">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Field label="Executor" value={p.executorName} />
              <Field label="Registrasi" value={p.executorRegistration} />
              <Field label="Kategori" value={p.category} />
              <Field label="Institusi" value={p.institutionName} />
              <Field label="Tahun Fiskal" value={p.fiscalYear} />
              <Field label="Lokasi" value={[p.district, p.regency, p.province].filter(Boolean).join(", ") || "—"} />
              <Field label="PIC Wallet" value={formatShortenAddress(p.picWallet)} mono />
              <Field label="Program Hash" value={p.programHash} mono />
              <Field label="Tx Hash" value={p.txHash ? formatShortenAddress(p.txHash) : "—"} mono />
            </div>
          </Section>

          <Section title="Milestones">
            <div className="flex flex-col gap-4">
              {p.milestones.length === 0 && <p className="text-muted-foreground">Belum ada milestone.</p>}
              {p.milestones.map((m) => (
                <div key={m.id} className="grid grid-cols-[36px_1fr] gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 font-display text-sm font-semibold text-brand-blue">
                    {m.milestoneIndex + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{m.title ?? "—"}</span>
                      <Badge variant="secondary">{m.status}</Badge>
                      <span className="ml-auto font-mono text-sm">{formatIDR(m.milestoneBudget)}</span>
                    </div>
                    {m.signatures.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.signatures.map((s) => (
                          <Badge key={s.id} variant="outline">
                            {s.signerRole}: {formatShortenAddress(s.signerWallet)}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {(m.evidenceURL || m.evidenceHash) && (
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {m.evidenceURL && <a href={m.evidenceURL} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">Lihat dokumen bukti →</a>}
                        {m.evidenceHash && <span className="break-all font-mono">hash: {formatShortenAddress(m.evidenceHash)}</span>}
                      </div>
                    )}
                    <Separator className="mt-3" />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Penarikan Dana">
            {p.withdrawals.length === 0 ? (
              <p className="text-muted-foreground">Belum ada penarikan.</p>
            ) : (
              <div className="flex flex-col gap-4">
                <WithdrawalTrend items={p.withdrawals} />
                <div className="flex flex-col gap-1">
                  {p.withdrawals.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedW(w)}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                    >
                      <span className="font-mono">{formatIDR(w.amount)}</span>
                      <span className="text-muted-foreground">{w.recipientName ?? "—"}</span>
                      {w.receiptUrl && <Badge variant="success">receipt</Badge>}
                      <span className="ml-auto text-muted-foreground">{formatDate(w.timestamp)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {p.freezeOutcome && (
            <Section title="Freeze" className="border-amber-400">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Auditor" value={formatShortenAddress(p.freezeOutcome.auditorWallet)} mono />
                <Field label="Outcome" value={p.freezeOutcome.outcome} />
                <Field label="Frozen At" value={formatDate(p.freezeOutcome.frozenAt)} />
                <Field label="Resolved At" value={formatDate(p.freezeOutcome.resolvedAt)} />
                {p.freezeOutcome.reason && <Field label="Alasan" value={p.freezeOutcome.reason} />}
                {p.freezeOutcome.description && <Field label="Uraian" value={p.freezeOutcome.description} />}
                {p.freezeOutcome.evidenceUrl && (
                  <Field label="Bukti" value={<a href={p.freezeOutcome.evidenceUrl} target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">Lihat bukti →</a>} />
                )}
              </div>
            </Section>
          )}

          {p.unfreezeVote && (
            <Section title="Unfreeze Appeal">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Approve Votes" value={p.unfreezeVote.approveVotes} />
                <Field label="Reject Votes" value={p.unfreezeVote.rejectVotes} />
                <Field label="Resolved" value={String(p.unfreezeVote.resolved)} />
                <Field label="Appeal Started" value={formatDate(p.unfreezeVote.appealStartedAt)} />
              </div>
            </Section>
          )}
        </>
      )}

      <WithdrawalDetailModal w={selectedW} isOpen={!!selectedW} onClose={() => setSelectedW(null)} />
    </ListShell>
  );
}
