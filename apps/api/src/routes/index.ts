import express, { type Router } from "express";
import authRouter from "./auths";
import userRouter from "./users";
import programRouter from "./programs";
import publicRouter from "./public";
import signatureRouter from "./signatures";

const router: Router  = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/programs", programRouter);
router.use("/public", publicRouter);
router.use("/signatures", signatureRouter);

export default router;
