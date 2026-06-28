import { error } from "console";
import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        data: null,
        error: "Too many requests, try again later",
        meta: {}
    }
});