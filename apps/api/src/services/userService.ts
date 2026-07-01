import { cacheAside } from "../lib/cache";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { ListUserQueryInput } from "../validators/userValidator";


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