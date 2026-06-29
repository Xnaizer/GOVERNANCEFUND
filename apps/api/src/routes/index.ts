import express, { type Router } from "express";
import authRouter from "./auths";
import userRouter from "./users";
import programRouter from "./programs";

const router: Router  = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/programs", programRouter);

export default router;
