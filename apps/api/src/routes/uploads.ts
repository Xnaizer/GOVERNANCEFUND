import express, { type Router } from "express";
import uploadController from "../controllers/uploadController";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { mutationLimiter } from "../middleware/rateLimiter";
import { imageUpload, documentUpload } from "../middleware/upload";
import { asyncHandler } from "../utils/asyncHandler";

const router: Router = express.Router();

router.post(
  "/program/:programId/image",
  mutationLimiter,
  asyncHandler(authMiddleware),
  requireRole(["PIC"]),
  imageUpload,
  asyncHandler(uploadController.programImage),
);

router.post(
  "/program/:programId/pin-data",
  mutationLimiter,
  asyncHandler(authMiddleware),
  requireRole(["PIC"]),
  asyncHandler(uploadController.programPinData),
);

router.post(
  "/milestone/:milestoneId/evidence",
  mutationLimiter,
  asyncHandler(authMiddleware),
  requireRole(["PIC"]),
  documentUpload,
  asyncHandler(uploadController.milestoneEvidence),
);

router.post(
  "/withdrawal/:withdrawalId/receipt",
  mutationLimiter,
  asyncHandler(authMiddleware),
  requireRole(["PIC"]),
  imageUpload,
  asyncHandler(uploadController.withdrawalReceipt),
);

router.post(
  "/user/avatar",
  mutationLimiter,
  asyncHandler(authMiddleware),
  imageUpload,
  asyncHandler(uploadController.userAvatar),
);

router.post(
  "/user/banner",
  mutationLimiter,
  asyncHandler(authMiddleware),
  imageUpload,
  asyncHandler(uploadController.userBanner),
);

export default router;
