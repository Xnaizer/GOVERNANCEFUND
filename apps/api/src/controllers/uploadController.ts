import type { Request, Response } from "express";
import * as uploadService from "../services/uploadService";
import { AppError } from "../utils/AppError";
import response from "../utils/response";

function requireFile(req: Request) {
  if (!req.file) {
    throw new AppError("File is required", 400);
  }

  return req.file;
}

function parseProgramId(req: Request): number {
  const id = Number(req.params.programId);

  if (!Number.isInteger(id) || id < 1) {
    throw new AppError("Invalid program id", 400);
  }

  return id;
}

export default {
  async programImage(req: Request, res: Response): Promise<void> {
    const result = await uploadService.attachProgramImage(
      req.user!.id,
      parseProgramId(req),
      requireFile(req),
    );

    response.created(res, result);
  },

  async programPinData(req: Request, res: Response): Promise<void> {
    const result = await uploadService.pinProgramData(
      req.user!.id,
      parseProgramId(req),
    );

    response.success(res, result);
  },

  async milestoneEvidence(req: Request, res: Response): Promise<void> {
    const milestoneId = req.params.milestoneId;

    if (!milestoneId) {
      throw new AppError("Invalid milestone id", 400);
    }

    const result = await uploadService.attachMilestoneEvidence(
      req.user!.id,
      milestoneId,
      requireFile(req),
    );

    response.created(res, result);
  },

  async withdrawalReceipt(req: Request, res: Response): Promise<void> {
    const withdrawalId = req.params.withdrawalId;

    if (!withdrawalId) {
      throw new AppError("Invalid withdrawal id", 400);
    }

    const result = await uploadService.attachWithdrawalReceipt(
      req.user!.id,
      withdrawalId,
      requireFile(req),
    );

    response.created(res, result);
  },
};
