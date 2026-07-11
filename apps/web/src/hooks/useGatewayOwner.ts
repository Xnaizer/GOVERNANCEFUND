import { useAccount, useReadContract } from "wagmi";
import { gatewayContract, CHAIN_ID } from "../config/contracts";

/**
 * Baca `gatewayOwner` on-chain lalu bandingkan dengan wallet terhubung.
 * `isOperator` = wallet yang connect adalah operator bank (satu-satunya yang boleh
 * confirmRedemption / cancelRedemption).
 */
export function useGatewayOwner() {
  const { address } = useAccount();
  const ownerQ = useReadContract({
    ...gatewayContract,
    chainId: CHAIN_ID,
    functionName: "gatewayOwner",
  });

  const owner = (ownerQ.data as string | undefined) ?? null;
  const isOperator = !!owner && !!address && owner.toLowerCase() === address.toLowerCase();

  return { owner, isOperator, isLoading: ownerQ.isLoading };
}
