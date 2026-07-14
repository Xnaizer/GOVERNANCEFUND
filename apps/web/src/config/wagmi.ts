import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import { http } from "wagmi";
import { env } from "./env";

const isAbsoluteUrl = /^https?:\/\//i.test(env.ALCHEMY_RPC ?? "");
if (!isAbsoluteUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    "[wagmi] VITE_ALCHEMY_RPC tidak valid/absolut — memakai RPC publik Base Sepolia (rate-limited). " +
      "Set VITE_ALCHEMY_RPC ke URL Alchemy asli untuk keandalan.",
  );
}
const rpcUrl = isAbsoluteUrl ? env.ALCHEMY_RPC : undefined;

export const wagmiConfig = getDefaultConfig({
  appName: "GovernanceFund",
  projectId: env.WC_PROJECT_ID,
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(rpcUrl),
  },
  ssr: false,
});
