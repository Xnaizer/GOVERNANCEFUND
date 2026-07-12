import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Clock,
  Lock,
  SquarePen,
  Snowflake,
  OctagonAlert,
  Users,
  UserCheck,
  CheckSquare,
  Circle,
  CheckCircle2,
  Award,
  FilePlus,
  Layers,
  ChevronRight,
  ArrowDownToLine,
  Send,
  Flag,
  PenLine,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "../../components/ui/StatCard";
import { ClockCard } from "../../components/ui/ClockCard";
import { WeatherCard } from "../../components/ui/WeatherCard";
import { UserCell } from "../../components/UserCell";
import { StatusChip } from "../../components/StatusChip";
import { useMe } from "../../hooks/useAuth";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useValidatorThreshold, useProposalVoteCount } from "../../hooks/useGovReads";
import { fetchRoleVotes, fetchUnfreezeVotes } from "../../services/votesApi";
import { fetchRoleLogs } from "../../services/logsApi";
import { listUsersAdmin } from "../../services/usersApi";
import { fetchPublicUsers } from "../../services/publicUsersApi";
import { listProgramsAuthed } from "../../services/programApi";
import { useMyPrograms } from "../../hooks/useMyPrograms";
import { formatShortenAddress, formatIDR, formatDate } from "../../utils/format";
import type { AuthUser } from "../../types/auth";
import type { ProgramListItem } from "../../types/program";

const REPUTATION_BLOCKED = 35;

function reputationTone(score: number) {
  if (score < REPUTATION_BLOCKED)
    return { tone: "danger" as const, label: "BLOCKED" };
  if (score < 50) return { tone: "warning" as const, label: "WATCH" };
  return { tone: "success" as const, label: "OK" };
}

