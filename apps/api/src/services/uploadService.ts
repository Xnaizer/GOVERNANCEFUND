import { prisma } from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { invalidate, invalidatePattern } from "../lib/cache";
import { uploadImage, deleteImage } from "./cloudinaryService";
import { pinFile, pinJSON } from "./ipfsService";
import { sha256Hex } from "../utils/hash";

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

async function invalidateProgram(programId: number): Promise<void> {
  await invalidate(`program:detail:${programId}`);
  await invalidatePattern("programs:list:*");
}

const MAX_PROGRAM_IMAGES = 8;

async function assertProgramOwnership(userId: string, programId: number) {
  const program = await prisma.program.findUnique({
    where: { programId },
    select: { picId: true },
  });

  if (!program) {
    throw new AppError("Program not found", 404);
  }

  if (program.picId !== userId) {
    throw new AppError("Not your program", 403);
  }
}

export async function attachProgramImage(
  userId: string,
  programId: number,
  file: UploadedFile,
) {
  await assertProgramOwnership(userId, programId);

  const existingCount = await prisma.programImage.count({
    where: { programId },
  });

  if (existingCount >= MAX_PROGRAM_IMAGES) {
    throw new AppError(
      `Maksimum ${MAX_PROGRAM_IMAGES} foto per program`,
      400,
    );
  }

  const { url, publicId } = await uploadImage(file.buffer, {
    folder: `governance/programs/${programId}`,
  });

  const image = await prisma.programImage.create({
    data: { programId, url, publicId },
  });

  await invalidateProgram(programId);

  return image;
}

export async function replaceProgramImage(
  userId: string,
  programId: number,
  imageId: string,
  file: UploadedFile,
) {
  await assertProgramOwnership(userId, programId);

  const existing = await prisma.programImage.findUnique({
    where: { id: imageId },
  });

  if (!existing || existing.programId !== programId) {
    throw new AppError("Program image not found", 404);
  }

  const { url, publicId } = await uploadImage(file.buffer, {
    folder: `governance/programs/${programId}`,
  });

  const updated = await prisma.programImage.update({
    where: { id: imageId },
    data: { url, publicId },
  });

  await deleteImage(existing.publicId).catch((err) => {
    console.error(
      `[UPLOAD] Failed to delete old Cloudinary asset ${existing.publicId}:`,
      err,
    );
  });

  await invalidateProgram(programId);

  return updated;
}

export async function deleteProgramImage(
  userId: string,
  programId: number,
  imageId: string,
) {
  await assertProgramOwnership(userId, programId);

  const existing = await prisma.programImage.findUnique({
    where: { id: imageId },
  });

  if (!existing || existing.programId !== programId) {
    throw new AppError("Program image not found", 404);
  }

  await prisma.programImage.delete({ where: { id: imageId } });

  await deleteImage(existing.publicId).catch((err) => {
    console.error(
      `[UPLOAD] Failed to delete Cloudinary asset ${existing.publicId}:`,
      err,
    );
  });

  await invalidateProgram(programId);

  return { deleted: true, imageId };
}

export async function pinProgramData(userId: string, programId: number) {
  const program = await prisma.program.findUnique({
    where: { programId },
  });

  if (!program) {
    throw new AppError("Program not found", 404);
  }

  if (program.picId !== userId) {
    throw new AppError("Not your program", 403);
  }

  const canonical = {
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
    programHash: program.programHash,
  };

  const { cid, gatewayUrl } = await pinJSON(
    canonical,
    `program-${programId}.json`,
  );

  await prisma.program.update({
    where: { programId },
    data: {
      ipfsCid: cid,
    },
  });

  await invalidateProgram(programId);
  return { cid, gatewayUrl };
}

export async function attachMilestoneEvidence(
  userId: string,
  milestoneId: string,
  file: UploadedFile,
) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    select: {
      id: true,
      status: true,
      programId: true,
      program: {
        select: {
          picId: true,
        },
      },
    },
  });

  if (!milestone) {
    throw new AppError("Milestone not found", 404);
  }

  if (milestone.program.picId !== userId) {
    throw new AppError("Not your program", 403);
  }

  if (milestone.status !== "PLANNED") {
    throw new AppError(
      "Evidence can only be set while milestone is PLANNED",
      400,
    );
  }

  const { cid, gatewayUrl } = await pinFile(
    file.buffer,
    file.originalname,
    file.mimetype,
  );

  const evidenceHash = sha256Hex(file.buffer);

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      evidenceURL: gatewayUrl,
      evidenceHash,
    },
  });

  await invalidate(`program:detail:${milestone.programId}`);

  return { cid, gatewayUrl, evidenceHash };
}

export async function attachWithdrawalReceipt(
  userId: string,
  withdrawalId: string,
  file: UploadedFile,
) {
  const withdrawal = await prisma.withdrawalRecord.findUnique({
    where: { id: withdrawalId },
    select: {
      id: true,
      programId: true,
      program: {
        select: {
          picId: true,
        },
      },
    },
  });

  if (!withdrawal) {
    throw new AppError("Withdrawal not found", 404);
  }

  if (withdrawal.program.picId !== userId) {
    throw new AppError("Not your program", 403);
  }

  const { url, publicId } = await uploadImage(file.buffer, {
    folder: `governancefund/receipts/${withdrawal.programId}`,
  });

  await prisma.withdrawalRecord.update({
    where: { id: withdrawalId },
    data: { receiptUrl: url },
  });

  await invalidate(`program:detail:${withdrawal.programId}`);
  await invalidate(`program:withdrawals:${withdrawal.programId}`);

  return { url, publicId };
}

export async function updateUserAvatar(userId: string, file: UploadedFile) {
  const { url, publicId } = await uploadImage(file.buffer, {
    folder: `governancefund/users/${userId}`,
    publicId: "avatar",
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      profilePictureURL: url,
    },
  });

  await invalidate(`public:user:${userId}`);

  return { url, publicId };
}

export async function updateUserBanner(userId: string, file: UploadedFile) {
  const { url, publicId } = await uploadImage(file.buffer, {
    folder: `governancefund/users/${userId}`,
    publicId: "banner",
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      profileBannerURL: url,
    },
  });

  await invalidate(`public:user:${userId}`);

  return { url, publicId };
}