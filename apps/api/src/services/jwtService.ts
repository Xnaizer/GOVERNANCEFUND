import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "../config/env";

export interface JwtPayload {
    sub: string;
    role: string;
    jti: string;
    iat?: number; 
}

export interface JwtResponse {
    token: string;
    jti: string;
}

export function signToken(userId: string, role: string): JwtResponse {
    const jti = uuidv4();

    const token = jwt.sign(
        {
            sub: userId,
            role,
            jti
        }, 
        env.JWT_SECRET,
        {
            expiresIn: env.JWT_EXPIRES_IN
        } as jwt.SignOptions 
    );

    return { token, jti };
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}