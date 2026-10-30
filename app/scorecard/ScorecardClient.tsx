"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { Disclaimer, Skeleton } from "@/components/bits";
import { API_URL, useApi } from "@/lib/api";
import { CATEGORY_LABEL, etDate, upDown } from "@/lib/format";
import type { Scorecard } from "@/lib/types";
import { useChannel } from "@/lib/ws";
import { PUBLIC_RECORD_READY } from "@/lib/launch";

const RANGES = [
  ["7d", "7 days", 7],
  ["30d", "30 days", 30],
  ["all", "All time", 3650],
] as const;

export function ScorecardClient() {
  const [range, setRange] = useState<(typeof RANGES)[number][0]>("30d");
  const from = useMemo(() => {
    const days = RANGES.find((r) => r[0] === range)![2];
    return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  }, [range]);

  const sc = useApi<Scorecard>(`/scorecard?from=${from}`);
  const { connected } = useChannel("scorecard", () => void sc.reload(), sc.reload);
  const k = PUBLIC_RECORD_READY ? sc.data?.kpis : undefined;

  const tiles = [
    ["Hit rate after slippage", k?.hit_rate != null ? `${Math.round(k.hit_rate * 100)}%` : "—", "Target above 55%", "hot"],
    ["Mean alpha vs SPY", k?.mean_alpha_pct != null ? `${k.mean_alpha_pct >= 0 ? "+" : "−"}${Math.abs(k.mean_alpha_pct * 100).toFixed(0)} bps` : "—", "Per basket, at open", "cool"],
    ["Baskets graded", k ? String(k.graded) : "—", k ? `${k.voids} void${k.voids === 1 ? "" : "s"} audited` : "", "default"],
    ["Worst basket", k?.worst_pct != null ? upDown(k.worst_pct) : "—", "Shown, never hidden", "default"],
  ];

  return (
    <div className="universe-page fp-scorecard-page min-h-screen text-text">
      <AppNav live={connected} />

      <main className="fp-subpage-main mx-auto flex max-w-[1360px] flex-col gap-8 px-6 pt-8 pb-20">
        {/* Header & Range Controls */}
        <div className="fp-subpage-hero flex flex-wrap items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="flex flex-[1_1_480px] flex-col gap-2.5">
            <span className="font-mono text-xs font-semibold tracking-widest text-cool uppercase">
              PUBLISHED DAILY · 9:45 ET REGULAR OPEN
            </span>
            <h1 className="m-0 font-display text-[34px] sm:text-[44px] font-bold tracking-tight text-white">
              Every Basket Ever, Graded In Public.
            </h1>
            <p className="m-0 text-sm sm:text-base text-muted max-w-[620px] leading-relaxed">
              Entry is the stored executable DEX quote. Exit is the token at 9:45 ET. A hit is alpha above zero vs SPY after realistic execution slippage.
            </p>
          </div>

          <div role="group" aria-label="Time range" className="flex gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-1 backdrop-blur-md">
            {RANGES.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={range === id}
                onClick={() => setRange(id)}
                className={`min-h-9 rounded-lg px-4 font-mono text-xs font-semibold uppercase tracking-wider transition-all ${
                  range === id
                    ? "liquid-pill-hot font-bold text-white shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                    : "text-muted hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Tiles (Liquid Cards) */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {tiles.map(([label, value, note, theme]) => (
            <div
              key={label}
              className={`liquid-card flex flex-col gap-1 p-6 ${
                theme === "hot"
                  ? "border-hot/30 shadow-[0_0_25px_rgba(255,107,0,0.1)]"
                  : theme === "cool"
                  ? "border-cool/30 shadow-[0_0_25px_rgba(125,184,255,0.1)]"
                  : ""
              }`}
            >
              <div className="font-mono text-xs text-muted uppercase tracking-wider">{label}</div>
              <div
                className={`font-display font-bold tracking-tight ${
                  theme === "hot"
                    ? "text-hot"
                    : theme === "cool"
                    ? "text-cool"
                    : "text-white"
                } ${value.length > 8 ? "text-[32px] leading-[54px]" : "text-[44px]"}`}
              >
                {value}
              </div>
              <div className="font-mono text-xs text-dim">{note}</div>
            </div>
          ))}
        </div>

        {/* Table & Analytics Split */}
        <div className="flex flex-wrap items-start gap-8">
          {/* Main Graded Table Liquid Card */}
          <section aria-label="Graded baskets" className="liquid-card flex min-w-0 flex-[999_1_680px] flex-col gap-4 p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <h2 className="m-0 font-display text-xl sm:text-2xl font-bold text-white">
                Graded Baskets Ledger
              </h2>
              {PUBLIC_RECORD_READY ? (
                <a
                  href={`${API_URL}/v1/scorecard?from=${from}&format=csv`}
                  className="liquid-pill inline-flex min-h-9 items-center rounded-lg px-3.5 font-mono text-xs text-soft hover:text-white"
                >
                  Download Raw CSV ↓
                </a>
              ) : (
                <span className="font-mono text-[11px] text-dim">CSV opens with the verified record</span>
              )}
            </div>

            {sc.loading && !sc.data && <Skeleton className="h-64 rounded-xl bg-white/[0.03]" />}

            {!PUBLIC_RECORD_READY && (
              <p className="font-mono text-xs text-muted py-8 text-center">
                Public grading begins after the first real baskets are published and measured. Performance figures will appear here with every result included.
              </p>
            )}

            {PUBLIC_RECORD_READY && sc.data?.rows.length === 0 && (
              <p className="font-mono text-xs text-muted py-8 text-center">
                Nothing graded in this range yet. The first scorecard posts at 9:45 ET following market open.
              </p>
            )}

            {PUBLIC_RECORD_READY && !!sc.data?.rows.length && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left font-mono text-xs text-muted uppercase tracking-wider">
                      <th className="py-3 pr-2">Date (ET)</th>
                      <th className="p-3">Event Headline</th>
                      <th className="p-3">Legs</th>
                      <th className="p-3">Basket</th>
                      <th className="p-3">vs SPY</th>
                      <th className="py-3 pl-2">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs">
                    {sc.data.rows.map((r) => (
                      <tr key={r.basket_id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="whitespace-nowrap py-3.5 pr-2 text-dim">{etDate(r.graded_at)}</td>
                        <td className="p-3.5 font-sans font-medium text-white">
                          <Link href={`/b/${r.basket_id}`} className="hover:text-hot transition-colors">
                            {r.title}
                          </Link>
                        </td>
                        <td className="p-3.5 text-soft">{r.legs.join(" · ")}</td>
                        <td className="p-3.5 font-semibold text-white">{upDown(r.ret_pct)}</td>
                        <td className="p-3.5 font-semibold">{upDown(r.vs_spy)}</td>
                        <td className="py-3.5 pl-2">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 font-bold uppercase ${
                              r.hit
                                ? "bg-cool/15 border border-cool/30 text-cool"
                                : "bg-hot/15 border border-hot/30 text-hot"
                            }`}
                          >
                            {r.hit ? "Hit" : "Miss"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {sc.data.voids.map((v) => (
                      <tr key={v.id} className="text-dim hover:bg-white/[0.01]">
                        <td className="py-3.5 pr-2">{etDate(v.created_at)}</td>
                        <td className="p-3.5 font-sans">{v.title}</td>
                        <td className="p-3.5">—</td>
                        <td className="p-3.5">—</td>
                        <td className="p-3.5">—</td>
                        <td className="py-3.5 pl-2">
                          <span className="inline-block rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5">
                            Void · {v.reason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Right Sidebar Analytics */}
          <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-6">
            {/* Calibration Liquid Card */}
            <div className="liquid-card flex flex-col gap-3.5 p-6">
              <span className="font-display text-lg font-bold text-white">Confidence Calibration</span>
              <span className="text-xs text-muted leading-relaxed">
                Do higher-confidence AI baskets hit alpha targets reliably?
              </span>
              <div className="flex flex-col gap-3 pt-1">
                {!PUBLIC_RECORD_READY && <span className="font-mono text-xs text-muted">Awaiting a verified public grading record.</span>}
                {PUBLIC_RECORD_READY && sc.data?.calibration.map((c) => (
                  <div key={c.range} className="flex items-center gap-2.5 font-mono text-xs">
                    <span className="w-16 text-dim">{c.range}</span>
                    <span className="h-2 flex-grow rounded-full bg-white/10 overflow-hidden">
                      <span
                        className="block h-full bg-cool rounded-full"
                        style={{ width: `${(c.hit_rate ?? 0) * 100}%` }}
                      />
                    </span>
                    <span className="w-16 text-right font-bold text-white">
                      {c.hit_rate == null ? "n/a" : `${Math.round(c.hit_rate * 100)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Sector Liquid Card */}
            <div className="liquid-card flex flex-col gap-3 p-6">
              <span className="font-display text-lg font-bold text-white">Sector Performance</span>
              {!PUBLIC_RECORD_READY && <span className="font-mono text-xs text-muted">Awaiting a verified public grading record.</span>}
              {PUBLIC_RECORD_READY && sc.data?.by_category.length === 0 && (
                <span className="font-mono text-xs text-muted">Awaiting graded history.</span>
              )}
              <div className="flex flex-col gap-2.5">
                {PUBLIC_RECORD_READY && sc.data?.by_category.map((c) => (
                  <div key={c.category} className="flex justify-between font-mono text-xs">
                    <span className="text-soft">{CATEGORY_LABEL[c.category] ?? c.category}</span>
                    <span className={`font-semibold ${c.hit_rate < 0.5 ? "text-hot" : "text-white"}`}>
                      {Math.round(c.hit_rate * 100)}% hit ({c.n})
                    </span>
                  </div>
                ))}
              </div>
              <span className="font-mono text-[11px] text-dim border-t border-white/5 pt-2">
                Underperforming categories (&lt;50% over 4 weeks) are automatically decommissioned.
              </span>
            </div>

            {/* Verify Onchain Liquid Card */}
            <div className="liquid-card-hot flex flex-col gap-2.5 p-6 border-cool/30">
              <span className="font-display text-lg font-bold text-cool-soft">
                Recompute Onchain Proof
              </span>
              <span className="font-mono text-xs text-soft leading-relaxed">
                Every basket JSON is public. Canonicalise keys, format to 8 decimals, keccak256 hash it, and verify the L2 receipt. The CSV contains every quote and grade.
              </span>
            </div>

            <Disclaimer />
          </aside>
        </div>
      </main>
    </div>
  );
}
