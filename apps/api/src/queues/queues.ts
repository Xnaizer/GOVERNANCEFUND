import { Queue } from "bullmq";
import { redis } from "../lib/redis";
import type { DecodedEvent } from "../services/webhookService";

const connection = redis;

const defaultJobOptions = {
    attempts: 3,
    backoff: { type: "exponential" as const, delay: 3000 },
    // Bersihkan job selesai lebih agresif → kurangi hash sisa di Redis.
    removeOnComplete: { age: 3600, count: 50 },
    removeOnFail: 1000,
};

export const webhookIngestionQueue = new Queue<DecodedEvent>("webhook-ingestion", {
    connection,
    defaultJobOptions,
});

export const reconciliationQueue = new Queue("reconciliation", {
    connection,
    defaultJobOptions: { attempts: 1, removeOnComplete: 50, removeOnFail: 50 },
});

export const allQueues = [webhookIngestionQueue, reconciliationQueue];