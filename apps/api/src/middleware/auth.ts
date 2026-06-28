import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/jwtService";
import { redis } from "../lib/redis";
import { AppError } from "../utils/AppError";

export async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Authentication required", 401);
    }

    const token = authHeader.substring(7);

    let payload;

    try {
        payload = verifyToken(token);
    } catch {
        throw new AppError("Invalid or expired token", 401);
    }

    const isBlocked = await redis.get(`blocklist:${payload.jti}`);

    if(isBlocked) {
        throw new AppError("Token has been revoked", 401);
    }

    req.user = {
        id: payload.sub,
        role: payload.role,
        jti: payload.jti
    };

    next();
}