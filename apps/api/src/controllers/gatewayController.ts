import type { Request, Response } from "express";
import * as redemptionService from "../services/redemptionService";
import { AppError } from "../utils/AppError";
import response from "../utils/response";

export default {
  // GET /api/v1/gateway/redemptions
  async listRedemptions(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const status =
      typeof req.query.status === "string"
        ? req.query.status.toUpperCase()
        : undefined;

    const result = await redemptionService.listRedemptions({
      page,
      limit,
      status,
    });
    response.success(res, result.redemptions, {
      pagination: result.pagination,
    });
  },

  // GET /api/v1/gateway/redemptions/:id
  async detailRedemption(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
      throw new AppError("Invalid redemption id", 400);
    response.success(res, await redemptionService.getRedemptionById(id));
  },

  // GET /api/v1/gateway/redemptions/pic/:wallet
  async byPic(req: Request, res: Response): Promise<void> {
    const wallet = req.params.wallet;
    if (!wallet) throw new AppError("Invalid wallet", 400);
    response.success(res, await redemptionService.listRedemptionsByPic(wallet));
  },

  // GET /api/v1/gateway/stats
  async stats(_req: Request, res: Response): Promise<void> {
    response.success(res, await redemptionService.getRedemptionStats());
  },
};
