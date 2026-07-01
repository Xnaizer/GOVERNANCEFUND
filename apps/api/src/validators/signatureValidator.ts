import { z } from "zod";

export const submitSignatureSchema = z.object({
    milestoneId: z.string().min(1, "Milestone Id is required"),
    milestoneIndex: z.number().int().nonnegative(),
    milestoneBudget: z.string().regex(/^\d+$/, "milestoneBudget must be a wei string"),
    evidenceHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/, "evidenceHash must be 32-byte hex"),
    signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/, "Invalid signature format"),
    signerRole: z.enum(["ADMIN","VALIDATOR","AUDITOR"])
});

export type SubmitSignatureInput = z.infer<typeof submitSignatureSchema>;

