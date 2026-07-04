import * as Sentry from "@sentry/node";
import { env } from "./config/env";

Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    enabled: Boolean(env.SENTRY_DSN),
    tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 0
});