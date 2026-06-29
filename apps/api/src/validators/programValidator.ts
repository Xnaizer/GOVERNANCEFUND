import { z } from "zod";

const milestoneSchema = z.object({
    title: z.string().min(1, "Milestone title required"),
    description: z.string().optional(),
    milestoneBudget: z.string().regex(/^\d+$/, "milestoneBudget must be numeric (Wei)"),
});

export const createProgramSchema = z.object({
    title: z.string().min(1, "Title required"),
    description: z.string().min(1, "Description required"),
    totalBudget: z.string().regex(/^\d+$/, "totalBudget must be numeric (Wei)"),
    milestoneCount: z.number().int().positive(),
    province: z.string().min(1),
    regency: z.string().min(1),
    district: z.string().optional(),
    locationAddress: z.string().min(1),
    executorName: z.string().min(1),
    executorRegistration: z.string().min(1),
    category: z.string().min(1),
    institutionName: z.string().min(1),
    fiscalYear: z.number().int(),
    plannedStartDate: z.string().datetime().optional(),
    plannedEndDate: z.string().datetime().optional(),
    milestones: z.array(milestoneSchema).min(1, "At least 1 milestone required")
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;