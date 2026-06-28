import express, {type Router} from "express";
import authController from "../controllers/authController";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware } from "../middleware/auth";

const router: Router  = express.Router();

router.post("/register", asyncHandler(authController.register));
router.get("/verify-email", asyncHandler(authController.verifyEmail));
router.post("/login", asyncHandler(authController.login));
router.post(
    "/logout", 
    asyncHandler(authMiddleware), 
    asyncHandler(authController.logout)
);
router.get(
    "/me",
    asyncHandler(authMiddleware),
    asyncHandler(authController.me)
);

export default router;