import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { QueryState } from "../../components/ui/QueryState";
import { EmptyState } from "../../components/ui/EmptyState";
import { ConfirmButton } from "../../components/ui/ConfirmButton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/utils/cn";
import { listUsersAdmin, type AdminUser } from "../../api/usersApi";
import { fetchRoleVotes } from "../../api/votesApi";
import { useGrantPic, useProposeRole, useVoteRoleProposal } from "../../hooks/useAdmin";
import { useVerifyUser } from "../../hooks/useVerifyUser";
import { useAdminThreshold, useRoleVoteCount } from "../../hooks/useGovReads";
import { VOTABLE_ROLES, type GovRole } from "../../config/roles";
import { formatShortenAddress } from "../../utils/format";

/* ── Baris user USER: verifikasi lalu grant PIC ── */
function PicGrantRow({ u }: { u: AdminUser }) {
  const { grant } = useGrantPic();
  const verify = useVerifyUser();
  const wallet = u.walletAddress;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b py-2 last:border-0">
      <div className="min-w-0 flex-1 text-sm">
        <Link to={`/users/${u.id}`} className="font-semibold text-brand-blue hover:underline">{u.name ?? u.username}</Link>{" "}
        {wallet
          ? <span className="font-mono text-xs text-muted-foreground">{formatShortenAddress(wallet)}</span>
          : <Badge variant="secondary">tanpa wallet</Badge>}
        {u.isVerified
          ? <Badge variant="success" className="ml-2">verified</Badge>
          : <Badge variant="warning" className="ml-2">unverified</Badge>}
      </div>

      <Button asChild size="sm" variant="ghost"><Link to={`/users/${u.id}`}>Lihat detail</Link></Button>

      {!u.isVerified && (
        <ConfirmButton
          triggerLabel="Verifikasi"
          triggerProps={{ size: "sm", color: "secondary", variant: "flat" }}
          title={`Verifikasi identitas ${u.name ?? u.username}?`}
          confirmLabel="Ya, verifikasi"
          confirmColor="secondary"
          checkboxLabel="Saya sudah memeriksa dokumen legitimasi user ini."
          toasts={{ loading: "Memverifikasi…", success: "Identitas terverifikasi." }}
          action={() => verify.mutateAsync(u.id)}
          warnings={[
            "Verifikasi memberi user akses dashboard sebagai identitas terverifikasi.",
            "Sistem menolak bila profil belum lengkap (nama, NIK, alamat, dll).",
            "Pastikan data & dokumen legitimasi benar sebelum memverifikasi.",
          ]}
        />
      )}

      {u.isVerified && wallet && (
        <ConfirmButton
          triggerLabel="Grant PIC"
          triggerProps={{ size: "sm", color: "primary", variant: "flat" }}
          title={`Beri PIC_ROLE ke ${u.name ?? u.username}?`}
          confirmLabel="Ya, grant PIC"
          toasts={{ loading: "Grant PIC…", success: "PIC diberikan." }}
          action={() => grant(wallet)}
          warnings={[
            "Aksi tercatat on-chain dan tidak bisa dibatalkan (hanya bisa di-revoke terpisah).",
            "Wallet ini akan diizinkan submit proposal pendanaan langsung ke kontrak.",
            "Hanya untuk user tanpa peran lain (kontrak menolak double-grant).",
          ]}
        />
      )}
      {u.isVerified && !wallet && <Badge variant="warning">user belum bind wallet</Badge>}
    </div>
  );
}

