import type { Request, Response } from "express";
import { bindWalletSchema } from "../validators/walletValidator";
import * as walletService from "../services/walletService";
import { AppError } from "../utils/AppError";
import response from "../utils/response";

export default {

    // GET /api/v1/users/wallet/nonce
    async getNonce(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        const result = await walletService.generateNonce(user.id);

        response.success(res, result);
    },

    // POST /api/v1/users/wallet/bind
    async bind(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        const parsed = bindWalletSchema.safeParse(req.body);

        if(!parsed.success) {
            throw new AppError(parsed.error.errors[0].message, 400);
        }

        const result = await walletService.bindWallet(
            user.id,
            parsed.data.walletAddress,
            parsed.data.signature
        );

        response.success(res, result);
    }
}