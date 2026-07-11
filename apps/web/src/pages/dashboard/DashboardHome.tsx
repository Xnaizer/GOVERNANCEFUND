import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Clock, Lock, SquarePen, DollarSign, OctagonAlert, Users, UserCheck,
  CheckSquare, Circle, CheckCircle2, Award, FilePlus,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "../../components/ui/StatCard";
import { ClockCard } from "../../components/ui/ClockCard";
import { useMe } from "../../hooks/useAuth";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { fetchRoleVotes, fetchUnfreezeVotes } from "../../api/votesApi";
import { fetchRoleLogs } from "../../api/logsApi";
import { listUsersAdmin } from "../../api/usersApi";
import { fetchPublicUsers } from "../../api/publicUsersApi";
import { listProgramsAuthed } from "../../api/programApi";
import { formatShortenAddress, formatIDR } from "../../utils/format";
import type { AuthUser } from "../../types/auth";

const REPUTATION_BLOCKED = 35;

function reputationTone(score: number) {
  if (score < REPUTATION_BLOCKED) return { tone: "danger" as const, label: "BLOCKED" };
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
      <CardHeader className="font-semibold">Langkah Onboarding ({done}/{steps.length})</CardHeader>
      <CardContent className="flex flex-col gap-2">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            {s.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-muted-foreground/40" />}
            <span className={s.done ? "text-foreground/80" : "text-muted-foreground"}>{s.label}</span>
          </div>
        ))}
        {!me.walletAddress && (
          <Button asChild size="sm" variant="secondary" className="mt-2 w-fit"><Link to="/profile">Ke Profil</Link></Button>
        )}
      </CardContent>
    </Card>
  );
}

