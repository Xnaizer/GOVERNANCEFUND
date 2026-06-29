import { prisma } from "../lib/prisma";
import { computeProgramHash } from "@repo/shared";
import { invalidate, invalidatePattern } from "../lib/cache";

interface ProposalSubmittedEvent {
    programId: number;
    programHash: string;
    picWallet: string;
    txHash?: string;
}

export async function handleProposalSubmitted(
    event: ProposalSubmittedEvent
): Promise<{ result: string; programId: number; }> {
    const { programId, picWallet, txHash } = event;

    const onChainHash = event.programHash.toLowerCase();

    const existing = await prisma.program.findUnique({
        where: { programId }
    });

    if(!existing) {
        await prisma.program.create({
            data: {
                programId,
                programHash: onChainHash,
                picWallet: picWallet.toLowerCase(),
                totalBudget: "0",
                milestoneCount: 0,
                integrity: "ORPHAN",
                displayTab: "FLAGGED",
                isOrphan: true,
                isOnChain: true,
                status: "PENDING",
                txHash: txHash ?? null,
                submittedAt: new Date(),
            }
        });

        await invalidatePattern("programs:list:*");
        await invalidate("public:stats");

        return { result: "ORPHAN", programId };
    }

    const recomputedHash = computeProgramHash({
        programId: existing.programId,
        title: existing.title,
        description: existing.description,
        totalBudget: existing.totalBudget,
        picWallet: existing.picWallet,
        milestoneCount: existing.milestoneCount,
        province: existing.province,
        regency: existing.regency,
        district: existing.district,
        locationAddress: existing.locationAddress,
        executorName: existing.executorName,
        executorRegistration: existing.executorRegistration,
        category: existing.category,
        institutionName: existing.institutionName,
        fiscalYear: existing.fiscalYear
    }).toLowerCase();

    if(recomputedHash === onChainHash) {
        await prisma.program.update({
            where: { programId },
            data: {
                integrity: "VERIFIED",
                displayTab: "ACTIVE",
                isOnChain: true,
                txHash: txHash ?? existing.txHash,
                submittedAt: existing.submittedAt ?? new Date()
            }
        });

        await invalidate(`program:detail:${programId}`);
        await invalidatePattern("programs:list:*");
        await invalidate("public:stats");

        return { result: "VERIFIED", programId };
    }

    await prisma.program.update({
        where: {
            programId
        },
        data: {
            integrity: "HASH_MISMATCH",
            displayTab: "FLAGGED",
            isOnChain: true,
            txHash: txHash ?? existing.txHash
        }
    });

    await invalidate(`program:detail:${programId}`);
    await invalidatePattern("programs:list:*");
    await invalidate("public:stats");

    return { result: "HASH_MISMATCH", programId };

}