/* ── Baris PIC aktif: revoke ── */
function PicActiveRow({ u }: { u: AdminUser }) {
  const { revoke } = useGrantPic();
  const wallet = u.walletAddress!;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b py-2 last:border-0">
      <div className="min-w-0 flex-1 text-sm">
        <Link to={`/users/${u.id}`} className="font-semibold text-brand-blue hover:underline">{u.name ?? u.username}</Link>{" "}
        <span className="font-mono text-xs text-muted-foreground">{formatShortenAddress(wallet)}</span>
        <Badge className="ml-2">PIC</Badge>
      </div>
      <Button asChild size="sm" variant="ghost"><Link to={`/users/${u.id}`}>Lihat detail</Link></Button>
      <ConfirmButton
        triggerLabel="Revoke PIC"
        triggerProps={{ size: "sm", color: "danger", variant: "light" }}
        title={`Cabut PIC_ROLE dari ${u.name ?? u.username}?`}
        confirmLabel="Ya, revoke PIC"
        confirmColor="danger"
        toasts={{ loading: "Revoke PIC…", success: "PIC dicabut." }}
        action={() => revoke(wallet)}
        warnings={[
          "Aksi tercatat on-chain dan tidak bisa dibatalkan.",
          "Wallet tidak lagi bisa submit proposal baru setelah dicabut.",
        ]}
      />
    </div>
  );
}

function RoleVoteCount({ voteId, threshold }: { voteId: number; threshold: number }) {
  const count = useRoleVoteCount(voteId);
  return (
    <Badge variant={count >= threshold ? "success" : "secondary"}>
      {count}/{threshold} suara
    </Badge>
  );
}

