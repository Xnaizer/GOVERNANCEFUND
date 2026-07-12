import type { Request, Response } from "express";
import * as userService from "../services/userService";
import { listUserQuerySchema , verifyUserSchema } from "../validators/userValidator";
import { AppError } from "../utils/AppError";
import response from "../utils/response";

export default {

    // GET /api/v1/users
    async list(req: Request, res: Response): Promise<void> {
        const parsed = listUserQuerySchema.safeParse(req.query);

        if(!parsed.success) {
            throw new AppError(parsed.error.errors[0].message, 400);
        }

        const result = await userService.listUsers(parsed.data);

        response.success(res, result);
    },

    // GET /api/v1/users/:id  (ADMIN) — detail identitas lengkap untuk verifikasi
    async detail(req: Request, res: Response): Promise<void> {
        const result = await userService.getAdminUserDetail(req.params.id);

        response.success(res, result);
    },

    // PATCH /api/v1/users/:id/verify
    async verify(req: Request, res: Response): Promise<void> {
        const parsed = verifyUserSchema.safeParse(req.body); 

        if (!parsed.success) {
            throw new AppError(parsed.error.errors[0].message, 400);
        }

        const result = await userService.setVerified(req.params.id, parsed.data.isVerified );

        response.success(res, result);
    }
}