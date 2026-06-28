import express, { type Router } from 'express';
import walletController from '../controllers/walletController';
import { authMiddleware } from '../middleware/auth';
import { readLimiter, mutationLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';

const router: Router  = express.Router();

router.get(
    "/wallet/nonce",
    readLimiter,
    asyncHandler(authMiddleware),
    asyncHandler(walletController.getNonce)
);

router.post(
    "/wallet/bind",
    mutationLimiter,
    asyncHandler(authMiddleware),
    asyncHandler(walletController.bind)
);

export default router;