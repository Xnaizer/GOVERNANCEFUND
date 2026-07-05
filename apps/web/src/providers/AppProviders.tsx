import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { HeroUIProvider } from "@heroui/react";
import { wagmiConfig } from "../config/wagmi";
import { Toaster } from "react-hot-toast"

export function AppProviders({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    <HeroUIProvider>
                        {children}
                        <Toaster position="top-right" />
                    </HeroUIProvider>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}