import { z } from "zod";
import { plainText, plainTextRequired } from "./common";

export const freezeEvidenceSchema = z.object({
    reason: plainTextRequired(200),
    description: plainText(2000).optional(),
    evidenceUrl: z.string().url().max(500).optional(),
});

export type FreezeEvidenceInput = z.infer<typeof freezeEvidenceSchema>;
