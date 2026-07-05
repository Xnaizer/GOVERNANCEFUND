import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardBody, CardHeader, Chip } from "@heroui/react";
import { api } from "../lib/api";
import { env } from "../config/env";

type Health = { db: boolean; redis: boolean };

export function Landing() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/health", { baseURL: env.API_URL }) // /health di luar /api/v1
      .then((res) => setHealth(res.data.meta as Health))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-6xl font-bold bg-linear-to-br from-brand-mint to-brand-blue bg-clip-text text-transparent">
        GovernanceFund
      </h1>

      <ConnectButton />

      <Card className="w-full max-w-md">
        <CardHeader className="font-semibold">Backend Health</CardHeader>
        <CardBody className="flex flex-row gap-3">
          {error && <Chip color="danger">API error</Chip>}
          {!error && !health && <Chip color="warning">checking…</Chip>}
          {health && (
            <>
              <Chip color={health.db ? "success" : "danger"}>db: {String(health.db)}</Chip>
              <Chip color={health.redis ? "success" : "danger"}>redis: {String(health.redis)}</Chip>
            </>
          )}
        </CardBody>
      </Card>
    </main>
  );
}
