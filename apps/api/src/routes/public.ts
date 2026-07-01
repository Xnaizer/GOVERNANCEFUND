import express, { type Router } from "express";
import publicController from "../controllers/publicController";
import { readLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

const router: Router = express.Router();

router.get(
    "/programs",
    readLimiter,
    asyncHandler(publicController.listPrograms)
);

router.get(
    "/programs/:id",
    readLimiter,
    asyncHandler(publicController.detailProgram)
);

router.get(
    "/stats",
    readLimiter,
    asyncHandler(publicController.stats)
);

router.get(
    "/programs/:id/withdrawals",
    readLimiter,
    asyncHandler(publicController.programWithdrawals)
);

export default router;