import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignMessage } from "wagmi";
import { getWalletNonce, bindWallet } from "../api/walletApi";

export function useBindWallet() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect wallet first.");
      const { message } = await getWalletNonce(); 
      const signature = await signMessageAsync({ message });
      return bindWallet(address, signature); 
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}
