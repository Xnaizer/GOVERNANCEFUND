import { api } from "../lib/api";

interface Envelope<T> {
  data: T;
  error: string | null;
  meta: Record<string, unknown>;
}

export async function getWalletNonce() {
  const res = await api.get<Envelope<{ nonce: string; message: string }>>(
    "/users/wallet/nonce",
  );

  return res.data.data;
}

export async function bindWallet(walletAddress: string, signature: string) {
  const res = await api.post<Envelope<{ walletAddress: string }>>(
    "/users/wallet/bind",
    { walletAddress, signature },
  );

  return res.data.data;
}
