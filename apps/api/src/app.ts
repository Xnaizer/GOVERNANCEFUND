import express from "express";
import type { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

const app: Express = express();

app.use(helmet()); // security headers
app.use(cors()); // cross origin
app.use(morgan("dev")); // log every request

app.use(express.json());

app.get("/health", (_req: Request, res: Response): void => {
    res.json({
        data: "ok",
        error: null,
        meta: {}
    });
});

export { app };