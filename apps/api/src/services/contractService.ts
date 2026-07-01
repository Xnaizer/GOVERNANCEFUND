import { cacheAside } from "../lib/cache";
import { publicClient } from "../lib/viem";
import { Web3GovernanceABI, CONTRACT_ADDRESS } from "@repo/shared";

export async function getValidatorCount(): Promise<number> {
    return cacheAside(
        "onchain:validatorCount",
        30,
        async () => {
            const result = await publicClient.readContract({
                address: CONTRACT_ADDRESS.web3Governance as `0x${string}`,
                abi: Web3GovernanceABI,
                functionName: "totalValidatorsCount"
            });

            return Number(result);
        }
    );
}

export async function hasRole(account: string, roleHash: `0x${string}`): Promise<boolean> {
   const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS.web3Governance as `0x${string}`,
        abi: Web3GovernanceABI,
        functionName: "hasRole",
        args: [roleHash, account as `0x${string}`]
   });

   return Boolean(result);
}