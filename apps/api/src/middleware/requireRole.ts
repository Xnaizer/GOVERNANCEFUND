import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { Role } from "@repo/database";

export function requireRole(roles: Role[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const role = req.user?.role;

        if(!role || !roles.includes(role as Role)) {
            throw new AppError("Forbidden: insufficient role", 403);
        }

        next();
    }
}