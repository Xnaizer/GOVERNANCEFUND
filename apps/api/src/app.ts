import express from "express";
import type { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import response from "./utils/response";
import { notFoundHandler } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import apiRouter from "./routes";
import webhookRouter from "./routes/webhook";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { allQueues } from "./queues/queues";
import { env } from "./config/env";

const app: Express = express();

app.use(helmet()); // security headers
app.use(cors()); // cross origin
app.use(morgan("dev")); // log every request

app.use(
    "/webhook",
    express.raw({ 
        type: "application/json",
        limit: "5mb" 
    }),
    webhookRouter
);

app.use(express.json());

app.get("/health", (_req: Request, res: Response): void => {
    response.success(res, "ok");
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");
createBullBoard({
    queues: allQueues.map((q) => new BullMQAdapter(q)),
    serverAdapter
});

function queueAuth(req: Request, res: Response, next: express.NextFunction): void {
    const header = req.headers.authorization ?? "";
    const [, b64] = header.split(" ");
    const [user, pass] = Buffer.from(b64 ?? "", "base64").toString().split(":");
    if (user === env.QUEUE_ADMIN_USER && pass === env.QUEUE_ADMIN_PASS) return next();
    res.set("WWW-Authenticate", 'Basic realm="queues"').status(401).send("Auth required");
}

app.use("/admin/queues", queueAuth, serverAdapter.getRouter());

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };