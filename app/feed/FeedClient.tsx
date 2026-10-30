"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { Countdown, Disclaimer, SeverityChip, Skeleton, StaleBanner } from "@/components/bits";
import { useApi } from "@/lib/api";
import { CATEGORY_LABEL, bps, etTime, short, upDown } from "@/lib/format";
import type { FeedEvent, LiveToken, Status } from "@/lib/types";
import { useChannel } from "@/lib/ws";
import { LIVE_DATA_READY } from "@/lib/launch";

const FILTERS = [
  ["all", "All"],
  ["geopolitics_energy", "Energy"],
  ["conflict_defense", "Defense"],
  ["semis_export", "Semis"],
  ["monetary_policy", "Rates"],
  ["trade_tariffs", "Trade"],
  ["china_macro", "China"],
  ["crypto_regulation", "Crypto"],
] as const;

export function FeedClient() {
  const [sector, setSector] = useState<string>("all");
  const feed = useApi<{ events: FeedEvent[] }>(LIVE_DATA_READY ? `/feed${sector === "all" ? "" : `?sector=${sector}`}` : null);
  const fv = useApi<{ tokens: LiveToken[] }>(LIVE_DATA_READY ? "/fairvalue" : null, 10_000);
  const status = useApi<Status>("/status", 60_000);

  const { connected, stale } = useChannel(
    LIVE_DATA_READY ? "feed" : null,
    (m) => {
      if (m.type === "basket.published" || m.type === "event.triaged" || m.type === "basket.graded") {
        void feed.reload();
      }
    },
    feed.reload
  );

  const drift = useMemo(
    () =>
      (fv.data?.tokens ?? [])
        .filter((t) => t.gapBps !== null)
        .sort((a, b) => Math.abs(b.gapBps!) - Math.abs(a.gapBps!))
        .slice(0, 6),
    [fv.data]
  );

  return (
    <div className="universe-page fp-feed-page min-h-screen text-text">
      <AppNav live={connected} />
      <StaleBanner stale={LIVE_DATA_READY && stale} />

      <main className="feed-layout mx-auto flex max-w-[1360px] flex-wrap items-start gap-8 px-6 pt-8 pb-20">
        {/* Main Feed Column */}
        <section aria-label="Live events" className="flex min-w-0 flex-[999_1_640px] flex-col gap-6">
          <div className="feed-title-block">
            <div className="feed-title-copy">
              <span className="fp-eyebrow">[ LIVE WIRE ] · OVERNIGHT INTELLIGENCE</span>
              <div className="feed-title-line">
                <h1 className="m-0 font-display font-bold tracking-tight text-white">Tonight’s Live Feed</h1>
                <span className="feed-engine-pill">60s Engine</span>
              </div>
              <p>Market-moving headlines become public, reviewable baskets before Wall Street opens.</p>
            </div>
            <span className="feed-sort-label">Newest first <i /> Real-time wire</span>
          </div>

          {!LIVE_DATA_READY ? (
            <div className="feed-empty-state liquid-card">
              <div className="feed-empty-copy">
                <span className="feed-live-indicator"><i /> Beta preview · live publishing soon</span>
                <h2>The live feed opens with verified baskets.</h2>
                <p>We’re preparing the real wire and onchain publishing flow. Demo headlines and synthetic prices stay out of the public feed.</p>
                <Link href="/#join-beta" className="liquid-glow-btn inline-flex min-h-11 w-fit items-center rounded-xl px-5 font-semibold text-sm">Join the beta <span aria-hidden="true">↗</span></Link>
              </div>
              <div className="feed-preview-orbit" aria-hidden="true"><span className="feed-preview-core">ϟ</span><i /><b /></div>
            </div>
          ) : <>
          {/* Liquid Sector Filter Rail */}
          <div role="group" aria-label="Filter by sector" className="flex flex-wrap gap-2">
            {FILTERS.map(([id, label], i) => (
              <button
                key={id}
                type="button"
                aria-pressed={sector === id}
                onClick={() => setSector(id)}
                className={`min-h-9 rounded-full px-4 text-xs font-mono tracking-wider uppercase transition-all ${
                  sector === id
                    ? "liquid-pill-hot font-bold text-white shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                    : "liquid-pill text-muted hover:text-white"
                }`}
              >
                [{String(i + 1).padStart(2, "0")}] {label}
              </button>
            ))}
          </div>

          {feed.loading && !feed.data && (
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-44 rounded-2xl bg-white/[0.03]" />
              ))}
            </div>
          )}

          {feed.error && (
            <div className="liquid-card border-red-500/30 p-6 text-red-300 font-mono text-sm">
              Couldn’t load the feed ({feed.error.message}). Is the backend server running?
            </div>
          )}

          {feed.data?.events.length === 0 && (
            <div className="liquid-card border-dashed border-white/10 p-12 text-center text-muted font-mono text-sm">
              No events detected yet tonight. Quiet market nights are logged and graded too.
            </div>
          )}

          {feed.data?.events.map((ev) => (
            <EventCard key={ev.id} ev={ev} />
          ))}
          </>}
        </section>

        {/* Sidebar Status Column */}
        <aside aria-label="Market status" className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
          {/* Market Status Liquid Card */}
          <div className="liquid-card-hot flex flex-col gap-2 p-6">
            <span className="font-mono text-xs tracking-wider text-hot-soft uppercase">
              {status.data?.market_open ? "US REGULAR SESSION" : "NYSE OPENS IN"}
            </span>
            <span className="font-display text-[46px] font-bold tracking-tight text-white">
              {status.data?.market_open ? "LIVE" : <Countdown to={status.data?.next_open} />}
            </span>
            <span className="font-mono text-xs text-soft leading-normal">
              Scorecard publishes at 9:45 ET.
              {LIVE_DATA_READY && status.data?.latency_p50_ms != null && (
                <> Headline → publish p50: <span className="text-white font-bold">{(status.data.latency_p50_ms / 1000).toFixed(1)}s</span>.</>
              )}
            </span>
          </div>

          {/* Fair Value Drift Liquid Card */}
          {LIVE_DATA_READY ? (
          <div className="liquid-card flex flex-col gap-4 p-6">
            <div className="flex items-baseline justify-between border-b border-white/10 pb-3">
              <span className="font-display text-lg font-bold text-white">Fair-Value Drift</span>
              <span className="font-mono text-xs text-dim uppercase">Token vs Synth</span>
            </div>

            {drift.length === 0 && (
              <span className="font-mono text-xs text-muted">Awaiting off-hours prices…</span>
            )}

            <div className="flex flex-col gap-2.5">
              {drift.map((t) => {
                const isSignificant = Math.abs(t.gapBps!) >= 150;
                return (
                  <div
                    key={t.symbol}
                    className="flex items-center justify-between font-mono text-xs rounded-lg bg-black/30 px-3 py-2 border border-white/5"
                  >
                    <span className="font-bold text-white">{t.symbol}</span>
                    <span
                      className={`font-semibold ${
                        isSignificant
                          ? t.gapBps! > 0
                            ? "text-hot"
                            : "text-cool"
                          : "text-soft"
                      }`}
                    >
                      {bps(t.gapBps!)}
                      {isSignificant ? " · DRIFT" : ""}
                      {t.frozen ? " · FROZEN" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          ) : (
            <div className="liquid-card flex flex-col gap-3 p-6">
              <span className="font-display text-lg font-bold text-white">Fair-value drift</span>
              <span className="font-mono text-xs leading-relaxed text-muted">Live token prices and fair-value comparisons appear when verified market data is enabled.</span>
            </div>
          )}

          {/* Alerts Promo */}
          <div className="liquid-card flex flex-col gap-3 p-6 border-white/10">
            <span className="font-display text-lg font-bold text-white">Direct Push Alerts</span>
            <span className="text-sm text-soft leading-normal">
              Get notified the identical second an onchain basket commits. Telegram, browser push, or webhook.
            </span>
            <Link
              href="/me"
              className="liquid-glow-btn inline-flex min-h-10 items-center justify-center rounded-xl font-bold text-xs"
            >
              Configure Live Alerts →
            </Link>
          </div>

          <Disclaimer />
        </aside>
      </main>
    </div>
  );
}

function EventCard({ ev }: { ev: FeedEvent }) {
  const b = ev.basket;
  const live = b && b.status === "published";
  let statusBadge = "TRIAGED";
  let badgeColor = "text-muted border-white/10 bg-white/5";

  if (b?.status === "void") {
    statusBadge = `VOIDED · ${b.void_reason ?? ""}`;
    badgeColor = "text-dim border-white/5 bg-black/40";
  } else if (b?.status === "graded") {
    statusBadge = "GRADED @ 9:45 ET";
    badgeColor = "text-cool border-cool/30 bg-cool/10";
  } else if (live) {
    statusBadge = `LIVE ONCHAIN · ${short(b.canonical_hash, 4)}`;
    badgeColor = "text-hot border-hot/30 bg-hot/10";
  } else if (ev.status === "skipped") {
    statusBadge = "BELOW THRESHOLD";
    badgeColor = "text-dim border-white/5 bg-black/40";
  }

  return (
      <article className="feed-story-card liquid-card flex flex-col gap-4 p-6 sm:p-7 transition-all hover:border-white/20">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="font-mono text-xs text-dim uppercase tracking-wider">{etTime(ev.created_at)} ET</span>
        <SeverityChip severity={ev.severity} />
        {ev.category && (
          <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-soft">
            {CATEGORY_LABEL[ev.category] ?? ev.category}
          </span>
        )}
        {ev.sources_n > 1 && (
          <span className="font-mono text-[11px] text-dim">{ev.sources_n} wire sources</span>
        )}
        <span className="flex-grow" />
        <span className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold border ${badgeColor}`}>
          {statusBadge}
        </span>
      </div>

      <h2 className="m-0 font-display text-[22px] sm:text-[24px] font-bold leading-snug text-white">
        {ev.title}
      </h2>

      <p className="m-0 text-sm sm:text-[15px] text-soft leading-relaxed">
        {b?.thesis || ev.skip_reason || "Below the severity bar for a basket. Logged and audited, not hidden."}
      </p>

      {/* ETF Basket Leg Pills & Action */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {b?.legs.map((l) => (
          <span
            key={l.underlying_ticker}
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 font-mono text-xs font-semibold text-white"
          >
            {l.underlying_ticker} <span className="text-hot font-bold">{Math.round(l.weight * 100)}%</span>
          </span>
        ))}

        <span className="flex-grow" />

        {ev.grade && (
          <span className="font-mono text-xs font-bold text-white rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
            {upDown(ev.grade.ret)} · {ev.grade.hit ? "HIT" : "MISS"}
          </span>
        )}

        {b && b.status !== "void" && (
          <Link
            href={`/b/${b.id}`}
            className="liquid-glow-btn inline-flex min-h-9 items-center rounded-xl px-4 text-xs font-bold"
          >
            Open Basket →
          </Link>
        )}
      </div>
    </article>
  );
}
