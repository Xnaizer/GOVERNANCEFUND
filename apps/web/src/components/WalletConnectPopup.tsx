import { useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWalletGuard } from "../hooks/useWalletGuard";
import { formatShortenAddress } from "../utils/format";

export function WalletConnectPopup() {
  const { requiredAddress, connected, matchesBound, correctChain } =
    useWalletGuard();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("wallet-popup-dismissed") === "1",
  );
  const dismiss = () => {
    sessionStorage.setItem("wallet-popup-dismissed", "1");
    setDismissed(true);
  };

  if (!requiredAddress || dismissed) return null;
  if (connected && matchesBound && correctChain) return null;

  const msg = !connected
    ? "Wallet belum terhubung."
    : !matchesBound
    ? `Wallet aktif ≠ wallet terdaftar (${formatShortenAddress(
        requiredAddress,
      )}).`
    : "Jaringan salah — beralih ke Base Sepolia.";

  return (
    <div className="fixed right-4 top-20 z-40 w-72 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-lg dark:border-amber-900 dark:bg-amber-950">
      <button
        type="button"
        aria-label="Tutup"
        onClick={dismiss}
        className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="flex items-center gap-1 text-sm font-semibold text-amber-800 dark:text-amber-300">
        Hubungkan wallet <ArrowUpRight className="h-4 w-4" />
      </p>
      <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
        {msg} Gunakan tombol Connect di kanan atas untuk melakukan aksi
        on-chain.
      </p>
      <Button
        size="sm"
        variant="outline"
        className="mt-2 border-amber-300 text-amber-800 hover:bg-amber-100 dark:text-amber-300"
        onClick={dismiss}
      >
        Mengerti
      </Button>
    </div>
  );
}
