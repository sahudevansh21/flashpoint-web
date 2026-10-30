"use client";

/**
 * privy.tsx — Privy React SDK provider + wallet helpers for Flashpoint.
 *
 * Wraps the entire app in <PrivyProvider> and re-exports a clean
 * usePrivyWallet() hook.
 *
 * Injected browser extensions (Rabby, MetaMask popups) are bypassed in favor
 * of Privy's native modal and embedded/delegated wallets.
 */

import { PrivyProvider, usePrivy, useWallets } from "@privy-io/react-auth";
import type { ReactNode } from "react";
import { useEffect } from "react";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "cmvoy1nsi00nc0hl8cdxyojey";

export function FlashpointPrivyProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#ff4500",
          logo: "/brand/flashpoint-wordmark.png",
          // Pure clean wallet list without MetaMask / injected / Rabby triggers
          walletList: [
            "wallet_connect",
            "coinbase_wallet",
            "rainbow",
          ],
        },
        loginMethods: ["email", "google", "wallet"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: {
          id: 1,
          name: "Ethereum",
          network: "homestead",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: {
            default: { http: ["https://eth.llamarpc.com"] },
            public:  { http: ["https://eth.llamarpc.com"] },
          },
        },
        supportedChains: [
          {
            id: 1,
            name: "Ethereum",
            network: "homestead",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://eth.llamarpc.com"] },
              public:  { http: ["https://eth.llamarpc.com"] },
            },
          },
          {
            id: 8453,
            name: "Base",
            network: "base",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://mainnet.base.org"] },
              public:  { http: ["https://mainnet.base.org"] },
            },
          },
          {
            id: 11155111,
            name: "Sepolia",
            network: "sepolia",
            nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://rpc.sepolia.org"] },
              public:  { http: ["https://rpc.sepolia.org"] },
            },
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface WalletState {
  address: string | null;
  loading: boolean;
  connect(): void;
  signIn(): Promise<{ address: string }>;
  signOut(): Promise<void>;
}

export function usePrivyWallet(): WalletState {
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();
  const { wallets } = useWallets();

  // Find active wallet (embedded Privy or connected)
  const activeWallet =
    wallets.find((w) => w.walletClientType === "privy") ??
    wallets[0] ??
    (user?.wallet ? { address: user.wallet.address } : null);

  const address = activeWallet?.address ?? null;

  // Automatically sync Privy auth state into Flashpoint session
  useEffect(() => {
    if (authenticated && address) {
      localStorage.setItem("fp_wallet", address);
      getAccessToken()
        .then((token) => {
          if (token) localStorage.setItem("fp_token", token);
          else localStorage.setItem("fp_token", "privy_session_" + Date.now());
        })
        .catch(() => {
          localStorage.setItem("fp_token", "privy_session_" + Date.now());
        });
    }
  }, [authenticated, address, getAccessToken]);

  const connect = () => {
    if (!authenticated) login();
  };

  /**
   * Pure Privy sign-in:
   * Uses Privy's native session token and address directly.
   * Completely bypasses injected window.ethereum / Rabby personal_sign requests.
   */
  const signIn = async (): Promise<{ address: string }> => {
    if (!authenticated) {
      login();
      return { address: address || "" };
    }

    const token = (await getAccessToken().catch(() => null)) || "privy_session_" + Date.now();
    const resolvedAddress = address || "0xPrivyUser";

    localStorage.setItem("fp_token", token);
    localStorage.setItem("fp_wallet", resolvedAddress);

    return { address: resolvedAddress };
  };

  const handleSignOut = async () => {
    localStorage.removeItem("fp_token");
    localStorage.removeItem("fp_wallet");
    await logout();
  };

  return {
    address: authenticated ? address : null,
    loading: !ready,
    connect,
    signIn,
    signOut: handleSignOut,
  };
}
