import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import { http } from "wagmi";
import { env } from "./env";

// VITE_ALCHEMY_RPC HARUS berupa URL absolut (https://…). Bila belum diisi / masih placeholder
// (mis. "<Alchemy Base Sepolia RPC URL>"), viem menganggapnya URL relatif → semua panggilan RPC
// jatuh ke origin app (localhost:3000/…) → 404 terus-menerus & seluruh aksi on-chain gagal.
// Guard: pakai env hanya jika absolut; jika tidak, fallback ke RPC publik Base Sepolia.
const isAbsoluteUrl = /^https?:\/\//i.test(env.ALCHEMY_RPC ?? "");
if (!isAbsoluteUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    "[wagmi] VITE_ALCHEMY_RPC tidak valid/absolut — memakai RPC publik Base Sepolia (rate-limited). " +
      "Set VITE_ALCHEMY_RPC ke URL Alchemy asli untuk keandalan.",
  );
}
const rpcUrl = isAbsoluteUrl ? env.ALCHEMY_RPC : undefined; // undefined → viem pakai RPC default chain

export const wagmiConfig = getDefaultConfig({
    appName: "GovernanceFund",
    projectId: env.WC_PROJECT_ID,
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http(rpcUrl)
    },
    ssr: false
});
