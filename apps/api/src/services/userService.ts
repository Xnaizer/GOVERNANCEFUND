import { cacheAside } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { ListUserQueryInput } from "../validators/userValidator";

const PUBLIC_USER_SELECT = {
    id: true,
    username: true,
    name: true,
    role: true,
    walletAddress: true,
    isVerified: true,
    reputationScore: true,
    institution: true,
    position: true,
    nationality: true,
    profilePictureURL: true,
    profileBannerURL: true,   
    createdAt: true,
} as const;

export async function listUsers(query: ListUserQueryInput) {
    const { page, role, limit, isVerified } = query;
    const skip = (page - 1) * limit;

    const where = {
        ...(role !== undefined ? { role } : {}),
        ...(isVerified !== undefined ? { isVerified } : {})
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                isVerified: true,
                walletAddress: true,
                name: true,
                reputationScore: true,
                profilePictureURL: true, 
                createdAt: true
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }

}

export async function setVerified(userId: string, isVerified: boolean) {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if(!user) {
        throw new AppError("User not found", 404);
    }

    if(isVerified && !user.isActive) {
        throw new AppError("User must verify email before identity verification", 400);
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { isVerified },
        select: { 
            id: true, 
            username: true, 
            email: true, 
            role: true,
            isActive: true, 
            isVerified: true, 
            name: true 
        }
    });

    return updated;
}

export async function getPublicUserProfile(userId: string) {
    const cacheKey = `public:user:${userId}`;

    return cacheAside(cacheKey, 30, async () => {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                ...PUBLIC_USER_SELECT,
                programs: {
                    select: {
                        programId: true,
                        title: true,
                        status: true,
                        displayTab: true,
                        totalBudget: true,
                        integrity: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        if(!user) {
            throw new AppError("User not found", 404);
        }

        let roleVoteBallots = undefined;
        let unfreezeBallots = undefined;
        let reputationLogs = undefined;

        if(user.role === "ADMIN") {
            roleVoteBallots = await prisma.roleVoteBallot.findMany({
                where: { voterId: userId },
                select: {
                    votedAt: true,
                    roleVote: {
                        select: {
                            voteId: true,
                            candidate: true,
                            roleToTarget: true,
                            isDevote: true,
                            executed: true
                        }
                    }
                },
                orderBy: { votedAt: "desc" },
                take: 50
            });
        } else if (user.role === "VALIDATOR") {
            unfreezeBallots = await prisma.unfreezeVoteBallot.findMany({
                where: { voterId: userId},
                select: {
                    approve: true,
                    votedAt: true,
                    unfreezeVote: { select: { programId: true, resolved: true } }
                },
                orderBy: { votedAt: "desc" },
                take: 50
            });
        } else if (user.role === "AUDITOR" || user.role === "PIC") {
            reputationLogs = await prisma.reputationLog.findMany({
                where: { userId },
                select: {
                    change: true,
                    reason: true,
                    scoreAfter: true,
                    programId: true,
                    createdAt: true
                },
                orderBy: { createdAt: "desc" },
                take: 50
            });
        }

        return { ...user, roleVoteBallots, unfreezeBallots, reputationLogs };
    });
}