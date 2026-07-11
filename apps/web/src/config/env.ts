function required(key: string, value: string | undefined): string {
  if (!value) throw new Error(`[env] Missing ${key}`);
  return value;
}

export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  CHAIN_ID: Number(import.meta.env.VITE_CHAIN_ID ?? 84532),
  WC_PROJECT_ID: required("VITE_WC_PROJECT_ID", import.meta.env.VITE_WC_PROJECT_ID),
  // Opsional: bila kosong/placeholder, wagmi.ts fallback ke RPC publik Base Sepolia
  // (lihat guard di config/wagmi.ts). Tidak di-`required` agar app tak crash saat env belum diisi.
  ALCHEMY_RPC: import.meta.env.VITE_ALCHEMY_RPC as string | undefined,
} as const;
