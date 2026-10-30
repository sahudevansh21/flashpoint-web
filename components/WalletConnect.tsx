"use client";

/**
 * WalletConnect.tsx
 *
 * Drop-in button / status chip that surfaces the full Privy wallet flow:
 *   • Not connected  → "Connect Wallet" opens Privy modal (social + injected wallets)
 *   • Connecting     → spinner + "Connecting…"
 *   • Connected      → truncated address chip with a "Disconnect" tooltip
 *
 * Usage:
 *   import { WalletConnect } from "@/components/WalletConnect";
 *   <WalletConnect />
 *   <WalletConnect size="lg" className="my-4" />
 */

import { useState } from "react";
import { usePrivyWallet } from "@/lib/privy";

interface Props {
  /** Button size variant */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-2xl",
};

export function WalletConnect({ size = "md", className = "" }: Props) {
  const { address, loading, signIn, signOut } = usePrivyWallet();
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState<string | null>(null);

  const sizeClass = SIZE_CLASSES[size];

  const handleConnect = async () => {
    setErr(null);
    setBusy(true);
    try {
      await signIn();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = async () => {
    setBusy(true);
    await signOut();
    setBusy(false);
  };

  // ── Connected state ────────────────────────────────────────────────────────
  if (address) {
    return (
      <div className={`inline-flex flex-col gap-1 ${className}`}>
        <button
          type="button"
          onClick={handleDisconnect}
          disabled={busy}
          title="Click to disconnect"
          className={[
            sizeClass,
            "liquid-wallet-btn inline-flex items-center gap-2 border border-white/20 bg-white/5",
            "font-mono text-white hover:bg-white/10 hover:border-white/40",
            "transition-colors duration-150 disabled:opacity-50",
          ].join(" ")}
        >
          {/* Green connected dot */}
          <span className="h-2 w-2 rounded-full bg-green-400 shrink-0" aria-hidden />
          {busy ? "Disconnecting…" : `${address.slice(0, 6)}…${address.slice(-4)}`}
        </button>
      </div>
    );
  }

  // ── Disconnected / loading state ───────────────────────────────────────────
  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleConnect}
        disabled={busy || loading}
        className={[
          sizeClass,
          "liquid-wallet-btn inline-flex items-center gap-2 font-bold",
          "disabled:opacity-50 transition-opacity duration-150",
        ].join(" ")}
      >
        {busy || loading ? (
          <>
            <SpinnerIcon />
            Connecting…
          </>
        ) : (
          "Connect Wallet"
        )}
      </button>
      {err && (
        <p role="alert" className="text-xs text-red-400 font-mono mt-0.5">
          {err}
        </p>
      )}
    </div>
  );
}

// Tiny inline spinner (no external dep)
function SpinnerIcon() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

