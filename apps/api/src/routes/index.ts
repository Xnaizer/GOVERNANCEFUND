import express, { type Router } from "express";
import authRouter from "./auths";
import userRouter from "./users";

const router: Router  = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);

export default router;
