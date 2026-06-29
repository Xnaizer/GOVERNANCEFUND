import { publicClient } from "../lib/viem";
import { Web3GovernanceABI, CONTRACT_ADDRESS } from "@repo/shared";

export async function getValidatorCount(): Promise<number> {
    const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS.web3Governance as `0x${string}`,
        abi: Web3GovernanceABI,
        functionName: "totalValidatorsCount"
    });

    return Number(result);
}