/* ── Combobox kandidat (Popover + Command) ── */
function CandidateCombobox({
  candidates,
  value,
  onChange,
}: {
  candidates: AdminUser[];
  value: string;
  onChange: (wallet: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = candidates.find((u) => u.walletAddress === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          {selected ? (selected.name ?? selected.username) : <span className="text-muted-foreground">Cari nama / wallet…</span>}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cari nama / wallet…" />
          <CommandList>
            <CommandEmpty>Tidak ada kandidat.</CommandEmpty>
            <CommandGroup>
              {candidates.map((u) => (
                <CommandItem
                  key={u.walletAddress!}
                  value={`${u.name ?? u.username} ${u.walletAddress}`}
                  onSelect={() => { onChange(u.walletAddress!); setOpen(false); }}
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm">{u.name ?? u.username} · <span className="text-muted-foreground">{u.role}</span>{u.isVerified ? " ✓" : ""}</span>
                    <span className="font-mono text-xs text-muted-foreground">{formatShortenAddress(u.walletAddress!)}</span>
                  </div>
                  <Check className={cn("ml-auto h-4 w-4", value === u.walletAddress ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function GovernancePage() {
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => listUsersAdmin({ limit: 100 }) });
  const votes = useQuery({ queryKey: ["role-votes"], queryFn: fetchRoleVotes });
  const { total: adminTotal, threshold: adminThreshold } = useAdminThreshold();

  const [candidate, setCandidate] = useState("");
  const [role, setRole] = useState<GovRole>("VALIDATOR_ROLE");
  const propose = useProposeRole();
  const roleVote = useVoteRoleProposal();

  const validAddr = /^0x[a-fA-F0-9]{40}$/.test(candidate);
  const open = votes.data?.filter((v) => !v.executed) ?? [];

  const allUsers = users.data?.users ?? [];
  const usersToGrant = allUsers.filter((u) => u.role === "USER");           // eligible/prospektif PIC (khusus USER)
  const activePics = allUsers.filter((u) => u.role === "PIC");
  const candidatesWithWallet = allUsers.filter((u) => u.walletAddress);     // untuk voting BFT

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title="Tata Kelola Peran" subtitle="Kelola PIC (grant langsung) dan perubahan peran struktural via voting BFT admin." />

      <Tabs defaultValue="pic">
        <TabsList>
          <TabsTrigger value="pic">Kelola PIC</TabsTrigger>
          <TabsTrigger value="vote">Tata Kelola (Voting BFT)</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Grant langsung PIC (khusus USER) ── */}
        <TabsContent value="pic">
          <div className="flex flex-col gap-6 pt-2">
            <Card>
              <CardHeader className="font-semibold">Verifikasi &amp; Grant PIC — khusus role USER</CardHeader>
              <CardContent>
                <QueryState
                  isLoading={users.isLoading}
                  isError={users.isError}
                  error={users.error}
                  isEmpty={usersToGrant.length === 0}
                  onRetry={users.refetch}
                  emptyTitle="Tidak ada kandidat"
                  emptyDescription="Hanya user berperan USER yang bisa diverifikasi & di-grant PIC."
                >
                  {usersToGrant.map((u) => <PicGrantRow key={u.id} u={u} />)}
                </QueryState>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="font-semibold">PIC Aktif</CardHeader>
              <CardContent>
                {activePics.length === 0
                  ? <EmptyState title="Belum ada PIC aktif" />
                  : activePics.map((u) => <PicActiveRow key={u.id} u={u} />)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── TAB 2: Voting BFT (ADMIN/VALIDATOR/AUDITOR) ── */}
        <TabsContent value="vote">
          <div className="flex flex-col gap-6 pt-2">
            <Card>
              <CardHeader className="font-semibold">Usulkan Perubahan Peran (BFT admin)</CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label>Kandidat / Target</Label>
                  <CandidateCombobox candidates={candidatesWithWallet} value={candidate} onChange={setCandidate} />
                </div>
                <div className="flex flex-col gap-1.5 sm:w-44">
                  <Label>Peran</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as GovRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VOTABLE_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <ConfirmButton
                  triggerLabel="Usul Grant"
                  triggerProps={{ color: "primary", isDisabled: !validAddr }}
                  title="Usulkan grant peran?"
                  confirmLabel="Ya, buat usulan"
                  toasts={{ loading: "Mengirim usulan…", success: "Usulan dibuat." }}
                  action={() => propose.propose(candidate, role, false)}
                  warnings={[
                    "Usulan tercatat on-chain dan tidak bisa dibatalkan.",
                    "Kandidat harus belum memegang peran apa pun (kontrak menolak bila sudah).",
                    "Perlu ambang BFT admin (⌊2N/3⌋+1) agar perubahan berlaku.",
                  ]}
                />
                <ConfirmButton
                  triggerLabel="Usul Devote"
                  triggerProps={{ color: "danger", variant: "flat", isDisabled: !validAddr }}
                  title="Usulkan pencabutan peran?"
                  confirmLabel="Ya, buat usulan devote"
                  confirmColor="danger"
                  toasts={{ loading: "Mengirim usulan…", success: "Usulan dibuat." }}
                  action={() => propose.propose(candidate, role, true)}
                  warnings={[
                    "Usulan tercatat on-chain dan tidak bisa dibatalkan.",
                    "Target harus sedang memegang peran yang dicabut.",
                    "Perlu ambang BFT admin (⌊2N/3⌋+1) agar pencabutan berlaku.",
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0 font-semibold">
                <span>Voting Peran Berjalan</span>
                <Badge variant="secondary">{adminTotal} admin · ambang {adminThreshold}</Badge>
              </CardHeader>
              <CardContent>
                <QueryState
                  isLoading={votes.isLoading}
                  isError={votes.isError}
                  error={votes.error}
                  isEmpty={open.length === 0}
                  onRetry={votes.refetch}
                  emptyTitle="Tidak ada voting berjalan"
                >
                  <div className="flex flex-col gap-3">
                    {open.map((v) => (
                      <div key={v.voteId} className="flex flex-wrap items-center gap-3 text-sm">
                        <Link to={`/governance/votes/${v.voteId}`} className="min-w-0 flex-1 hover:underline">
                          #{v.voteId} · {v.isDevote ? "Devote" : "Grant"} {v.roleToTarget} → <span className="font-mono">{formatShortenAddress(v.candidate)}</span>
                        </Link>
                        <RoleVoteCount voteId={v.voteId} threshold={adminThreshold} />
                        <ConfirmButton
                          triggerLabel="Setujui"
                          triggerProps={{ size: "sm", color: "primary" }}
                          title={`Setujui usulan peran #${v.voteId}?`}
                          confirmLabel="Ya, kirim vote"
                          toasts={{ loading: "Vote…", success: "Vote terkirim." }}
                          action={() => roleVote.vote(v.voteId)}
                          warnings={[
                            "Vote tercatat on-chain dan tidak bisa dibatalkan.",
                            "Perubahan peran berlaku begitu ambang BFT admin tercapai.",
                          ]}
                        />
                      </div>
                    ))}
                  </div>
                </QueryState>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
