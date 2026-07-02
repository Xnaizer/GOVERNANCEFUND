import { prisma } from "../lib/prisma";
import { computeProgramHash } from "@repo/shared";
import { getOnChainProposal } from "./contractService";
import { invalidate, invalidatePattern } from "../lib/cache";

function deriveTab(status: string): "ACTIVE" | "FINISHED" | "FRAUD" {
    if (status === "COMPLETED") return "FINISHED";
    if (status === "FRAUD_CONFIRMED") return "FRAUD";
    return "ACTIVE";
}

export async function runReconciliation() {

    const programs = await prisma.program.findMany({
        where: { isOnChain: true, isOrphan: true },
        select: {
            programId: true, 
            title: true, 
            description: true, 
            totalBudget: true,
            picWallet: true, 
            milestoneCount: true, 
            province: true, 
            regency: true,
            district: true, 
            locationAddress: true, 
            executorName: true,
            executorRegistration: true, 
            category: true, 
            institutionName: true,
            fiscalYear: true, 
            integrity: true, 
            displayTab: true, 
            status: true,
        }
    });

    let checked = 0, verified = 0, mismatched = 0, missing = 0;

    for(const program of programs) {
        checked++;
        const onChain = await getOnChainProposal(program.programId);

        if(!onChain) {
            missing++;
            await prisma.program.update({
                where: { programId: program.programId },
                data: { integrity: "HASH_MISMATCH", displayTab: "FLAGGED" },
            });
            
            continue;
        }

        const recomputed = computeProgramHash({
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
            fiscalYear: program.fiscalYear,
        }).toLowerCase();

        if(recomputed === onChain.programHash.toLowerCase()) {
            verified++;

            if(program.integrity !== "VERIFIED" || program.displayTab === "FLAGGED") {
                await prisma.program.update({
                    where: { programId: program.programId },
                    data: { integrity: "VERIFIED", displayTab: deriveTab(program.status) },
                });
            }
        } else {
            mismatched++;
            await prisma.program.update({
                where: { programId: program.programId },
                data: { integrity: "HASH_MISMATCH", displayTab: "FLAGGED" },
            });
        }

    }

    await invalidatePattern("programs:list:*");
    await invalidate("public:stats");

    const summary = { checked, verified, mismatched, missing, at: new Date().toISOString() };
    
    console.log("[RECONCILIATION]", summary);

    return summary;
}