import type { Request, Response } from "express";
import { listProgramsQuerySchema } from "../validators/programValidator";
import * as programService from "../services/programService";
import { AppError } from "../utils/AppError";
import response from "../utils/response";

export default {

    // GET /api/v1/public/programs 
    async listPrograms(req: Request, res: Response): Promise<void> {
        const parsed = listProgramsQuerySchema.safeParse(req.query);

        if(!parsed.success) {
            throw new AppError(parsed.error.errors[0].message, 400);
        }

        const result = await programService.listPrograms(parsed.data);

        response.success(res, result.programs, {
            pagination: result.pagination
        });
    },

    // GET /api/v1/public/programs/:id
    async detailProgram(req: Request, res: Response): Promise<void> {
        const programId = Number(req.params.id);

        if(!Number.isInteger(programId) || programId < 1) {
            throw new AppError("Invalid program id", 400);
        }

        const program = await programService.getProgramById(programId);

        response.success(res, program);
    },

    // GET /api/v1/public/stats
    async stats(_req: Request, res: Response): Promise<void> {
        const stats = await programService.getPublicStats();

        response.success(res, stats);
    }
}