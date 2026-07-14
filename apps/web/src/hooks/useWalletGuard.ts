import { useAccount, useSwitchChain } from "wagmi";
import { CHAIN_ID } from "../config/contracts";
import { useMe } from "./useAuth";
import { formatShortenAddress } from "../utils/format";


export function useWalletGuard() {
  const { data: me } = useMe();
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const requiredAddress = me?.walletAddress ?? null;
  const connected = isConnected && !!address;
  const correctChain = chainId === CHAIN_ID;
  const matchesBound =
    !requiredAddress || address?.toLowerCase() === requiredAddress;

  async function ensureReady() {
    if (!connected) {
      throw new Error("Hubungkan wallet dulu (tombol Connect di kanan atas).");
    }
    if (requiredAddress && address!.toLowerCase() !== requiredAddress) {
      throw new Error(
        `Gunakan wallet yang Anda daftarkan (${formatShortenAddress(
          requiredAddress,
        )}). Wallet aktif berbeda.`,
      );
    }
    if (chainId !== CHAIN_ID) {
      try {
        await switchChainAsync({ chainId: CHAIN_ID });
      } catch {
        throw new Error(
          "Gagal beralih ke jaringan Base Sepolia. Ganti jaringan di wallet Anda lalu coba lagi.",
        );
      }
    }
  }

  return {
    me,
    address,
    connected,
    correctChain,
    matchesBound,
    requiredAddress,
    ensureReady,
  };
}
