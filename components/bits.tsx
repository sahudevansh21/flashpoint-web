"use client";
import { useEffect, useState } from "react";

export function SeverityChip({ severity }: { severity: number | null }) {
  const s = severity ?? 0;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${s >= 4 ? "bg-hot-chip text-hot-soft" : "bg-panel-2 text-soft"}`}>
      Severity {s} / 5
    </span>
  );
}

export function Countdown({ to }: { to: string | null | undefined }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!to || now === null) return <span>—:—:—</span>;
  const ms = Math.max(0, new Date(to).getTime() - now);
  const h = Math.floor(ms / 3_600_000), m = Math.floor((ms % 3_600_000) / 60_000), s = Math.floor((ms % 60_000) / 1000);
  return <span>{h}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>;
}

export function StaleBanner({ stale }: { stale: boolean }) {
  if (!stale) return null;
  return (
    <div role="status" className="border-b border-hot-line bg-hot-bg px-6 py-2 text-center text-[14px] text-hot-soft">
      Live connection lost for more than 15 seconds. Prices may be stale; reconnecting.
    </div>
  );
}

export function Disclaimer() {
  return <p className="text-[13px] text-dim">Information, not investment advice. Same basket for every user at the same moment. Not available to US persons.</p>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-panel ${className}`} />;
}