/* ── ADMIN: panel interaksi cepat ── */
function AdminPanel() {
  const logs = useQuery({ queryKey: ["role-logs"], queryFn: fetchRoleLogs, staleTime: 30_000 });
  const votes = useQuery({ queryKey: ["role-votes"], queryFn: fetchRoleVotes, staleTime: 30_000 });
  const users = useQuery({ queryKey: ["admin-users"], queryFn: () => listUsersAdmin({ limit: 100 }), staleTime: 30_000 });

  const openVotes = (votes.data ?? []).filter((v) => !v.executed);
  const unverified = (users.data?.users ?? []).filter((u) => !u.isVerified);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Peran Terbaru */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 font-semibold">
          <span>Peran Terbaru</span>
          <Button asChild size="sm" variant="ghost"><Link to="/governance/roles">Semua</Link></Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {(logs.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">Belum ada perubahan peran.</p>}
          {(logs.data ?? []).slice(0, 6).map((l) => (
            <div key={l.id} className="flex items-center gap-2 text-sm">
              <Badge variant="secondary">{l.changeType}</Badge>
              <span className="truncate text-muted-foreground">{l.targetUser?.name ?? l.targetUser?.username ?? formatShortenAddress(l.targetWallet ?? "")}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Voting Berjalan */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 font-semibold">
          <span>Voting Berjalan ({openVotes.length})</span>
          <Button asChild size="sm" variant="ghost"><Link to="/dashboard/governance">Kelola</Link></Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {openVotes.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada voting berjalan.</p>}
          {openVotes.slice(0, 6).map((v) => (
            <Link key={v.voteId} to={`/governance/votes/${v.voteId}`} className="flex items-center gap-2 text-sm hover:underline">
              <Badge variant={v.isDevote ? "destructive" : "default"}>{v.isDevote ? "Devote" : "Grant"}</Badge>
              <span className="truncate text-muted-foreground">{v.roleToTarget} → {formatShortenAddress(v.candidate)}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Pending Verifikasi */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 font-semibold">
          <span>Pending Verifikasi ({unverified.length})</span>
          {unverified.length > 0 && <Button asChild size="sm" variant="ghost"><Link to="/dashboard/governance">Verifikasi</Link></Button>}
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {unverified.length === 0 && <p className="text-sm text-muted-foreground">Semua pengguna sudah terverifikasi.</p>}
          {unverified.slice(0, 6).map((u) => (
            <Link key={u.id} to={`/users/${u.id}`} className="flex items-center gap-2 text-sm hover:underline">
              <span className="truncate text-muted-foreground">{u.name ?? u.username}</span>
              <Badge variant="warning">unverified</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── VALIDATOR: panel interaksi ── */
function ValidatorPanel() {
  const programs = useQuery({ queryKey: ["dash-programs"], queryFn: async () => (await listProgramsAuthed({ limit: 100 })).programs, staleTime: 30_000 });
  const logs = useQuery({ queryKey: ["role-logs"], queryFn: fetchRoleLogs, staleTime: 30_000 });
  const topPics = useQuery({ queryKey: ["public-users", "PIC", "reputation"], queryFn: () => fetchPublicUsers({ role: "PIC", sort: "reputation", limit: 5 }), staleTime: 30_000 });

  const pending = (programs.data ?? []).filter((p) => p.isOnChain && p.status === "PENDING");
  const newPics = (logs.data ?? []).filter((l) => l.targetRole === "PIC" && !l.changeType.includes("REVOK")).slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 font-semibold">
          <span>Proposal menunggu vote ({pending.length})</span>
          <Button asChild size="sm" variant="ghost"><Link to="/dashboard/proposals">Voting</Link></Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {pending.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada proposal PENDING.</p>}
          {pending.slice(0, 6).map((p) => (
            <Link key={p.programId} to={`/programs/${p.programId}`} className="flex items-center gap-2 text-sm hover:underline">
              <span className="truncate font-medium">#{p.programId} {p.title}</span>
              <span className="ml-auto font-mono text-muted-foreground">{formatIDR(p.totalBudget)}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold">PIC baru di-assign</CardHeader>
        <CardContent className="flex flex-col gap-2">
          {newPics.length === 0 && <p className="text-sm text-muted-foreground">Belum ada.</p>}
          {newPics.map((l) => (
            <span key={l.id} className="truncate text-sm text-muted-foreground">
              {l.targetUser ? <Link to={`/users/${l.targetUser.id}`} className="text-brand-blue hover:underline">{l.targetUser.name ?? l.targetUser.username}</Link> : formatShortenAddress(l.targetWallet ?? "")}
            </span>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 font-semibold">
          <span>PIC reputasi tertinggi</span>
          <Button asChild size="sm" variant="ghost"><Link to="/users">Direktori</Link></Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {(topPics.data?.users ?? []).length === 0 && <p className="text-sm text-muted-foreground">Belum ada PIC.</p>}
          {(topPics.data?.users ?? []).map((u) => (
            <Link key={u.id} to={`/users/${u.id}`} className="flex items-center gap-2 text-sm hover:underline">
              <span className="truncate">{u.name ?? u.username}</span>
              <Badge variant="success" className="ml-auto">{u.reputationScore}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── AUDITOR: monitoring ── */
function AuditorPanel() {
  const programs = useQuery({ queryKey: ["dash-programs"], queryFn: async () => (await listProgramsAuthed({ limit: 100 })).programs, staleTime: 30_000 });
  const appeals = useQuery({ queryKey: ["unfreeze-votes"], queryFn: fetchUnfreezeVotes, staleTime: 30_000 });

  const drawable = (programs.data ?? []).filter((p) => p.isOnChain && p.status === "DRAWABLE");
  const activeAppeals = (appeals.data ?? []).filter((a) => !a.resolved);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 font-semibold">
          <span>Bisa dibekukan ({drawable.length})</span>
          <Button asChild size="sm" variant="ghost"><Link to="/dashboard/audit">Audit</Link></Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {drawable.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada program DRAWABLE.</p>}
          {drawable.slice(0, 6).map((p) => (
            <Link key={p.programId} to={`/programs/${p.programId}`} className="flex items-center gap-2 text-sm hover:underline">
              <span className="truncate font-medium">#{p.programId} {p.title}</span>
              <span className="ml-auto font-mono text-muted-foreground">{formatIDR(p.totalBudget)}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold">Banding berjalan ({activeAppeals.length})</CardHeader>
        <CardContent className="flex flex-col gap-2">
          {activeAppeals.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada banding.</p>}
          {activeAppeals.slice(0, 6).map((a) => (
            <Link key={a.id} to={`/programs/${a.programId}`} className="flex items-center gap-2 text-sm hover:underline">
              <span>Program #{a.programId}</span>
              <span className="ml-auto text-muted-foreground">✓{a.approveVotes} / ✗{a.rejectVotes}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-semibold">Monitoring</CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button asChild size="sm" variant="secondary"><Link to="/programs">Semua Program</Link></Button>
          <Button asChild size="sm" variant="secondary"><Link to="/users">Direktori Pengguna</Link></Button>
          <Button asChild size="sm" variant="secondary"><Link to="/dashboard/sign">Tanda Tangan Milestone</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function DashboardHome() {
  const { data: me } = useMe();
  const stats = useDashboardStats();
  if (!me) return null;

  const rep = reputationTone(me.reputationScore);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">Halo, {me.name ?? me.username}</h1>
        <Badge>{me.role}</Badge>
      </div>

      {/* Banner peringatan */}
      {!me.walletAddress && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950">
          <CardContent className="p-4 text-sm">⚠️ Wallet belum di-bind — aksi on-chain butuh wallet. Buka <Link to="/profile" className="font-semibold underline">Profil</Link> untuk bind.</CardContent>
        </Card>
      )}
      {!me.isVerified && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950">
          <CardContent className="p-4 text-sm">⚠️ Identitas belum diverifikasi admin — sebagian aksi (mis. buat program) masih terkunci.</CardContent>
        </Card>
      )}

      {/* Kalender + jam + StatCard per role */}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <ClockCard />
        <div className="grid grid-cols-2 gap-3 self-start sm:grid-cols-4">
          <StatCard label="Reputasi" value={me.reputationScore} icon={<Award />} tone={rep.tone} hint={`Tier: ${rep.label}`} />

          {me.role === "PIC" && <>
            <StatCard label="Program Aktif" value={stats.my.active} icon={<Clock />} tone="primary" to="/dashboard/programs" />
            <StatCard label="Draft (belum submit)" value={stats.my.drafts} icon={<FilePlus />} tone="warning" to="/dashboard/programs" />
            <StatCard label="Selesai" value={stats.my.finished} icon={<CheckSquare />} tone="success" to="/dashboard/programs" />
          </>}

          {me.role === "VALIDATOR" && <>
            <StatCard label="Proposal menunggu" value={stats.counts.PENDING} icon={<Clock />} tone="primary" to="/dashboard/proposals" />
            <StatCard label="Banding menunggu" value={stats.counts.FROZEN} icon={<Lock />} tone="warning" to="/dashboard/appeals" />
            <StatCard label="Milestone to-sign" value={stats.toSign} icon={<SquarePen />} tone="secondary" to="/dashboard/sign" />
          </>}

          {me.role === "AUDITOR" && <>
            <StatCard label="Bisa dibekukan" value={stats.counts.DRAWABLE} icon={<DollarSign />} tone="primary" to="/dashboard/audit" />
            <StatCard label="Frozen" value={stats.counts.FROZEN} icon={<Lock />} tone="warning" />
            <StatCard label="Fraud" value={stats.counts.FRAUD_CONFIRMED} icon={<OctagonAlert />} tone="danger" />
          </>}

          {me.role === "ADMIN" && <>
            <StatCard label="Total Pengguna" value={stats.totalUsers} icon={<Users />} tone="primary" to="/dashboard/governance" />
            <StatCard label="Belum verifikasi" value={stats.unverifiedUsers} icon={<UserCheck />} tone="warning" to="/dashboard/governance" />
            <StatCard label="Voting berjalan" value={stats.openRoleVotes} icon={<Clock />} tone="secondary" to="/dashboard/governance" />
          </>}
        </div>
      </div>

      {/* Peringatan reputasi BLOCKED untuk PIC */}
      {me.role === "PIC" && me.reputationScore < REPUTATION_BLOCKED && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">🚫 Reputasi Anda di bawah {REPUTATION_BLOCKED} — pembuatan program baru diblokir hingga reputasi pulih.</CardContent>
        </Card>
      )}

      {/* Panel per role */}
      {me.role === "USER" && <OnboardingChecklist me={me} />}
      {me.role === "ADMIN" && <AdminPanel />}
      {me.role === "VALIDATOR" && <ValidatorPanel />}
      {me.role === "AUDITOR" && <AuditorPanel />}

      {me.role === "PIC" && (
        <Card>
          <CardHeader className="font-semibold">Aksi Cepat</CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {me.reputationScore < REPUTATION_BLOCKED || !me.isVerified ? (
              <Button disabled>Buat Program</Button>
            ) : (
              <Button asChild><Link to="/dashboard/programs/new">Buat Program</Link></Button>
            )}
            <Button asChild variant="secondary"><Link to="/dashboard/programs">Program Saya ({stats.my.total})</Link></Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
