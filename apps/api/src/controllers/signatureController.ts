import type { Request, Response } from "express";
import { submitSignatureSchema } from "../validators/signatureValidator";
import * as signatureService from "../services/signatureService";
import { AppError } from "../utils/AppError";
import response from "../utils/response";

export default {

    // POST /api/v1/signatures
    async submit(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        const parsed = submitSignatureSchema.safeParse(req.body);

        if(!parsed.success) {
            throw new AppError(parsed.error.errors[0].message, 400);
        }

        const result = await signatureService.submitSignature(user.id, parsed.data);

        response.created(res, result);
    },

    // GET /api/v1/signatures/:milestoneId
    async list(req: Request, res: Response): Promise<void> {
        const milestoneId = req.params.milestoneId;

        if(!milestoneId) {
            throw new AppError("milestoneId is required", 400);
        }

        const result = await signatureService.getSignatures(milestoneId);

        response.success(res, result);
    }



}