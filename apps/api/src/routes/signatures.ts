import express, { type Router } from "express";
import signatureController from "../controllers/signatureController";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import {
  signatureLimiter,
  readLimiter,
  mutationLimiter,
} from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

const router: Router = express.Router();

router.post(
  "/",
  signatureLimiter,
  asyncHandler(authMiddleware),
  requireRole(["ADMIN", "VALIDATOR", "AUDITOR"]),
  asyncHandler(signatureController.submit),
);

router.get(
  "/:milestoneId",
  readLimiter,
  asyncHandler(authMiddleware),
  asyncHandler(signatureController.list),
);

router.delete(
  "/:milestoneId",
  mutationLimiter,
  asyncHandler(authMiddleware),
  requireRole(["PIC"]),
  asyncHandler(signatureController.reset),
);

export default router;
