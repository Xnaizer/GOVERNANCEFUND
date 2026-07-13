import { createPublicClient, http, type PublicClient } from "viem";
import { baseSepolia } from "viem/chains";
import { env } from "../config/env";

export const publicClient: PublicClient<
  ReturnType<typeof http>,
  typeof baseSepolia
> = createPublicClient({
  chain: baseSepolia,
  transport: http(env.ALCHEMY_BASE_SEPOLIA_RPC_URL),
});
