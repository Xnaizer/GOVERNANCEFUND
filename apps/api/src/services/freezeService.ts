import { prisma } from "../lib/prisma";
import { invalidate } from "../lib/cache";
import { AppError } from "../utils/AppError";
import type { FreezeEvidenceInput } from "../validators/freezeValidator";

export async function submitFreezeEvidence(
  programId: number,
  auditorUserId: string,
  data: FreezeEvidenceInput,
) {
  const program = await prisma.program.findUnique({
    where: { programId },
    select: { programId: true, status: true },
  });

  if (!program) {
    throw new AppError("Program not found", 404);
  }

  if (program.status !== "FROZEN" && program.status !== "DRAWABLE") {
    throw new AppError(
      "Freeze evidence only applies to a FROZEN (or about-to-freeze DRAWABLE) program",
      400,
    );
  }

  const auditor = await prisma.user.findUnique({
    where: { id: auditorUserId },
    select: { walletAddress: true },
  });

  if (!auditor?.walletAddress) {
    throw new AppError("Auditor wallet not bound", 400);
  }

  const wallet = auditor.walletAddress.toLowerCase();
  const existing = await prisma.freezeOutcome.findUnique({
    where: { programId },
  });

  if (existing && existing.auditorWallet.toLowerCase() !== wallet) {
    throw new AppError(
      "Only the auditor who froze this program can attach evidence",
      403,
    );
  }

  const result = existing
    ? await prisma.freezeOutcome.update({
        where: { programId },
        data: {
          reason: data.reason,
          description: data.description ?? null,
          evidenceUrl: data.evidenceUrl ?? null,
        },
      })
    : await prisma.freezeOutcome.create({
        data: {
          programId,
          auditorWallet: wallet,
          outcome: "PENDING",
          frozenAt: new Date(),
          reason: data.reason,
          description: data.description ?? null,
          evidenceUrl: data.evidenceUrl ?? null,
        },
      });

  await invalidate(`program:detail:${programId}`);
  return result;
}
