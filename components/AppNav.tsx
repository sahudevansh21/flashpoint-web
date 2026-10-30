"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Activity, BarChart3, Bell, Coins, Home, Menu, MessageSquare, Radio, X } from "lucide-react";
import { usePrivyWallet } from "@/lib/privy";
import { LIVE_DATA_READY } from "@/lib/launch";
import { Logo } from "@/components/Logo";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/feed", label: "Live Feed", icon: Radio },
  { href: "/scorecard", label: "Scorecard", icon: BarChart3 },
  { href: "/chat", label: "Voice Composer", badge: "AI", icon: MessageSquare },
  { href: "/web3", label: "Web3 Hub", badge: "DEFI", icon: Coins },
  { href: "/me", label: "Alerts", icon: Bell },
];

export function AppNav({ live }: { live?: boolean }) {
  const path = usePathname();
  const { address, loading, signIn, signOut } = usePrivyWallet();
  const [wallet, setWallet] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLabel = NAV_LINKS.find(({ href }) => href === "/" ? path === "/" : path.startsWith(href))?.label ?? "Workspace";

  // Sync Privy address → local wallet display state
  useEffect(() => {
    setWallet(address);
  }, [address]);

  useEffect(() => setMobileOpen(false), [path]);

  const connect = async () => {
    setErr(null);
    try {
      const { address: addr } = await signIn();
      setWallet(addr);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const disconnect = async () => {
    await signOut();
    setWallet(null);
  };

  const marketStatus = LIVE_DATA_READY
    ? live ? "Live wire connected" : "Live data enabled"
    : "Beta preview · feed soon";

  return (
    <>
      <button
        type="button"
        className={`app-sidebar-backdrop${mobileOpen ? " is-open" : ""}`}
        aria-label="Close navigation menu"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={() => setMobileOpen(false)}
      />

      <aside id="app-sidebar" className={`app-sidebar${mobileOpen ? " is-open" : ""}`} aria-label="Application sidebar">
        <div className="app-sidebar-brand">
          <Logo size={18} />
          <button type="button" className="app-sidebar-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="app-sidebar-workspace">
          <span className="app-sidebar-workspace-mark" aria-hidden="true">ϟ</span>
          <span><strong>Flashpoint</strong><small>Overnight markets</small></span>
        </div>

        <span className="app-sidebar-section-label">WORKSPACE</span>
        <nav className="app-sidebar-links" aria-label="Workspace">
          {NAV_LINKS.map(({ href, label, badge, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`app-sidebar-link${active ? " is-active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
                {badge && <span className="app-sidebar-ai">{badge}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="app-sidebar-bottom">
          <div className="app-sidebar-market">
            <span className={`app-sidebar-market-dot${LIVE_DATA_READY && live ? " is-live" : ""}`} />
            <span><strong>{marketStatus}</strong><small>{LIVE_DATA_READY ? "Robinhood Chain · L2" : "60 second engine"}</small></span>
          </div>
          <p>Information, not investment advice.</p>
        </div>
      </aside>

      <header className="site-header app-topbar">
        <nav aria-label="Workspace header" className="site-nav app-topbar-inner">
          <div className="app-topbar-context">
            <button
              type="button"
              className="app-menu-toggle"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-controls="app-sidebar"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
            <div className="app-topbar-page">
              <span>FLASHPOINT <i aria-hidden="true">/</i> WORKSPACE</span>
              <strong>{activeLabel}</strong>
            </div>
          </div>

          <div className="app-topbar-actions">
            <div className="site-status app-topbar-status">
              <span className="app-status-dot"><i /></span>
              <span>{marketStatus}</span>
            </div>

            {wallet ? (
              <button
                type="button"
                onClick={disconnect}
                className="app-wallet-button"
                title="Click to sign out"
              >
                {wallet.slice(0, 6)}…{wallet.slice(-4)}
              </button>
            ) : (
              <button
                type="button"
                onClick={connect}
                className="app-wallet-button is-connect"
                disabled={loading}
              >
                {loading ? "Connecting…" : "Launch Terminal"}
              </button>
            )}
          </div>
        </nav>
        {err && <div className="app-wallet-error" role="alert">{err}</div>}
      </header>
    </>
  );
}
