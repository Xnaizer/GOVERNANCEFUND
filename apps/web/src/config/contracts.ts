import type { Abi } from "viem";
import { baseSepolia } from "wagmi/chains";
import { CONTRACT_ADDRESS, Web3GovernanceABI, RupiahTokenABI, TrustedGatewayBurnerABI } from "@repo/shared";

export const CHAIN_ID = baseSepolia.id;

export const governanceContract = {
  address: CONTRACT_ADDRESS.web3Governance as `0x${string}`,
  abi: Web3GovernanceABI as Abi,
} as const;

export const rupiahTokenContract = {
  address: CONTRACT_ADDRESS.rupiahToken as `0x${string}`,
  abi: RupiahTokenABI as Abi,
} as const;

export const gatewayContract = {
  address: CONTRACT_ADDRESS.trustedGatewayBurner as `0x${string}`,
  abi: TrustedGatewayBurnerABI as Abi,
} as const;
