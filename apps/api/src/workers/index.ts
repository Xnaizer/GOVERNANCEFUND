import { Worker } from "bullmq";
import type { Worker as WorkerType } from "bullmq";
import * as Sentry from "@sentry/node";
import { redis } from "../lib/redis";
import { logger } from "../lib/logger";
import { reconciliationQueue } from "../queues/queues";
import * as webhookService from "../services/webhookService";
import { runReconciliation } from "../services/reconciliationService";
import type { DecodedEvent } from "../services/webhookService";
import { runRedemptionReconciliation } from "../services/redemptionService";

const connection = redis;

let workers: WorkerType[] = [];

const workerOptions = {
  connection,
  concurrency: 1,
  drainDelay: 60,
  stalledInterval: 300_000,
} as const;

export async function startWorkers(): Promise<void> {
  const webhookWorker = new Worker<DecodedEvent>(
    "webhook-ingestion",
    async (job) => webhookService.dispatchEvent(job.data),
    workerOptions,
  );

  const reconciliationWorker = new Worker(
    "reconciliation",
    async () => {
      await runReconciliation();
      await runRedemptionReconciliation();
    },
    workerOptions,
  );

  workers = [webhookWorker, reconciliationWorker];

  for (const w of workers) {
    w.on("failed", (job, err) => {
      logger.error(
        {
          queue: w.name,
          jobId: job?.id,
          err,
        },
        "Worker job failed",
      );

      Sentry.captureException(err, {
        extra: {
          queue: w.name,
          jobId: job?.id,
          data: job?.data,
        },
      });
    });

    w.on("completed", (job) => {
      logger.info(
        {
          queue: w.name,
          jobId: job.id,
        },
        "Worker job completed",
      );
    });
  }

  await reconciliationQueue.upsertJobScheduler(
    "reconciliation-hourly",
    {
      every: 60 * 60 * 1000,
    },
    {
      name: "reconcile",
    },
  );

  logger.info("[WORKER] Workers started (webhook-ingestion, reconciliation)");
}

export async function stopWorkers(): Promise<void> {
  await Promise.all(workers.map((worker) => worker.close()));
  workers = [];
  logger.info("[WORKER] Workers closed");
}
