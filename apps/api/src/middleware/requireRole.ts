import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function requireRole(roles: string[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const role = req.user?.role;

        if(!role || !roles.includes(role)) {
            throw new AppError("Forbidden: insufficient role", 403);
        }

        next();
    }
}