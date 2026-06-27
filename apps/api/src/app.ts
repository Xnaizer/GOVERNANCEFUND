import express from "express";
import type { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import response from "./utils/response";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

const app: Express = express();

app.use(helmet()); // security headers
app.use(cors()); // cross origin
app.use(morgan("dev")); // log every request

app.use(express.json());

app.get("/health", (_req: Request, res: Response): void => {
    response.success(res, "ok");
});

app.use(notFoundHandler);
app.use(errorHandler);

export { app };