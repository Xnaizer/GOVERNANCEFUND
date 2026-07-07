import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { computeProgramHash } from "@repo/shared";
import { getValidatorCount } from "./contractService";
import type { CreateProgramInput } from "../validators/programValidator";
import { invalidate, invalidatePattern } from "../lib/cache";
import { cacheAside } from "../lib/cache";
import type { ListProgramQuery } from "../validators/programValidator";

const MIN_VALIDATORS = 3;
const REPUTATION_BLOCKED = 35;
const PUBLIC_PROGRAM_SELECT = {
    programId: true,
    programHash: true,
    picWallet: true,
    totalBudget: true,
    totalAllocatedSoFar: true,
    milestoneCount: true,
    currentMilestone: true,
    status: true,
    title: true,
    description: true,
    province: true,
    regency: true,
    district: true,
    locationAddress: true,
    executorName: true,
    executorRegistration: true,
    category: true,
    institutionName: true,
    fiscalYear: true,
    plannedStartDate: true,
    plannedEndDate: true,
    integrity: true,
    displayTab: true,
    isOrphan: true,
    isOnChain: true,
    txHash: true,
    submittedAt: true,
    createdAt: true,
    programURLs: true,
    ipfsCid: true, 
} as const;

export async function createProgram(userId: string, input: CreateProgramInput) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if(!user) throw new AppError("User not found", 404);

    if(user.role !== "PIC") {
        throw new AppError("Only PIC can create programs", 403);
    }

    if(!user.isVerified) {
        throw new AppError("Identity must be verified before creating programs", 403);
    }

    if(!user.walletAddress) {
        throw new AppError("Bind a wallet before creating programs", 400);
    }

    if(user.reputationScore < REPUTATION_BLOCKED) {
        throw new AppError("Reputation too low to create programs", 403);
    }

    if(input.milestones.length !== input.milestoneCount) {
        throw new AppError("milestoneCount must match number of milestones", 400);
    }

    const sumMilestones = input.milestones.reduce((acc, m) => acc + BigInt(m.milestoneBudget), 0n);

    if(sumMilestones !== BigInt(input.totalBudget)) {
        throw new AppError("Sum of milestone budgets must equal totalBudget", 400);
    }

    const validatorCount = await getValidatorCount();

    if(validatorCount < MIN_VALIDATORS) {
        throw new AppError(`System requires at least ${MIN_VALIDATORS} validators on-chain`, 400);
    }

    const result = await prisma.$transaction(async (tx: any) => {
        const program = await tx.program.create({
            data: {
                programHash: "",
                picWallet: user.walletAddress!,
                totalBudget: input.totalBudget,
                milestoneCount: input.milestoneCount,
                title: input.title,
                description: input.description,
                province: input.province,
                regency: input.regency,
                district: input.district ?? null,
                locationAddress: input.locationAddress,
                executorName: input.executorName,
                executorRegistration: input.executorRegistration,
                category: input.category,
                institutionName: input.institutionName,
                fiscalYear: input.fiscalYear,
                plannedStartDate: input.plannedStartDate ? new Date(input.plannedStartDate) : null,
                plannedEndDate: input.plannedEndDate ? new Date(input.plannedEndDate) : null,
                status: "PENDING",
                isOnChain: false,
                picId: user.id
            }
        });

        const programHash = computeProgramHash({
            programId: program.programId,
            title: program.title,
            description: program.description,
            totalBudget: program.totalBudget,
            picWallet: program.picWallet,
            milestoneCount: program.milestoneCount,
            province: program.province,
            regency: program.regency,
            district: program.district,
            locationAddress: program.locationAddress,
            executorName: program.executorName,
            executorRegistration: program.executorRegistration,
            category: program.category,
            institutionName: program.institutionName,
            fiscalYear: program.fiscalYear
        });

        const updated = await tx.program.update({
            where: {
                programId: program.programId
            },
            data: {
                programHash
            }
        });

        await tx.milestone.createMany({
            data: input.milestones.map((m, index) => ({
                programId: program.programId,
                milestoneIndex: index,
                title: m.title,
                description: m.description ?? null,
                milestoneBudget: m.milestoneBudget,
                status: "PLANNED"
            })),
        });

        return updated;
    });

    await invalidatePattern("programs:list:*");
    await invalidate("public:stats");

    return { programId: result.programId, programHash: result.programHash };
}

