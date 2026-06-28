import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../validators/authValidator";
import * as authService from "../services/authService";
import { AppError } from "../utils/AppError";
import response from "../utils/response";
import jwt from "jsonwebtoken";

export default {

    // POST /api/v1/auth/register
    async register(req: Request, res: Response): Promise<void> {
        const parsed = registerSchema.safeParse(req.body);

        if(!parsed.success) {
            throw new AppError(parsed.error.errors[0].message, 400);
        }

        await authService.registerUser(parsed.data);

        response.created(res, "Registration successful. Check your email to verify.");
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

    // POST /api/v1/auth/login
    async login(req: Request, res: Response): Promise<void> {
        const parsed = loginSchema.safeParse(req.body);

        if(!parsed.success) {
            throw new AppError(parsed.error.errors[0].message, 400);
        }

        const result = await authService.loginUser(parsed.data);

        response.success(res, result);
    },

    // POST /api/v1/auth/logout
    async logout(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        const token = req.headers.authorization!.substring(7);
        const decoded = jwt.decode(token) as { exp: number };

        await authService.logoutUser(user.jti, decoded.exp);

        response.success(res, "Logged out successfully");
    },

    // GET /api/v1/auth/me
    async me(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        const profile = await authService.getMe(user.id);

        response.success(res,profile);
    }
}