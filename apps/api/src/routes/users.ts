import express, { type Router } from 'express';
import walletController from '../controllers/walletController';
import { authMiddleware } from '../middleware/auth';
import { readLimiter, mutationLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';
import userController from '../controllers/userController';
import { requireRole } from '../middleware/requireRole';

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

router.get(
    "/",
    readLimiter,
    asyncHandler(authMiddleware),
    requireRole(["ADMIN"]),
    asyncHandler(userController.list)
);

router.get(
    "/:id",
    readLimiter,
    asyncHandler(authMiddleware),
    requireRole(["ADMIN"]),
    asyncHandler(userController.detail)
);

router.patch(
    "/:id/verify",
    mutationLimiter,
    asyncHandler(authMiddleware),
    requireRole(["ADMIN"]),
    asyncHandler(userController.verify)
);

export default router;