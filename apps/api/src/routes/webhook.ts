import express , { type Router } from "express";
import { webhookVerify } from "../middleware/webhookVerify";
import { asyncHandler } from "../utils/asyncHandler";
import response from "../utils/response";
import { webhookIngestionQueue } from "../queues/queues";

const router: Router = express.Router();

router.post(
    "/alchemy",
    webhookVerify,
    asyncHandler(async(req, res) => {
        const payload = JSON.parse(req.body.toString("utf8"));
        
        if(payload.eventName) {
            await webhookIngestionQueue.add("event", {
                eventName: payload.eventName,
                args: payload.args ?? {},
                txHash: payload.txHash,
            });
        }

        response.success(res, "Webhook queued");
    })
)

export default router;