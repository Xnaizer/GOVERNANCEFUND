import type { Request, Response } from "express";
import { createProgramSchema } from "../validators/programValidator";
import * as programService from "../services/programService";
import { AppError } from "../utils/AppError";
import response from "../utils/response";

export default {

    // POST /api/v1/programs
    async create(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        const parsed = createProgramSchema.safeParse(req.body);

        if(!parsed.success) {
            throw new AppError(parsed.error.errors[0].message,400)
        }

        const result = await programService.createProgram(user.id, parsed.data);

        response.created(res, result);
    }
}