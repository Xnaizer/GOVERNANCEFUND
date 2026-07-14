import { useQuery } from "@tanstack/react-query";
import { listProgramsAuthed } from "../services/programApi";
import { listUsersAdmin } from "../services/usersApi";
import { fetchRoleVotes } from "../services/votesApi";
import { useMe } from "./useAuth";
import type { ProgramListItem, ProgramStatus } from "../types/program";

function countByStatus(programs: ProgramListItem[]) {
  const c: Record<ProgramStatus, number> = {
    PENDING: 0,
    APPROVED: 0,
    DRAWABLE: 0,
    MILESTONE_ACHIEVED: 0,
    FROZEN: 0,
    COMPLETED: 0,
    FRAUD_CONFIRMED: 0,
  };
  for (const p of programs) if (p.isOnChain) c[p.status]++;
  return c;
}

export function useDashboardStats() {
  const { data: me } = useMe();
  const role = me?.role ?? "USER";
  const wallet = me?.walletAddress?.toLowerCase();

  const programsQ = useQuery({
    queryKey: ["dash-programs"],
    queryFn: async () => (await listProgramsAuthed({ limit: 100 })).programs,
    staleTime: 30_000,
  });

  const roleVotesQ = useQuery({
    queryKey: ["role-votes", "stats"],
    queryFn: () => fetchRoleVotes({ limit: 50 }),
    enabled: role === "ADMIN",
    staleTime: 30_000,
  });

  const usersQ = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listUsersAdmin({ limit: 100 }),
    enabled: role === "ADMIN",
    staleTime: 30_000,
  });

  const programs = programsQ.data ?? [];
  const counts = countByStatus(programs);
  const toSign = counts.APPROVED + counts.DRAWABLE; 

  const mine = wallet
    ? programs.filter((p) => p.picWallet?.toLowerCase() === wallet)
    : [];
  const myDrafts = mine.filter((p) => !p.isOnChain).length;
  const my = {
    total: mine.length,
    drafts: myDrafts,
    active: mine.filter(
      (p) =>
        p.isOnChain &&
        ["PENDING", "APPROVED", "DRAWABLE", "MILESTONE_ACHIEVED"].includes(
          p.status,
        ),
    ).length,
    finished: mine.filter((p) => p.status === "COMPLETED").length,
    frozen: mine.filter((p) => p.status === "FROZEN").length,
    drawable: mine.filter((p) => p.status === "DRAWABLE").length,
    fraud: mine.filter((p) => p.status === "FRAUD_CONFIRMED").length,
  };

  const openRoleVotes = (roleVotesQ.data?.rows ?? []).filter(
    (v) => !v.executed,
  ).length;
  const unverifiedUsers = (usersQ.data?.users ?? []).filter(
    (u) => !u.isVerified,
  ).length;
  const totalUsers =
    usersQ.data?.pagination?.total ?? usersQ.data?.users.length ?? 0;

  let actionQueue = 0;
  if (role === "VALIDATOR")
    actionQueue = counts.PENDING + counts.FROZEN + toSign;
  else if (role === "AUDITOR") actionQueue = counts.DRAWABLE + toSign;
  else if (role === "ADMIN")
    actionQueue = openRoleVotes + unverifiedUsers + toSign;
  else if (role === "PIC") actionQueue = my.drafts + my.drawable + my.frozen;

  return {
    isLoading: programsQ.isLoading,
    role,
    reputation: me?.reputationScore ?? 0,
    counts,
    toSign,
    my,
    openRoleVotes,
    unverifiedUsers,
    totalUsers,
    actionQueue,
  };
}