export async function listPrograms(query: ListProgramQuery, onlyOnChain = false) {
    const { tab, page, limit } = query; 
    const skip = (page - 1) * limit;
    const cacheKey = `programs:list:${onlyOnChain ? "chain" : "all"}:${tab ?? "all"}:${page}:${limit}`;


    return cacheAside(cacheKey, 30, async () => {
        const where = {
            ...(tab ? { displayTab: tab } : {}),
            ...(onlyOnChain ? { isOnChain: true } : {}) 
        };

        const [programs, total] = await Promise.all([
            prisma.program.findMany({
                where,
                select: PUBLIC_PROGRAM_SELECT,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.program.count({ where })
        ]);
        
        return {
            programs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }
    });

}

export async function getProgramById(programId: number) {
    const cacheKey = `program:detail:${programId}`;

    return cacheAside(cacheKey, 60, async () => {
        const program = await prisma.program.findUnique({
            where: {
                programId
            },
            select: {
                ...PUBLIC_PROGRAM_SELECT,
                milestones: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        milestoneIndex: true,
                        milestoneBudget: true,
                        evidenceURL: true,
                        evidenceHash: true,
                        signatures: {
                            select: {
                                id: true,
                                signerWallet: true,
                                signerRole: true,
                                signedAt: true
                            },
                            orderBy: { signedAt: "asc" }
                        }
                    },
                    orderBy: { milestoneIndex: "asc" }
                },
                withdrawals: {
                    select: {
                        id: true,
                        amount: true,
                        recipientName: true,
                        description: true,
                        timestamp: true,
                        txHash: true,
                        receiptUrl: true,
                    },
                    orderBy: { timestamp: "desc" }
                },
                freezeOutcome: {
                    select: {
                        auditorWallet: true,
                        outcome: true,
                        frozenAt: true,
                        resolvedAt: true,
                        txHash: true
                    }
                },
                unfreezeVote: {
                    select: {
                        approveVotes: true,
                        rejectVotes: true,
                        appealStartedAt: true,
                        resolved: true,
                        picWallet: true,
                        txHash: true
                    }
                }
            }
        });

        if(!program) {
            throw new AppError("Program not found", 404);
        }

        return program;
    });
}

export async function getPublicStats() {
    return cacheAside("public:stats", 60, async () => {
        const [active, finished, flagged, fraud, total] = await Promise.all([
            prisma.program.count({ where: { displayTab: "ACTIVE" }}),
            prisma.program.count({ where: { displayTab: "FINISHED" }}),
            prisma.program.count({ where: { displayTab: "FLAGGED" }}),
            prisma.program.count({ where: { displayTab: "FRAUD" }}),
            prisma.program.count(),
        ]);

        return {
            total,
            byTab: { active, finished, flagged, fraud }
        }
    });
}

export async function getProgramWithdrawals(programId: number) {
    const cacheKey = `program:withdrawals:${programId}`;

    return cacheAside(cacheKey, 30, async () => {
        const program = await prisma.program.findUnique({
            where: { programId },
            select: { programId: true }
        });

        if(!program) {
            throw new AppError("Program not found", 404);
        }

        const withdrawals = await prisma.withdrawalRecord.findMany({
            where: { programId },
            select: {
                id: true,
                amount: true,
                recipientName: true,
                description: true,
                timestamp: true,
                txHash: true,
                receiptUrl: true
            },
            orderBy: { timestamp: "desc" }
        });

        return { programId, withdrawals, count: withdrawals.length }
    });
}

export async function getSubmissionPayload(userId: string, programId: number) {
    const program = await prisma.program.findUnique({ 
        where: { programId } 
    });

    if (!program) throw new AppError("Program not found", 404);
    if (program.picId !== userId) throw new AppError("Not your program", 403);
    if (program.isOnChain) throw new AppError("Program already anchored on-chain", 409);

    const programHash = computeProgramHash({
        programId: program.programId, title: program.title, description: program.description,
        totalBudget: program.totalBudget, picWallet: program.picWallet, milestoneCount: program.milestoneCount,
        province: program.province, regency: program.regency, district: program.district,
        locationAddress: program.locationAddress, executorName: program.executorName,
        executorRegistration: program.executorRegistration, category: program.category,
        institutionName: program.institutionName, fiscalYear: program.fiscalYear,
    });

    return { programId: program.programId, programHash, milestoneCount: program.milestoneCount };
}
