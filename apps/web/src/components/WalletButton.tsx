import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/utils/cn";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            aria-hidden={!ready}
            className={cn(
              !ready && "pointer-events-none select-none opacity-0",
            )}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.03]"
                  >
                    Hubungkan Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="rounded-lg bg-destructive px-3.5 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90"
                  >
                    Jaringan salah
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="hidden items-center gap-1.5 rounded-lg border border-black/10 px-2.5 py-2 text-sm font-medium transition-colors hover:bg-muted sm:flex"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        src={chain.iconUrl}
                        alt={chain.name ?? "chain"}
                        className="h-4 w-4 rounded-full"
                      />
                    )}
                    <span className="max-w-24 truncate">{chain.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="rounded-lg border border-black/10 px-3 py-2 font-mono text-sm font-medium transition-colors hover:bg-muted"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
