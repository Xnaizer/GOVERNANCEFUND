import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import { http } from "wagmi";
import { env } from "./env";

export const wagmiConfig = getDefaultConfig({
    appName: "GovernanceFund",
    projectId: env.WC_PROJECT_ID,
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(env.ALCHEMY_RPC)
    },
    ssr: false
});