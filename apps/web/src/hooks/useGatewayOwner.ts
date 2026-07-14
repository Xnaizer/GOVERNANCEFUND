import { useAccount, useReadContract } from "wagmi";
import { gatewayContract, CHAIN_ID } from "../config/contracts";

export function useGatewayOwner() {
  const { address } = useAccount();
  const ownerQ = useReadContract({
    ...gatewayContract,
    chainId: CHAIN_ID,
    functionName: "gatewayOwner",
  });

  const owner = (ownerQ.data as string | undefined) ?? null;
  const isOperator =
    !!owner && !!address && owner.toLowerCase() === address.toLowerCase();

  return { owner, isOperator, isLoading: ownerQ.isLoading };
}
