"use client";
import Link from "next/link";
import { useApi } from "@/lib/api";
import { CATEGORY_LABEL, etTime, short } from "@/lib/format";
import type { FeedEvent, Scorecard, Status } from "@/lib/types";
import { Countdown, SeverityChip } from "./bits";
import { ShaderCard } from "./shader-card";
import { LIVE_DATA_READY, PUBLIC_RECORD_READY } from "@/lib/launch";

export function MarketPill() {
  const { data } = useApi<Status>("/status", 60_000);
  return (
    <div className="inline-flex items-center gap-2.5 self-start rounded-full border border-hot-line bg-hot-bg px-3 py-1.5 font-mono text-[13px] text-hot-soft">
      <span className="h-2 w-2 rounded-full bg-hot" />
      {data?.market_open ? "US MARKETS OPEN" : <>US MARKETS CLOSED · NEXT OPEN IN <Countdown to={data?.next_open} /></>}
    </div>
  );
}

export function LandingPrimaryCTA() {
  const { data } = useApi<{ events: FeedEvent[] }>("/feed?severity=3", 30_000);
  const hasPublishedBasket = LIVE_DATA_READY && (data?.events.some((event) => event.basket && event.basket.status !== "void") ?? false);
  return hasPublishedBasket ? (
    <Link className="home-cta-primary" href="/feed">See tonight’s baskets <span aria-hidden="true">↗</span></Link>
  ) : (
    <a className="home-cta-primary" href="#join-beta">Join the beta <span aria-hidden="true">↗</span></a>
  );
}

/** Shows the newest published basket when one exists; never fills a live slot with sample data. */
export function HeroBasket() {
  const { data } = useApi<{ events: FeedEvent[] }>("/feed?severity=3", 30_000);
  const ev = LIVE_DATA_READY ? data?.events.find((e) => e.basket && e.basket.status !== "void") : undefined;
  const b = ev?.basket;
  const legs = b?.legs.map((l) => ({ t: l.underlying_ticker, w: l.weight })) ?? [];
  return (
    <ShaderCard
      preset="ember"
      color="#ff8a3d"
      highlightColor="#ffb88a"
      className="flex min-w-0 flex-[1_1_400px] flex-col rounded-[20px] border border-line bg-panel p-6 shadow-2xl overflow-hidden"
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[13px] text-hot-soft">{ev ? `PUBLISHED · ${etTime(ev.created_at)} ET` : LIVE_DATA_READY && data ? "AWAITING FIRST LIVE BASKET" : "BETA PREVIEW · LIVE FEED SOON"}</span>
          {ev && <SeverityChip severity={ev.severity} />}
        </div>
        <p className="font-display text-2xl font-semibold leading-tight">{ev?.title ?? (LIVE_DATA_READY && data ? "The next basket will appear here." : "The live basket appears here when publishing opens.")}</p>
        {ev && <p className="text-[15px] text-soft"><span className="text-dim">Thesis · </span>{b?.thesis}</p>}
        {legs.length > 0 && <div className="flex flex-col gap-2.5">
          {legs.map((l) => (
            <div key={l.t} className="flex items-center gap-3">
              <span className="w-14 font-mono font-medium">{l.t}</span>
              <span className="h-2 flex-grow rounded bg-[#222939]"><span className="block h-2 rounded bg-hot" style={{ width: `${l.w * 100}%` }} /></span>
              <span className="w-11 text-right font-mono text-soft">{Math.round(l.w * 100)}%</span>
            </div>
          ))}
        </div>}
        {b && <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#222939] pt-3.5 font-mono text-[13px] text-dim">
          <span>confidence {b.confidence.toFixed(2)}</span>
          <span>{ev?.category ? CATEGORY_LABEL[ev.category] : ""}</span>
          <span className="text-cool">committed {short(b.canonical_hash)}</span>
        </div>}
        <Link href={b ? `/b/${b.id}` : LIVE_DATA_READY ? "/feed" : "#join-beta"} className="flex min-h-12 items-center justify-center rounded-xl bg-text font-semibold text-ink hover:bg-white transition-colors">
          {b ? "Open basket" : LIVE_DATA_READY ? "See tonight’s baskets" : "Join the beta"}
        </Link>
      </div>
    </ShaderCard>
  );
}

export function ScorePreview() {
  const { data } = useApi<Scorecard>("/scorecard");
  const k = PUBLIC_RECORD_READY ? data?.kpis : undefined;
  const tiles = [
    ["Hit rate", k?.graded && k.hit_rate != null ? `${Math.round(k.hit_rate * 100)}%` : "—"],
    ["Avg alpha vs SPY", k?.graded && k.mean_alpha_pct != null ? `${(k.mean_alpha_pct * 100).toFixed(0)} bps` : "—"],
    ["Baskets graded", k?.graded ? String(k.graded) : "—"],
  ];
  return (
    <div className="grid flex-[1_1_480px] grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
      {tiles.map(([label, value]) => (
        <div key={label} className="rounded-[14px] bg-ink p-4.5">
          <div className="text-[14px] text-muted">{label}</div>
          <div className="font-display text-[34px] font-bold">{value}</div>
        </div>
      ))}
    </div>
  );
}
