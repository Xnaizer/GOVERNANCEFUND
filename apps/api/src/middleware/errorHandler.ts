import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import response from "../utils/response";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import { MulterError } from "multer";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    response.error(res, err.message, err.statusCode);
    return;
  }

  if (err instanceof MulterError) {
    const msg =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large (max exceeded)"
        : err.message;
    response.error(res, msg, 400);
    return;
  }

  logger.error({ err }, "[UNHANDLED ERROR]");

  const message =
    env.NODE_ENV === "development" ? err.message : "Internal server error";

  response.error(res, message, 500);
}
