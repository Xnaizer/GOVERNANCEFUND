import { z } from "zod";

export const bindWalletSchema = z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    signature: z.string().regex(/^0x[a-fA-F0-9]+$/, "Invalid signature format")
});

export type BindWalletInput = z.infer<typeof bindWalletSchema>;