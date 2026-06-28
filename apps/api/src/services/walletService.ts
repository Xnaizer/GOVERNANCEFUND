import { randomBytes } from "node:crypto";
import { recoverMessageAddress } from "viem";
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";
import { AppError } from "../utils/AppError";

const NONCE_TTL_SECONDS = 5 * 60;

function buildSignMessage(nonce: string): string {
    return `GovernanceFund wants you to bind this wallet. \n\nNonce: ${nonce}`;
}

export async function generateNonce(userId: string): Promise<{ nonce: string; message: string; }> {
    const nonce = randomBytes(16).toString("hex");

    await redis.set(`nonce:${userId}`, nonce, "EX", NONCE_TTL_SECONDS);

    return { nonce, message: buildSignMessage(nonce) };
}

export async function bindWallet(
    userId: string,
    walletAddress: string,
    signature: string
): Promise<{ walletAddress: string }> {
    const nonce = await redis.get(`nonce:${userId}`);

    if(!nonce) {
        throw new AppError("Nonce expired or not found. Request a new one.", 400);
    }

    const message = buildSignMessage(nonce);

    let recovered: string;

    try {
        recovered = await recoverMessageAddress({
            message,
            signature: signature as `0x${string}`,
        });
    } catch {
        throw new AppError("Invalid signature format", 400);
    }

    const claimed = walletAddress.toLowerCase();

    if(recovered.toLowerCase() !== claimed) {
        throw new AppError("Signature does not match the wallet address", 401);
    }

    const user = await prisma.user.findUnique({ 
        where: { id: userId }
    });

    if(!user) {
        throw new AppError("User not found", 404);
    }

    if(user.walletAddress && user.role !== "USER") {
        throw new AppError("Wallet is locked: cannot rebind after assuming a role", 403);
    }

    const existing = await prisma.user.findUnique({
        where: {
            walletAddress: claimed
        }
    });

    if(existing && existing.id !== userId) {
        throw new AppError("This wallet is already bound to another account", 409);
    }

    await prisma.user.update({
        where: { 
            id: userId 
        },
        data: {
            walletAddress: claimed
        }
    });

    await redis.del(`nonce:${userId}`);

    return { walletAddress: claimed };
}