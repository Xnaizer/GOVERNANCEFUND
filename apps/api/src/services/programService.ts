import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { computeProgramHash } from "@repo/shared";
import { getValidatorCount } from "./contractService";
import type { CreateProgramInput } from "../validators/programValidator";

const MIN_VALIDATORS = 3;
const REPUTATION_BLOCKED = 100;

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

    const result = await prisma.$transaction(async (tx) => {
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

    return { programId: result.programId, programHash: result.programHash };
}