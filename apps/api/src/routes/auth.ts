import express, {type Router} from "express";
import authController from "../controllers/authController";
import { asyncHandler } from "../utils/asyncHandler";

const router: Router  = express.Router();

router.post("/register", asyncHandler(authController.register));
router.get('/verify-email', asyncHandler(authController.verifyEmail));

export default router;