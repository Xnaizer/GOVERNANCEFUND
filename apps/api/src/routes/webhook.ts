import express , { type Router } from "express";
import { webhookVerify } from "../middleware/webhookVerify";
import { asyncHandler } from "../utils/asyncHandler";
import response from "../utils/response";
import { webhookIngestionQueue } from "../queues/queues";
import { isKnownEvent } from "../services/webhookService";
import { decodeGovernanceLog, extractLogs, jsonSafe } from "../services/webhookDecoder";

const router: Router = express.Router();

router.post(
    "/alchemy",
    webhookVerify,
    asyncHandler(async(req, res) => {
        const payload = JSON.parse(req.body.toString("utf8"));
        let queued = 0;
        
        if(payload.eventName) {
            if(isKnownEvent(payload.eventName)) {
                await webhookIngestionQueue.add(
                    "event",
                    {
                        eventName: payload.eventName,
                        args: jsonSafe(payload.args ?? {}),
                        txHash: payload.txHash
                    },
                    payload.txHash ? { jobId: `${payload.txHash}:0` } : undefined
                );
                queued++;
            }
        } else {
            for(const log of extractLogs(payload)) {
                const decoded = decodeGovernanceLog(log);

                if(!decoded || !isKnownEvent(decoded.eventName)) continue;

                await webhookIngestionQueue.add(
                    "event",
                    {
                        eventName: decoded.eventName,
                        args: decoded.args,
                        txHash: decoded.txHash
                    },
                    { 
                        jobId: `${decoded.txHash}:${decoded.logIndex}` 
                    }
                );
                queued++;
            }
        }

        response.success(res, { queued });
    })
);

export default router;