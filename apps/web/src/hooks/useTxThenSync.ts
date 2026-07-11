import { useState } from "react";
import { useWriteContract, usePublicClient } from "wagmi";
import { pollUntil } from "../utils/poll";
import { getErrorMessage } from "../utils/error";
import { useWalletGuard } from "./useWalletGuard";

export type TxSyncState = "idle" | "wallet" | "mining" | "syncing" | "success" | "error";

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

  async function execute(request: Parameters<typeof writeContractAsync>[0]): Promise<`0x${string}`> {
    setError(null);
    setSyncPending(false);
    try {
      // Preflight: wallet connect + alamat sesuai bound + jaringan Base Sepolia (auto-switch).
      await guard.ensureReady();

      setState("wallet");                                   // tunggu tanda tangan MetaMask
      const hash = await writeContractAsync(request);

      setState("mining");                                   // tunggu tx masuk block
      await publicClient!.waitForTransactionReceipt({ hash });

      if (opts.waitForSync) {
        setState("syncing");                                // tunggu webhook → backend
        const ok = await pollUntil(opts.waitForSync, { timeoutMs: opts.syncTimeoutMs ?? 90_000 });
        // Tx SUDAH sukses on-chain. Bila webhook belum masuk (umum di dev), JANGAN dianggap gagal —
        // tandai sinkronisasi tertunda saja.
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
  return { execute, state, error, busy, syncPending, reset: () => { setState("idle"); setError(null); setSyncPending(false); } };
}