/* ── USER: onboarding checklist ── */
function OnboardingChecklist({ me }: { me: AuthUser }) {
  const steps = [
    { done: me.isActive, label: "Verifikasi email" },
    { done: !!me.name, label: "Lengkapi data profil" },
    { done: !!me.walletAddress, label: "Bind wallet (di Profil)" },
    { done: me.isVerified, label: "Identitas diverifikasi admin" },
    { done: me.role !== "USER", label: "Dipromosikan ke peran governance" },
  ];
  const done = steps.filter((s) => s.done).length;
  return (
    <Card>
      <CardHeader className="font-semibold">
        Langkah Onboarding ({done}/{steps.length})
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            {s.done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground/40" />
            )}
            <span
              className={
                s.done ? "text-foreground/80" : "text-muted-foreground"
              }
            >
              {s.label}
            </span>
          </div>
        ))}
        {!me.walletAddress && (
          <Button asChild size="sm" variant="secondary" className="mt-2 w-fit">
            <Link to="/profile">Ke Profil</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/* ── ADMIN: panel interaksi cepat ── */
function AdminPanel() {
  const logs = useQuery({
    queryKey: ["role-logs", "preview"],
    queryFn: () => fetchRoleLogs({ limit: 6 }),
    staleTime: 30_000,
  });
  const votes = useQuery({
    queryKey: ["role-votes", "preview"],
    queryFn: () => fetchRoleVotes({ limit: 6 }),
    staleTime: 30_000,
  });
  const users = useQuery({
    queryKey: ["admin-users", "preview"],
    queryFn: () => listUsersAdmin({ limit: 20 }),
    staleTime: 30_000,
  });

  const openVotes = (votes.data?.rows ?? []).filter((v) => !v.executed);
  const unverified = (users.data?.users ?? []).filter((u) => !u.isVerified);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Peran Terbaru */}
      <Card className="flex h-full flex-col rounded-2xl border-black/5 shadow-none">
        <CardHeader className="flex-row items-center justify-between space-y-0 font-display font-semibold tracking-tight">
          <span>Peran Terbaru</span>
          <Button asChild size="sm" variant="ghost">
            <Link to="/governance/roles">Semua</Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          {(logs.data?.rows ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada perubahan peran.</p>
          )}
          {(logs.data?.rows ?? []).slice(0, 5).map((l) => (
            <div key={l.id} className="flex items-center gap-2">
              <UserCell user={l.targetUser} wallet={l.targetWallet} />
              <Badge
                variant={l.changeType.includes("REVOK") ? "destructive" : "secondary"}
                className="ml-auto rounded-sm"
              >
                {l.changeType.includes("REVOK") ? "Revoke" : "Grant"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Voting Berjalan */}
      <Card className="flex h-full flex-col rounded-2xl border-black/5 shadow-none">
        <CardHeader className="flex-row items-center justify-between space-y-0 font-display font-semibold tracking-tight">
          <span>Voting Berjalan ({openVotes.length})</span>
          <Button asChild size="sm" variant="ghost">
            <Link to="/dashboard/governance">Kelola</Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          {openVotes.length === 0 && (
            <p className="text-sm text-muted-foreground">Tidak ada voting berjalan.</p>
          )}
          {openVotes.slice(0, 5).map((v) => (
            <div key={v.voteId} className="flex items-center gap-2">
              <UserCell user={v.candidateUser} wallet={v.candidate} />
              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                <Badge variant={v.isDevote ? "destructive" : "default"} className="rounded-sm">
                  {v.isDevote ? "Devote" : "Grant"}
                </Badge>
                <Link to={`/governance/votes/${v.voteId}`} className="font-mono text-xs text-brand-blue hover:underline">
                  #{v.voteId}
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pending Verifikasi */}
      <Card className="flex h-full flex-col rounded-2xl border-black/5 shadow-none">
        <CardHeader className="flex-row items-center justify-between space-y-0 font-display font-semibold tracking-tight">
          <span>Pending Verifikasi ({unverified.length})</span>
          {unverified.length > 0 && (
            <Button asChild size="sm" variant="ghost">
              <Link to="/dashboard/governance">Verifikasi</Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          {unverified.length === 0 && (
            <p className="text-sm text-muted-foreground">Semua pengguna sudah terverifikasi.</p>
          )}
          {unverified.slice(0, 5).map((u) => (
            <div key={u.id} className="flex items-center gap-2">
              <UserCell user={u} />
              <Badge variant="warning" className="ml-auto rounded-sm">unverified</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── VALIDATOR: baris proposal dengan detail lengkap ── */
function ValidatorProposalRow({ p, total, threshold }: { p: ProgramListItem; total: number; threshold: number }) {
  const count = useProposalVoteCount(p.programId);
  return (
    <div className="flex items-center gap-3 border-b border-black/5 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <Link to={`/programs/${p.programId}`} className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">#{p.programId}</span>
          <span className="truncate font-display font-medium tracking-tight hover:text-brand-blue">
            {p.title ?? "(tanpa judul)"}
          </span>
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-brand-blue">{formatIDR(p.totalBudget)}</span>
          <span>· {p.milestoneCount} milestone</span>
          {p.pic ? (
            <UserCell user={p.pic} wallet={p.picWallet} />
          ) : (
            <span className="font-mono">{formatShortenAddress(p.picWallet)}</span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Badge variant={count >= threshold ? "success" : "secondary"} className="rounded-sm">
          {count}/{threshold} · {total} val
        </Badge>
        <StatusChip status={p.status} />
      </div>
    </div>
  );
}

/* ── VALIDATOR: panel interaksi ── */
function ValidatorPanel() {
  const programs = useQuery({
    queryKey: ["dash-programs"],
    queryFn: async () => (await listProgramsAuthed({ limit: 100 })).programs,
    staleTime: 30_000,
  });
  const logs = useQuery({
    queryKey: ["role-logs", "validator"],
    queryFn: () => fetchRoleLogs({ limit: 25 }),
    staleTime: 30_000,
  });
  const topPics = useQuery({
    queryKey: ["public-users", "PIC", "reputation"],
    queryFn: () =>
      fetchPublicUsers({ role: "PIC", sort: "reputation", limit: 5 }),
    staleTime: 30_000,
  });
  const { total, threshold } = useValidatorThreshold();

  const pending = (programs.data ?? []).filter(
    (p) => p.isOnChain && p.status === "PENDING",
  );
  const newPics = (logs.data?.rows ?? [])
    .filter((l) => l.targetRole === "PIC" && !l.changeType.includes("REVOK"))
    .slice(0, 6);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Proposal menunggu — lebar, detail lengkap */}
      <Card className="flex h-full flex-col rounded-2xl border-black/5 shadow-none lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0 font-display font-semibold tracking-tight">
          <span>Proposal menunggu vote ({pending.length})</span>
          <Button asChild size="sm" variant="ghost">
            <Link to="/dashboard/proposals">Voting</Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {pending.length === 0 && (
            <p className="text-sm text-muted-foreground">Tidak ada proposal PENDING.</p>
          )}
          {pending.slice(0, 6).map((p) => (
            <ValidatorProposalRow key={p.programId} p={p} total={total} threshold={threshold} />
          ))}
        </CardContent>
      </Card>

      {/* Kolom kanan: PIC baru + PIC reputasi tertinggi */}
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader className="font-display font-semibold tracking-tight">PIC baru di-assign</CardHeader>
          <CardContent className="flex flex-col">
            {newPics.length === 0 && (
              <p className="text-sm text-muted-foreground">Belum ada.</p>
            )}
            {newPics.map((l) => (
              <div key={l.id} className="flex items-center gap-2 border-b border-black/5 py-2.5 last:border-0">
                <UserCell user={l.targetUser} wallet={l.targetWallet} showRole />
                <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(l.createdAt)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0 font-display font-semibold tracking-tight">
            <span>PIC reputasi tertinggi</span>
            <Button asChild size="sm" variant="ghost">
              <Link to="/users">Direktori</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col">
            {(topPics.data?.users ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Belum ada PIC.</p>
            )}
            {(topPics.data?.users ?? []).map((u) => (
              <div key={u.id} className="flex items-center gap-2 border-b border-black/5 py-2.5 last:border-0">
                <UserCell user={u} />
                <Badge variant="success" className="ml-auto rounded-sm">{u.reputationScore}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── AUDITOR: baris program yang bisa dibekukan (detail lengkap) ── */
function AuditorDrawableRow({ p }: { p: ProgramListItem }) {
  return (
    <div className="flex items-center gap-3 border-b border-black/5 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <Link to={`/programs/${p.programId}`} className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">#{p.programId}</span>
          <span className="truncate font-display font-medium tracking-tight hover:text-brand-blue">
            {p.title ?? "(tanpa judul)"}
          </span>
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-brand-blue">{formatIDR(p.totalBudget)}</span>
          <span>· milestone {p.currentMilestone}/{p.milestoneCount}</span>
          {p.pic ? (
            <UserCell user={p.pic} wallet={p.picWallet} />
          ) : (
            <span className="font-mono">{formatShortenAddress(p.picWallet)}</span>
          )}
        </div>
      </div>
      <StatusChip status={p.status} />
    </div>
  );
}

/* ── AUDITOR: baris banding dengan garis vote hijau/merah ── */
function AuditorAppealRow({ programId, approveVotes, rejectVotes, threshold }: { programId: number; approveVotes: number; rejectVotes: number; threshold: number }) {
  const tot = approveVotes + rejectVotes || 1;
  return (
    <div className="border-b border-black/5 py-3 last:border-0">
      <div className="flex items-center justify-between">
        <Link to={`/programs/${programId}`} className="font-display font-medium tracking-tight hover:text-brand-blue">
          Program #{programId}
        </Link>
        <span className="text-xs text-muted-foreground">ambang {threshold}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs font-medium">
        <span className="text-emerald-600">Setuju {approveVotes}</span>
        <span className="text-destructive">Tolak {rejectVotes}</span>
      </div>
      <div className="mt-1.5 flex h-2 overflow-hidden rounded-sm bg-muted">
        <span className="bg-emerald-500" style={{ width: `${(approveVotes / tot) * 100}%` }} />
        <span className="bg-destructive" style={{ width: `${(rejectVotes / tot) * 100}%` }} />
      </div>
    </div>
  );
}

/* ── AUDITOR: monitoring ── */
function AuditorPanel() {
  const programs = useQuery({
    queryKey: ["dash-programs"],
    queryFn: async () => (await listProgramsAuthed({ limit: 100 })).programs,
    staleTime: 30_000,
  });
  const appeals = useQuery({
    queryKey: ["unfreeze-votes", "preview"],
    queryFn: () => fetchUnfreezeVotes({ limit: 6 }),
    staleTime: 30_000,
  });
  const { threshold } = useValidatorThreshold();

  const drawable = (programs.data ?? []).filter(
    (p) => p.isOnChain && p.status === "DRAWABLE",
  );
  const activeAppeals = (appeals.data?.rows ?? []).filter((a) => !a.resolved);

  const monitorLinks = [
    { to: "/programs", icon: <Layers className="h-4 w-4" />, label: "Semua Program" },
    { to: "/users", icon: <Users className="h-4 w-4" />, label: "Direktori Pengguna" },
    { to: "/dashboard/sign", icon: <SquarePen className="h-4 w-4" />, label: "Tanda Tangan Milestone" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Bisa dibekukan — lebar, detail lengkap */}
      <Card className="flex h-full flex-col rounded-2xl border-black/5 shadow-none lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0 font-display font-semibold tracking-tight">
          <span>Bisa dibekukan ({drawable.length})</span>
          <Button asChild size="sm" variant="ghost">
            <Link to="/dashboard/audit">Audit</Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          {drawable.length === 0 && (
            <p className="text-sm text-muted-foreground">Tidak ada program DRAWABLE.</p>
          )}
          {drawable.slice(0, 6).map((p) => (
            <AuditorDrawableRow key={p.programId} p={p} />
          ))}
        </CardContent>
      </Card>

      {/* Kolom kanan: banding + monitoring */}
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader className="font-display font-semibold tracking-tight">
            Banding berjalan ({activeAppeals.length})
          </CardHeader>
          <CardContent className="flex flex-col">
            {activeAppeals.length === 0 && (
              <p className="text-sm text-muted-foreground">Tidak ada banding.</p>
            )}
            {activeAppeals.slice(0, 5).map((a) => (
              <AuditorAppealRow
                key={a.id}
                programId={a.programId}
                approveVotes={a.approveVotes ?? 0}
                rejectVotes={a.rejectVotes ?? 0}
                threshold={threshold}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader className="font-display font-semibold tracking-tight">Monitoring</CardHeader>
          <CardContent className="flex flex-col gap-2">
            {monitorLinks.map((m) => (
              <Link
                key={m.to}
                to={m.to}
                className="flex items-center gap-3 rounded-xl border border-black/5 p-3 transition-colors hover:border-brand-blue/30 hover:bg-brand-blue/4"
              >
                <span className="text-brand-blue">{m.icon}</span>
                <span className="text-sm font-medium">{m.label}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Persentase alokasi terpakai vs total budget. */
function allocPct(p: ProgramListItem): number {
  try {
    const total = BigInt(p.totalBudget || "0");
    if (total === 0n) return 0;
    const used = BigInt(p.totalAllocatedSoFar || "0");
    return Math.min(100, Number((used * 10000n) / total) / 100);
  } catch {
    return 0;
  }
}

/** Satu baris program milik PIC dengan progress milestone + alokasi. */
function PicProgramRow({ p }: { p: ProgramListItem }) {
  const msPct = p.milestoneCount > 0 ? Math.min(100, (p.currentMilestone / p.milestoneCount) * 100) : 0;
  const mismatch = p.isOnChain && p.integrity !== "VERIFIED";
  return (
    <Link
      to={p.isOnChain ? `/dashboard/programs/${p.programId}/manage` : "/dashboard/programs"}
      className="flex flex-col gap-2 rounded-xl border border-black/5 p-3.5 transition-colors hover:border-brand-blue/30 hover:bg-brand-blue/4"
    >
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-display text-sm font-medium tracking-tight">
          {p.title ?? `Program #${p.programId}`}
        </span>
        {mismatch && (
          <Badge variant="destructive" className="gap-1 rounded-sm">
            <ShieldAlert className="h-3 w-3" /> mismatch
          </Badge>
        )}
        <StatusChip status={p.status} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Milestone</span>
            <span className="font-mono">{p.currentMilestone}/{p.milestoneCount}</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-muted">
            <div className="h-full rounded-sm bg-brand-blue" style={{ width: `${msPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Teralokasi</span>
            <span className="font-mono">{allocPct(p).toFixed(0)}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-muted">
            <div className="h-full rounded-sm bg-emerald-500" style={{ width: `${allocPct(p)}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function PicActionItem({
  icon, label, hint, to, tone = "primary",
}: {
  icon: React.ReactNode; label: string; hint: string; to: string;
  tone?: "primary" | "warning" | "danger" | "success";
}) {
  const toneCls =
    tone === "warning" ? "text-amber-600"
      : tone === "danger" ? "text-destructive"
        : tone === "success" ? "text-emerald-600"
          : "text-brand-blue";
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-black/5 p-3 transition-colors hover:border-brand-blue/30 hover:bg-brand-blue/4"
    >
      <span className={toneCls}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function PicPanel({ me }: { me: AuthUser }) {
  const { data: programs, isLoading } = useMyPrograms();
  const list = programs ?? [];
  const drafts = list.filter((p) => !p.isOnChain);
  const drawable = list.filter((p) => p.status === "DRAWABLE");
  const frozen = list.filter((p) => p.status === "FROZEN");
  const running = list.filter((p) =>
    ["APPROVED", "DRAWABLE", "MILESTONE_ACHIEVED"].includes(p.status),
  );
  const mismatched = list.filter((p) => p.isOnChain && p.integrity !== "VERIFIED");
  const canCreate = me.isVerified && me.reputationScore >= REPUTATION_BLOCKED;

  const actions: React.ReactNode[] = [];
  if (drafts.length)
    actions.push(
      <PicActionItem key="draft" icon={<Send className="h-4 w-4" />} tone="warning"
        label={`Submit ${drafts.length} draft ke on-chain`} hint="Draft belum ter-anchor — ajukan ke kontrak" to="/dashboard/programs" />,
    );
  if (drawable.length)
    actions.push(
      <PicActionItem key="draw" icon={<ArrowDownToLine className="h-4 w-4" />} tone="primary"
        label={`Tarik dana (${drawable.length} program DRAWABLE)`} hint="Milestone cair — lakukan penarikan bertahap" to="/dashboard/programs" />,
    );
  if (frozen.length)
    actions.push(
      <PicActionItem key="frozen" icon={<Flag className="h-4 w-4" />} tone="danger"
        label={`Ajukan banding (${frozen.length} dibekukan)`} hint="Program FROZEN — ajukan banding unfreeze" to="/dashboard/programs" />,
    );
  if (canCreate)
    actions.push(
      <PicActionItem key="new" icon={<FilePlus className="h-4 w-4" />} tone="success"
        label="Buat program baru" hint="Susun proposal + milestone baru" to="/dashboard/create-program" />,
    );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Kiri: progress program berjalan */}
      <Card className="flex h-full flex-col rounded-2xl border-black/5 shadow-none lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0 font-display font-semibold tracking-tight">
          <span>Program berjalan ({running.length})</span>
          <Button asChild size="sm" variant="ghost">
            <Link to="/dashboard/programs">Program Saya</Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2.5">
          {isLoading && <p className="text-sm text-muted-foreground">Memuat…</p>}
          {!isLoading && running.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
              <Sparkles className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Belum ada program berjalan.
                {canCreate && " Mulai dari “Buat program baru”."}
              </p>
            </div>
          )}
          {running.slice(0, 5).map((p) => (
            <PicProgramRow key={p.programId} p={p} />
          ))}
        </CardContent>
      </Card>

      {/* Kanan: perlu tindakan */}
      <div className="flex flex-col gap-4">
        <Card className="rounded-2xl border-black/5 shadow-none">
          <CardHeader className="flex-row items-center gap-2 space-y-0 font-display font-semibold tracking-tight">
            <PenLine className="h-4 w-4 text-brand-blue" /> Perlu tindakan
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {actions.length ? actions : (
              <p className="text-sm text-muted-foreground">
                Tidak ada tindakan tertunda. 🎉
              </p>
            )}
          </CardContent>
        </Card>

        {mismatched.length > 0 && (
          <Card className="rounded-2xl border-destructive/30 bg-destructive/5 shadow-none">
            <CardContent className="flex items-start gap-2 p-4 text-sm text-destructive">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {mismatched.length} program terdeteksi <b>hash mismatch</b> — data
                Web2 berbeda dari on-chain. Periksa di Program Saya.
              </span>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function DashboardHome() {
  const { data: me } = useMe();
  const stats = useDashboardStats();
  if (!me) return null;

  const rep = reputationTone(me.reputationScore);
  const hour = new Date().getHours();
  const greeting =
    hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-muted-foreground">
          {greeting} 👋 Selamat datang kembali di <span className="font-medium text-foreground">GovernanceFund</span>.
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Halo, {me.name ?? me.username}
          </h1>
          <Badge className="rounded-sm">{me.role}</Badge>
        </div>
      </div>

      {/* Banner peringatan */}
      {!me.walletAddress && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950">
          <CardContent className="p-4 text-sm">
            ⚠️ Wallet belum di-bind — aksi on-chain butuh wallet. Buka{" "}
            <Link to="/profile" className="font-semibold underline">
              Profil
            </Link>{" "}
            untuk bind.
          </CardContent>
        </Card>
      )}
      {!me.isVerified && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950">
          <CardContent className="p-4 text-sm">
            ⚠️ Identitas belum diverifikasi admin — sebagian aksi (mis. buat
            program) masih terkunci.
          </CardContent>
        </Card>
      )}

      {/* Kalender + jam (kiri) · cuaca + StatCard per role (kanan) */}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <ClockCard />
        <div className="flex flex-col gap-4">
          <WeatherCard />
          <div className="grid flex-1 grid-cols-2 content-start gap-3 sm:grid-cols-4">
          <StatCard
            label="Reputasi"
            value={me.reputationScore}
            icon={<Award />}
            tone={rep.tone}
            hint={`Tier: ${rep.label}`}
          />

          {me.role === "PIC" && (
            <>
              <StatCard
                label="Program Aktif"
                value={stats.my.active}
                icon={<Clock />}
                tone="primary"
                to="/dashboard/programs"
              />
              <StatCard
                label="Draft (belum submit)"
                value={stats.my.drafts}
                icon={<FilePlus />}
                tone="warning"
                to="/dashboard/programs"
              />
              <StatCard
                label="Selesai"
                value={stats.my.finished}
                icon={<CheckSquare />}
                tone="success"
                to="/dashboard/programs"
              />
            </>
          )}

          {me.role === "VALIDATOR" && (
            <>
              <StatCard
                label="Proposal menunggu"
                value={stats.counts.PENDING}
                icon={<Clock />}
                tone="primary"
                to="/dashboard/proposals"
              />
              <StatCard
                label="Banding menunggu"
                value={stats.counts.FROZEN}
                icon={<Lock />}
                tone="warning"
                to="/dashboard/appeals"
              />
              <StatCard
                label="Milestone to-sign"
                value={stats.toSign}
                icon={<SquarePen />}
                tone="secondary"
                to="/dashboard/sign"
              />
            </>
          )}

          {me.role === "AUDITOR" && (
            <>
              <StatCard
                label="Bisa dibekukan"
                value={stats.counts.DRAWABLE}
                icon={<Snowflake />}
                tone="primary"
                to="/dashboard/audit"
              />
              <StatCard
                label="Frozen"
                value={stats.counts.FROZEN}
                icon={<Lock />}
                tone="warning"
              />
              <StatCard
                label="Fraud"
                value={stats.counts.FRAUD_CONFIRMED}
                icon={<OctagonAlert />}
                tone="danger"
              />
            </>
          )}

          {me.role === "ADMIN" && (
            <>
              <StatCard
                label="Total Pengguna"
                value={stats.totalUsers}
                icon={<Users />}
                tone="primary"
                to="/dashboard/governance"
              />
              <StatCard
                label="Belum verifikasi"
                value={stats.unverifiedUsers}
                icon={<UserCheck />}
                tone="warning"
                to="/dashboard/governance"
              />
              <StatCard
                label="Voting berjalan"
                value={stats.openRoleVotes}
                icon={<Clock />}
                tone="secondary"
                to="/dashboard/governance"
              />
            </>
          )}
          </div>
        </div>
      </div>

      {/* Peringatan reputasi BLOCKED untuk PIC */}
      {me.role === "PIC" && me.reputationScore < REPUTATION_BLOCKED && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            🚫 Reputasi Anda di bawah {REPUTATION_BLOCKED} — pembuatan program
            baru diblokir hingga reputasi pulih.
          </CardContent>
        </Card>
      )}

      {/* Panel per role */}
      {me.role === "USER" && <OnboardingChecklist me={me} />}
      {me.role === "ADMIN" && <AdminPanel />}
      {me.role === "VALIDATOR" && <ValidatorPanel />}
      {me.role === "AUDITOR" && <AuditorPanel />}

      {me.role === "PIC" && <PicPanel me={me} />}
    </div>
  );
}
