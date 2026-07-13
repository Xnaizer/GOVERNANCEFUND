import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";

export function webhookVerify(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const signature = req.headers["x-alchemy-signature"];

  if (typeof signature !== "string") {
    throw new AppError("Missing webhook signature", 401);
  }

  const rawBody = req.body as Buffer;

  if (!Buffer.isBuffer(rawBody)) {
    throw new AppError("Invalid webhook body", 400);
  }

  const computed = crypto
    .createHmac("sha256", env.ALCHEMY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "hex");
  const computedBuffer = Buffer.from(computed, "hex");

  if (
    sigBuffer.length !== computedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, computedBuffer)
  ) {
    throw new AppError("Invalid webhook signature", 401);
  }

  next();
}
