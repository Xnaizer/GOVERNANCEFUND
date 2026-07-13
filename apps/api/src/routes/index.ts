import express, { type Router } from "express";
import authRouter from "./auths";
import userRouter from "./users";
import programRouter from "./programs";
import publicRouter from "./public";
import signatureRouter from "./signatures";
import uploadRouter from "./uploads";
import gatewayRouter from "./gateway";

const router: Router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/programs", programRouter);
router.use("/public", publicRouter);
router.use("/signatures", signatureRouter);
router.use("/uploads", uploadRouter);
router.use("/gateway", gatewayRouter);

export default router;
