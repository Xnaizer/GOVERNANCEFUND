import type { Request, Response } from "express";
import { registerSchema } from "../validators/authValidator";
import * as authService from "../services/authService";
import { AppError } from "../utils/AppError";
import response from "../utils/response";

export default {

    // POST /api/v1/auth/register
    async register(req: Request, res: Response): Promise<void> {
        const parsed = registerSchema.safeParse(req.body);

        if(!parsed.success) {
            throw new AppError(parsed.error.errors[0].message, 400);
        }

        await authService.registerUser(parsed.data);

        response.created(res, "Registration successfull. Check your email to verify.");
    },

    // GET /api/v1/auth/verify-email?token=xxx
    async verifyEmail(req: Request, res: Response): Promise<void> {
        const token = req.query.token;

        if(typeof token !== "string" || !token) {
            throw new AppError("Verification token is required", 400);
        }

        await authService.verifyEmail(token);

        response.success(res, "Email verified successfully. You can now log in.")
    },
}