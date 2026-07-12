import { cacheAside } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";

const USER_MINI = {
  id: true,
  name: true,
  username: true,
  walletAddress: true,
  profilePictureURL: true,
  role: true,
} as const;

export async function listRoleVotes(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const cacheKey = `votes:role:list:${page}:${limit}`;

  return cacheAside(cacheKey, 180, async () => {
    const [votes, total] = await Promise.all([
      prisma.roleVote.findMany({
        select: {
          voteId: true,
          candidate: true,
          roleToTarget: true,
          voteCount: true,
          isDevote: true,
          executed: true,
          _count: { select: { ballots: true } },
        },
        orderBy: { voteId: "desc" },
        skip,
        take: limit,
      }),

      prisma.roleVote.count(),
    ]);

    const wallets = [...new Set(votes.map((v) => v.candidate.toLowerCase()))];

    const users = wallets.length
      ? await prisma.user.findMany({
          where: { walletAddress: { in: wallets } },
          select: USER_MINI,
        })  : [];
        
    const byWallet = new Map(
      users.map((u) => [u.walletAddress!.toLowerCase(), u]),
    );

    const enriched = votes.map((v) => ({
      ...v,
      candidateUser: byWallet.get(v.candidate.toLowerCase()) ?? null,
    }));

    return {
      votes: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  });
}

export async function getRoleVoteById(voteId: number) {
  const cacheKey = `votes:role:detail:${voteId}`;

  return cacheAside(cacheKey, 180, async () => {
    const votes = await prisma.roleVote.findUnique({
      where: { voteId },
      select: {
        voteId: true,
        candidate: true,
        roleToTarget: true,
        voteCount: true,
        isDevote: true,
        executed: true,
        ballots: {
          select: {
            votedAt: true,
            voter: {
              select: USER_MINI,
            },
          },
          orderBy: { votedAt: "asc" },
        },
      },
    });

    if (!votes) {
      throw new AppError("Role vote not found", 404);
    }

    const candidateUser = await prisma.user.findUnique({
      where: { walletAddress: votes.candidate.toLowerCase() },
      select: USER_MINI,
    });

    return { ...votes, candidateUser };
  });
}

export async function listUnfreezeVotes(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const cacheKey = `votes:unfreeze:list:${page}:${limit}`;

  return cacheAside(cacheKey, 180, async () => {
    const [votes, total] = await Promise.all([
      prisma.unfreezeVote.findMany({
        select: {
          id: true,
          programId: true,
          picWallet: true,
          approveVotes: true,
          rejectVotes: true,
          appealStartedAt: true,
          resolved: true,
          createdAt: true,
          _count: { select: { ballots: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.unfreezeVote.count(),
    ]);

    return {
      votes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  });
}

export async function getUnfreezeVoteByProgramId(programId: number) {
  return cacheAside(`votes:unfreeze:detail:${programId}`, 180, async () => {
    const vote = await prisma.unfreezeVote.findUnique({
      where: { programId },
      select: {
        id: true,
        programId: true,
        picWallet: true,
        approveVotes: true,
        rejectVotes: true,
        appealStartedAt: true,
        resolved: true,
        createdAt: true,
        txHash: true,
        ballots: {
          select: {
            approve: true,
            votedAt: true,
            voter: { select: USER_MINI },
          },
          orderBy: { votedAt: "asc" },
        },
      },
    });

    if (!vote) throw new AppError("Unfreeze vote not found", 404);

    return vote;
  });
}
