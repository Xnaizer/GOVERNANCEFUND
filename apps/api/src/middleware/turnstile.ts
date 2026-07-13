import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { logger } from "../lib/logger";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface SiteVerifyResponse {
    success: boolean;
    "error-codes"?: string[];
}

export async function verifyTurnstile(req: Request, _res: Response, next: NextFunction): Promise<void> {

    if (env.NODE_ENV !== "production") {
        return next();
    }

    const secret = env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        throw new AppError("Bot verification is not configured", 500);
    }

    const token = typeof req.body?.turnstileToken === "string" ? req.body.turnstileToken : "";

    if (!token) {
        throw new AppError("Verifikasi bot diperlukan. Muat ulang halaman dan coba lagi.", 400);
    }

    let data: SiteVerifyResponse;

    try {
        const resp = await fetch(SITEVERIFY_URL, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ secret, response: token, remoteip: req.ip }),
        });
        data = (await resp.json()) as SiteVerifyResponse;
    } catch (err) {
        logger.error({ err }, "Turnstile siteverify request failed");
        throw new AppError("Gagal memverifikasi. Coba lagi sesaat.", 503);
    }

    if (!data.success) {
        logger.warn({ codes: data["error-codes"] }, "Turnstile verification rejected");
        throw new AppError("Verifikasi bot gagal. Muat ulang halaman dan coba lagi.", 403);
    }

    next();
}
