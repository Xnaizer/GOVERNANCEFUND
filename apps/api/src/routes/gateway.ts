import express, { type Router } from "express";
import gatewayController from "../controllers/gatewayController";
import { readLimiter } from "../middleware/rateLimiter";
import { asyncHandler } from "../utils/asyncHandler";

const router: Router = express.Router();

router.get("/redemptions", readLimiter, asyncHandler(gatewayController.listRedemptions));
router.get("/redemptions/pic/:wallet", readLimiter, asyncHandler(gatewayController.byPic));
router.get("/redemptions/:id", readLimiter, asyncHandler(gatewayController.detailRedemption));
router.get("/stats", readLimiter, asyncHandler(gatewayController.stats));

export default router;
