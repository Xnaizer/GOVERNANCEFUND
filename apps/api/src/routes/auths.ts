import express, { type Router } from "express";
import authController from "../controllers/authController";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth";
import { authLimiter, mutationLimiter, readLimiter } from "../middleware/rateLimiter";

const router: Router  = express.Router();

router.post(
    "/register", 
    authLimiter, 
    asyncHandler(authController.register)
);

router.get(
    "/verify-email", 
    authLimiter, 
    asyncHandler(authController.verifyEmail)
);

router.post(
    "/login", 
    authLimiter, 
    asyncHandler(authController.login)
);

router.post(
    "/logout", 
    asyncHandler(authMiddleware), 
    asyncHandler(authController.logout)
);

router.get(
    "/me",
    readLimiter,
    asyncHandler(authMiddleware),
    asyncHandler(authController.me)
);

router.post(
    "/forgot-password",
    authLimiter,
    asyncHandler(authController.forgotPassword)
);

router.post(
    "/reset-password",
    authLimiter,
    asyncHandler(authController.resetPassword)
);

router.patch(
    "/me",
    mutationLimiter,
    asyncHandler(authMiddleware),
    asyncHandler(authController.updateMe)
);


export default router;