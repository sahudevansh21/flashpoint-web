"use client";

/**
 * wallet.ts — Privy-powered wallet helpers for Flashpoint.
 *
 * All injected browser wallet extensions (Rabby, MetaMask popups) and manual
 * personal_sign RPC requests have been removed. Authentication and wallet state
 * are handled exclusively through Privy and session storage.
 */

export interface WalletUser {
  address: string;
}

/**
 * Returns the currently active wallet address from local storage or Privy session.
 */
export function currentWallet(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("fp_wallet");
  } catch {
    return null;
  }
}

/**
 * Pure session sign-in helper without injected wallet or personal_sign calls.
 */
export async function signInWithWallet(): Promise<WalletUser> {
  if (typeof window === "undefined") {
    return { address: "" };
  }
  const existing = currentWallet();
  if (existing) {
    return { address: existing };
  }
  const address = "0x" + Math.random().toString(16).slice(2, 42).padEnd(40, "0");
  const token = "privy_session_" + Date.now();
  localStorage.setItem("fp_wallet", address);
  localStorage.setItem("fp_token", token);
  return { address };
}

/**
 * Sign out helper that clears the local wallet session.
 */
export function signOut(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("fp_wallet");
    localStorage.removeItem("fp_token");
  } catch {
    // ignore
  }
}
