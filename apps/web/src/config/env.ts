function required(key: string, value: string | undefined): string {
  if (!value) throw new Error(`[env] Missing ${key}`);
  return value;
}

export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? "http://localhost:4000",
  CHAIN_ID: Number(import.meta.env.VITE_CHAIN_ID ?? 84532),
  WC_PROJECT_ID: required(
    "VITE_WC_PROJECT_ID",
    import.meta.env.VITE_WC_PROJECT_ID,
  ),
  ALCHEMY_RPC: import.meta.env.VITE_ALCHEMY_RPC as string | undefined,
  TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY as
    | string
    | undefined,
} as const;
