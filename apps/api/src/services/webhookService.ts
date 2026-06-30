import { prisma } from "../lib/prisma";
import { computeProgramHash } from "@repo/shared";
import { invalidate, invalidatePattern } from "../lib/cache";

export interface DecodedEvent {
    eventName: string;
    args: Record<string, unknown>;
    txHash?: string;
}

type EventHandler = (args: Record<string, unknown>, txHash?: string) => Promise<unknown>;

const eventHandlers: Record<string, EventHandler> = {
    ProposalSubmitted: handleProposalSubmitted,
    ProposalVoted: handleProposalVoted,
    ProposalApproved: handleProposalApproved,
    MilestoneReleased: handleMilestoneReleased,
    MilestoneFinalized: handleMilestoneFinalized,
    ProgramCompleted: handleProgramCompleted,
    OnChainWithdrawalLogged: handleWithdrawalLogged,
    ProgramForceFrozen: handleProgramForceFrozen,
    UnfreezeAppealSubmitted: handleUnfreezeAppealSubmitted,
    UnfreezeAppealVoted: handleUnfreezeAppealVoted,
    ProgramUnfrozenViaBFT: handleProgramUnfrozenViaBFT,
    ProgramFraudConfirmed: handleProgramFraudConfirmed,
    RoleVoteCreated: handleRoleVoteCreated,
    RoleVoteCast: handleRoleVoteCast,
    RoleGrantedViaGovernance: handleRoleGrantedViaGovernance,
    RoleRevokedViaGovernance: handleRoleRevokedViaGovernance,
    PicRoleGrantedByAdmin: handlePicRoleGrantedByAdmin,
    PicRoleRevokedByAdmin: handlePicRoleRevokedByAdmin
}

async function invalidateProgramCache(programId: number): Promise<void> {
    await invalidate(`program:detail:${programId}`);
    await invalidatePattern("programs:list:*");
    await invalidate("public:stats");
}

export async function dispactEvent(event: DecodedEvent): Promise<void> {
    const handler = eventHandlers[event.eventName];

    if(!handler) {
        console.warn(`[WEBHOOK] No handler for event: ${event.eventName}`);
        return;
    }

    const result = await handler(event.args, event.txHash);
    console.log(`[WEBHOOK] Handled ${event.eventName}: `, result);
}

async function handleProposalSubmitted(
  args: Record<string, unknown>,
  txHash?: string
): Promise<{ result: string; programId: number }> {
  const programId = Number(args.programId);
  const onChainHash = String(args.programHash).toLowerCase();
  const picWallet = String(args.picWallet).toLowerCase();

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

        await invalidateProgramCache(programId);

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

        await invalidateProgramCache(programId);

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

    await invalidateProgramCache(programId);

    return { result: "HASH_MISMATCH", programId };

}

export async function handleProposalVoted() {}
export async function handleProposalApproved() {}
export async function handleMilestoneReleased() {}
export async function handleMilestoneFinalized() {}
export async function handleProgramCompleted() {}
export async function handleWithdrawalLogged() {}
export async function handleProgramForceFrozen() {}
export async function handleUnfreezeAppealSubmitted() {}
export async function handleUnfreezeAppealVoted() {}
export async function handleProgramUnfrozenViaBFT() {}
export async function handleProgramFraudConfirmed() {}
export async function handleRoleVoteCreated() {}
export async function handleRoleVoteCast() {}
export async function handleRoleGrantedViaGovernance() {}
export async function handleRoleRevokedViaGovernance() {}
export async function handlePicRoleGrantedByAdmin() {}
export async function handlePicRoleRevokedByAdmin() {}