import express, { type Router } from "express";
import programController from "../controllers/programController";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { mutationLimiter, readLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

const router: Router = express.Router();

router.post(
    "/",
    mutationLimiter,
    asyncHandler(authMiddleware),
    requireRole(["PIC"]),
    asyncHandler(programController.create)
);

router.get(
    "/",
    readLimiter,
    asyncHandler(authMiddleware),
    asyncHandler(programController.list)
);

router.get(
    "/:id",
    readLimiter,
    asyncHandler(authMiddleware),
    asyncHandler(programController.detail)
);

export default router;