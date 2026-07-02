import { Worker } from "bullmq";
import type { Worker as WorkerType } from "bullmq";
import { redis } from "../lib/redis";
import { reconciliationQueue } from "../queues/queues";
import * as webhookService from "../services/webhookService";
import { runReconciliation } from "../services/reconciliationService";
import type { DecodedEvent } from "../services/webhookService";

const connection = redis;
let workers: WorkerType[] = [];

export async function startWorkers(): Promise<void> {
    const webhookWorker = new Worker<DecodedEvent>(
        "webhook-ingestion",
        async (job) => webhookService.dispatchEvent(job.data),
        { connection, concurrency: 1 }
    );

    const reconciliationWorker = new Worker(
        "reconciliation",
        async () => runReconciliation(),
        { connection, concurrency: 1}
    );

    for(const w of [webhookWorker, reconciliationWorker]) {
        w.on("failed", (job, err) => console.error(`[WORKER] ${w.name} job ${job?.id} failed:`, err.message));
        w.on("completed", (job) => console.log(`[WORKER] ${w.name} job ${job.id} completed`));
    }

    await reconciliationQueue.upsertJobScheduler(
        "reconciliation-hourly",
        { every: 60 * 60 * 1000 }, 
        { name: "reconcile" }
    );

    console.log("[WORKER] Workers started (webhook-ingestion, reconciliation)");
}

export async function stopWorkers(): Promise<void> {
    await Promise.all(workers.map((w) => w.close()));
    console.log("[WORKER] Workers closed");
}