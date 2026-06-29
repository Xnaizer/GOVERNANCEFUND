import express , { type Router } from "express";
import { webhookVerify } from "../middleware/webhookVerify";
import { asyncHandler } from "../utils/asyncHandler";
import response from "../utils/response";
import * as webhookService from "../services/webhookService";

const router: Router = express.Router();

router.post(
    "/alchemy",
    webhookVerify,
    asyncHandler(async(req, res) => {
        const payload = JSON.parse(req.body.toString("utf8"));

        console.log("[WEBHOOK] Received & verified:", JSON.stringify(payload).slice(0, 200));
        
        if(payload.programId !== undefined) {
            const result = await webhookService.handleProposalSubmitted({
                programId: Number(payload.programId),
                programHash: payload.programHash,
                picWallet: payload.picWallet,
                txHash: payload.txHash
            });
            console.log("[WEBHOOK] Classified:", result);
        }

        response.success(res, "Webhook received");
    })
)

export default router;