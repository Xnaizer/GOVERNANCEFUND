import { prisma } from "../lib/prisma";
import { hashPassword, generateToken, hashToken } from "./hashService";
import { sendTemplateEmail } from "../lib/mailer";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";
import type { RegisterInput } from "../validators/authValidator";

export async function registerUser(input: RegisterInput) : Promise<void> {
    const email = input.email.toLowerCase().trim();

    const existing = await prisma.user.findFirst({
        where: {
            OR: [
                {
                    email
                },
                {
                    username: input.username
                }
            ]
        }
    });

    if (existing) {
        throw new AppError("Email or username already registered", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                username: input.username,
                email,
                passwordHash,
                isActive: false,
                role: "USER"
            }
        });

        await tx.verificationToken.create({
            data:{
                tokenHash,
                type: "ACTIVATION",
                expiresAt,
                userId: user.id
            }
        });
    });

    const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${rawToken}`;

    await sendTemplateEmail({
        to: email,
        subject: "Verify your GovernanceFund account",
        template: "verify-email",
        data: {
            username: input.username,
            verifyUrl,
            year: new Date().getFullYear()
        }
    });
}

export async function verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);

    const record = await prisma.verificationToken.findUnique({
        where: {
            tokenHash
        }
    });

    if(!record || record.type !== "ACTIVATION") {
        throw new AppError("Invalid verification token", 400);
    }

    if(record.expiresAt < new Date()) {
        throw new AppError("Verification token has expired", 400);
    }

    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: {
                id: record.userId
            },
            data: {
                isActive: true
            }
        });

        await tx.verificationToken.delete({
            where: {
                id: record.id
            }
        });
    })

}