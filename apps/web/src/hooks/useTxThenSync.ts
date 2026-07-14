import { useState } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import { pollUntil } from "../utils/poll";
import { getErrorMessage } from "../utils/error";
import { useWalletGuard } from "./useWalletGuard";

export type TxSyncState =
  | "idle"
  | "wallet"
  | "mining"
  | "syncing"
  | "success"
  | "error";

interface Options {
  waitForSync?: () => Promise<boolean>;
  syncTimeoutMs?: number;
  onDone?: () => void;
}

export function useTxThenSync(opts: Options = {}) {
  const [state, setState] = useState<TxSyncState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [syncPending, setSyncPending] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const guard = useWalletGuard();

  async function execute(
    request: Parameters<typeof writeContractAsync>[0],
  ): Promise<`0x${string}`> {
    setError(null);
    setSyncPending(false);
    try {
      await guard.ensureReady();

      setState("wallet");
      const hash = await writeContractAsync(request);

      setState("mining");
      await publicClient!.waitForTransactionReceipt({ hash });

      if (opts.waitForSync) {
        setState("syncing");
        const ok = await pollUntil(opts.waitForSync, {
          timeoutMs: opts.syncTimeoutMs ?? 90_000,
        });

        if (!ok) setSyncPending(true);
      }

      setState("success");
      opts.onDone?.();
      return hash;
    } catch (e) {
      setError(getErrorMessage(e));
      setState("error");
      throw e;
    }
  }

  const busy = state === "wallet" || state === "mining" || state === "syncing";
  return {
    execute,
    state,
    error,
    busy,
    syncPending,
    reset: () => {
      setState("idle");
      setError(null);
      setSyncPending(false);
    },
  };
}
