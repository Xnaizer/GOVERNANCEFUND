import { useCallback, useEffect, useState } from "react";
import { parseAbiItem } from "viem";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { rupiahTokenContract, gatewayContract, CHAIN_ID } from "../config/contracts";
import { getErrorMessage } from "../utils/error";
import { useWalletGuard } from "./useWalletGuard";

type RedeemState = "idle" | "approving" | "requesting" | "reclaiming" | "success" | "error";

export const REDEMPTION_STATUS = ["NONE", "PENDING", "SETTLED", "CANCELLED"] as const;
export type RedemptionStatus = (typeof REDEMPTION_STATUS)[number];

export interface RedemptionInfo {
  id: bigint;
  amount: bigint;
  createdAt: bigint;      // unix seconds
  status: RedemptionStatus;
  canReclaim: boolean;    // PENDING && lewat RECLAIM_TIMEOUT
}

const REQUESTED_EVENT = parseAbiItem(
  "event RedemptionRequested(uint256 indexed id, address indexed pic, uint256 amount)",
);

/**
 * PIC redeem = two-phase (DvP):
 *  1. requestRedemption → approve (bila perlu) + titipkan token ke gateway (escrow, belum burn)
 *  2. operator bank confirmRedemption → burn + cairkan fiat (di luar FE)
 *  3. reclaim → PIC tarik kembali escrow bila operator tak kunjung settle (setelah timeout)
 */
export function useRedeemToken() {
  const { address } = useAccount();
  const guard = useWalletGuard();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [state, setState] = useState<RedeemState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<RedemptionInfo[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const balanceQ = useReadContract({
    ...rupiahTokenContract, chainId: CHAIN_ID, functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const balance = (balanceQ.data as bigint | undefined) ?? 0n;

  const allowanceQ = useReadContract({
    ...rupiahTokenContract, chainId: CHAIN_ID, functionName: "allowance",
    args: address ? [address, gatewayContract.address] : undefined,
    query: { enabled: !!address },
  });
  const allowance = (allowanceQ.data as bigint | undefined) ?? 0n;

  const timeoutQ = useReadContract({
    ...gatewayContract, chainId: CHAIN_ID, functionName: "RECLAIM_TIMEOUT",
  });
  const reclaimTimeout = (timeoutQ.data as bigint | undefined) ?? 604800n; // 7 hari fallback

  /** Muat daftar permintaan redemption PIC dari log on-chain + status terkini. */
  const loadRequests = useCallback(async () => {
    if (!address || !publicClient) return;
    setLoadingRequests(true);
    try {
      const logs = await publicClient.getLogs({
        address: gatewayContract.address,
        event: REQUESTED_EVENT,
        args: { pic: address },
        fromBlock: 0n,
      });
      const ids = [...new Set(logs.map((l) => l.args.id as bigint))];
      const now = BigInt(Math.floor(Date.now() / 1000));

      const infos = await Promise.all(ids.map(async (id) => {
        const r = (await publicClient.readContract({
          ...gatewayContract, functionName: "getRedemption", args: [id],
        })) as { pic: string; amount: bigint; createdAt: bigint; status: number };
        const status = REDEMPTION_STATUS[r.status] ?? "NONE";
        return {
          id,
          amount: r.amount,
          createdAt: r.createdAt,
          status,
          canReclaim: status === "PENDING" && now >= r.createdAt + reclaimTimeout,
        } satisfies RedemptionInfo;
      }));

      infos.sort((a, b) => Number(b.id - a.id));
      setRequests(infos);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoadingRequests(false);
    }
  }, [address, publicClient, reclaimTimeout]);

  useEffect(() => { void loadRequests(); }, [loadRequests]);

  /** Phase 1 — approve (bila allowance kurang) lalu titipkan token ke gateway (escrow). */
  async function requestRedemption(amount: bigint) {
    setError(null);
    try {
      await guard.ensureReady();
      if (allowance < amount) {
        setState("approving");
        const ha = await writeContractAsync({
          ...rupiahTokenContract, chainId: CHAIN_ID,
          functionName: "approve", args: [gatewayContract.address, amount],
        });
        await publicClient!.waitForTransactionReceipt({ hash: ha });
        await allowanceQ.refetch();
      }
      setState("requesting");
      const h = await writeContractAsync({
        ...gatewayContract, chainId: CHAIN_ID,
        functionName: "requestRedemption", args: [amount],
      });
      await publicClient!.waitForTransactionReceipt({ hash: h });
      setState("success");
      await Promise.all([balanceQ.refetch(), allowanceQ.refetch(), loadRequests()]);
      return h;
    } catch (e) {
      setError(getErrorMessage(e));
      setState("error");
      throw e;
    }
  }

  /** Escape hatch — tarik kembali escrow (hanya bila PENDING & lewat timeout). */
  async function reclaim(id: bigint) {
    setError(null);
    try {
      await guard.ensureReady();
      setState("reclaiming");
      const h = await writeContractAsync({
        ...gatewayContract, chainId: CHAIN_ID,
        functionName: "cancelRedemption", args: [id],
      });
      await publicClient!.waitForTransactionReceipt({ hash: h });
      setState("success");
      await Promise.all([balanceQ.refetch(), loadRequests()]);
      return h;
    } catch (e) {
      setError(getErrorMessage(e));
      setState("error");
      throw e;
    }
  }

  const busy = state === "approving" || state === "requesting" || state === "reclaiming";
  return {
    requestRedemption, reclaim,
    balance, allowance, reclaimTimeout,
    requests, loadingRequests, loadRequests,
    refetch: () => { balanceQ.refetch(); allowanceQ.refetch(); loadRequests(); },
    state, error, busy,
  };
}
