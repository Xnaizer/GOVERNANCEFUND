import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { failure } from "../utils/envelope";
import { env } from "../config/env";

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if(err instanceof AppError) {
        res.status(err.statusCode).json(failure(err.message));
        return;
    }

    console.error("[UNHANDLED ERROR]: ", err);

    const message = env.NODE_ENV === "development" ? err.message : "Internal server error";

    res.status(500).json(failure(message));
}