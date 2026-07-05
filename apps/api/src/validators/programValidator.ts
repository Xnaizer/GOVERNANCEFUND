import { z } from "zod";
import { plainTextRequired, plainText } from "./common";

const milestoneSchema = z.object({
    title: plainTextRequired(200),
    description: plainText(2000).optional(),
    milestoneBudget: z.string().regex(/^\d+$/, "milestoneBudget must be numeric (Wei)"),
});

export const createProgramSchema = z.object({
    title: plainTextRequired(200),
    description: plainTextRequired(2000),
    totalBudget: z.string().regex(/^\d+$/, "totalBudget must be numeric (Wei)"),
    milestoneCount: z.number().int().positive(),
    province: plainTextRequired(100),
    regency: plainTextRequired(100),
    district: plainText(100).optional(),
    locationAddress: plainTextRequired(300),
    executorName: plainTextRequired(200),
    executorRegistration: plainTextRequired(100),
    category: plainTextRequired(100),
    institutionName: plainTextRequired(200),
    fiscalYear: z.number().int(),
    plannedStartDate: z.string().datetime().optional(),
    plannedEndDate: z.string().datetime().optional(),
    milestones: z.array(milestoneSchema).min(1, "At least 1 milestone required"),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;

export const listProgramsQuerySchema = z.object({
    tab: z.enum(["ACTIVE", "FINISHED", "FLAGGED", "FRAUD"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10)
});

export type ListProgramQuery = z.infer<typeof listProgramsQuerySchema>;