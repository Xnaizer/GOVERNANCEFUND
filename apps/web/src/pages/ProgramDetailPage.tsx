import type { ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Chip, Divider, Spinner, Button } from "@heroui/react";
import { PublicHeader } from "../components/layout/PublicHeader";
import { useProgram } from "../hooks/usePrograms";
import { StatusChip, IntegrityChip } from "../components/StatusChip";
import { formatIDR, formatShortenAddress, formatDate } from "../utils/format";

function Field({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs uppercase text-default-500">{label}</p>
      <p className={mono ? "break-all font-mono text-sm" : ""}>{value ?? "—"}</p>
    </div>
  );
}

export function ProgramDetailPage() {
  const { id } = useParams();
  const { data: p, isLoading, isError } = useProgram(Number(id));

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <Button as={Link} to="/" variant="light" size="sm" className="w-fit">← Kembali</Button>

        {isLoading && <Spinner label="Memuat…" />}
        {isError && <Chip color="danger">Program tidak ditemukan.</Chip>}

        {p && (
          <>
            {p.isOrphan && (
              <Card className="border border-warning bg-warning-50">
                <CardBody>
                  ⚠️ <b>Orphan program</b> — disubmit langsung ke kontrak tanpa data Web2. Judul & deskripsi hilang; hanya jejak on-chain yang tersisa.
                </CardBody>
              </Card>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{p.title ?? `Program #${p.programId}`}</h1>
              <StatusChip status={p.status} />
              <IntegrityChip integrity={p.integrity} />
            </div>
            {p.description && <p className="text-default-600">{p.description}</p>}

            <Card>
              <CardHeader className="font-semibold">Ringkasan</CardHeader>
              <CardBody className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <Field label="Total Budget" value={formatIDR(p.totalBudget)} />
                <Field label="Teralokasi" value={formatIDR(p.totalAllocatedSoFar)} />
                <Field label="Milestone" value={`${p.currentMilestone}/${p.milestoneCount}`} />
                <Field label="Executor" value={p.executorName} />
                <Field label="Registrasi" value={p.executorRegistration} />
                <Field label="Kategori" value={p.category} />
                <Field label="Institusi" value={p.institutionName} />
                <Field label="Tahun Fiskal" value={p.fiscalYear} />
                <Field label="Lokasi" value={[p.district, p.regency, p.province].filter(Boolean).join(", ") || "—"} />
                <Field label="PIC Wallet" value={formatShortenAddress(p.picWallet)} mono />
                <Field label="Program Hash" value={p.programHash} mono />
                <Field label="Tx Hash" value={p.txHash ? formatShortenAddress(p.txHash) : "—"} mono />
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="font-semibold">Milestones</CardHeader>
              <CardBody className="flex flex-col gap-4">
                {p.milestones.length === 0 && <p className="text-default-500">Belum ada milestone.</p>}
                {p.milestones.map((m) => (
                  <div key={m.id}>
                    <div className="flex items-center gap-2">
                      <b>#{m.milestoneIndex + 1}</b>
                      <span>{m.title ?? "—"}</span>
                      <Chip size="sm" variant="flat">{m.status}</Chip>
                      <span className="ml-auto font-mono text-sm">{formatIDR(m.milestoneBudget)}</span>
                    </div>
                    {m.signatures.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {m.signatures.map((s: any) => (
                          <Chip key={s.id} size="sm" variant="bordered">
                            {s.signerRole}: {formatShortenAddress(s.signerWallet)}
                          </Chip>
                        ))}
                      </div>
                    )}
                    <Divider className="mt-3" />
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="font-semibold">Withdrawals</CardHeader>
              <CardBody className="flex flex-col gap-2">
                {p.withdrawals.length === 0 && <p className="text-default-500">Belum ada penarikan.</p>}
                {p.withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center gap-3 text-sm">
                    <span className="font-mono">{formatIDR(w.amount)}</span>
                    <span className="text-default-500">{w.recipientName ?? "—"}</span>
                    <span className="ml-auto text-default-400">{formatDate(w.timestamp)}</span>
                  </div>
                ))}
              </CardBody>
            </Card>

            {p.freezeOutcome && (
              <Card className="border border-warning">
                <CardHeader className="font-semibold">Freeze</CardHeader>
                <CardBody className="grid grid-cols-2 gap-4">
                  <Field label="Auditor" value={formatShortenAddress(p.freezeOutcome.auditorWallet)} mono />
                  <Field label="Outcome" value={p.freezeOutcome.outcome} />
                  <Field label="Frozen At" value={formatDate(p.freezeOutcome.frozenAt)} />
                  <Field label="Resolved At" value={formatDate(p.freezeOutcome.resolvedAt)} />
                </CardBody>
              </Card>
            )}

            {p.unfreezeVote && (
              <Card>
                <CardHeader className="font-semibold">Unfreeze Appeal</CardHeader>
                <CardBody className="grid grid-cols-2 gap-4">
                  <Field label="Approve Votes" value={p.unfreezeVote.approveVotes} />
                  <Field label="Reject Votes" value={p.unfreezeVote.rejectVotes} />
                  <Field label="Resolved" value={String(p.unfreezeVote.resolved)} />
                  <Field label="Appeal Started" value={formatDate(p.unfreezeVote.appealStartedAt)} />
                </CardBody>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
