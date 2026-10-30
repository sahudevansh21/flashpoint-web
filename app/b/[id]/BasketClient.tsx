"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { Disclaimer, SeverityChip, Skeleton, StaleBanner } from "@/components/bits";
import { ApiError, api, authToken, useApi } from "@/lib/api";
import { CATEGORY_LABEL, bps, etTime, short, upDown, usd } from "@/lib/format";
import type { BasketDetail, LiveToken, QuoteLeg } from "@/lib/types";
import { useChannel } from "@/lib/ws";
import { LIVE_DATA_READY } from "@/lib/launch";
import { BasketWeb3Modal } from "@/components/BasketWeb3Modal";

export function BasketClient({ id }: { id: string }) {
  const detail = useApi<BasketDetail>(LIVE_DATA_READY ? `/baskets/${id}` : null);
  const [size, setSize] = useState(1000);
  const [quote, setQuote] = useState<{ legs: QuoteLeg[]; quoted_at: string } | null>(null);
  const [live, setLive] = useState<Record<string, LiveToken>>({});
  const [blocked, setBlocked] = useState<string | null>(null);
  const [vote, setVote] = useState<string | null>(null);
  const [voteMsg, setVoteMsg] = useState<string | null>(null);
  const [web3ModalOpen, setWeb3ModalOpen] = useState(false);
  const [selectedWeb3Token, setSelectedWeb3Token] = useState<{ token: string; name?: string; price?: number }>({ token: "SEMI" });

  useEffect(() => {
    if (!LIVE_DATA_READY) return;
    if (detail.data) setLive(detail.data.live);
  }, [detail.data]);

  // Re-quote on size change and every 10 s against pool depth.
  useEffect(() => {
    if (!LIVE_DATA_READY) return;
    let cancelled = false;
    const run = () =>
      api<{ legs: QuoteLeg[]; quoted_at: string }>(`/baskets/${id}/quote?usdg=${size}`)
        .then((q) => {
          if (!cancelled) setQuote(q);
        })
        .catch(() => {});
    const debounce = setTimeout(run, 150);
    const t = setInterval(run, 10_000);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
      clearInterval(t);
    };
  }, [id, size]);

  const { connected, stale } = useChannel(
    LIVE_DATA_READY ? `basket:${id}` : null,
    (m) => {
      if (m.type !== "price.tick") return;
      const p = m.data as { symbol: string; px: number; ts: string };
      setLive((prev) => {
        const t = prev[p.symbol];
        if (!t) return prev;
        const gap = t.fv ? Math.round(((p.px - t.fv) / t.fv) * 10_000) : t.gapBps;
        return { ...prev, [p.symbol]: { ...t, mid: p.px, gapBps: gap, ts: p.ts } };
      });
    },
    detail.reload
  );

  if (!LIVE_DATA_READY) {
    return (
      <div className="universe-page min-h-screen text-text">
        <AppNav />
        <main className="mx-auto max-w-[920px] px-6 py-20">
          <div className="liquid-card flex flex-col gap-5 p-8 sm:p-12">
            <span className="font-mono text-xs font-semibold tracking-widest text-hot uppercase">Beta preview · publishing soon</span>
            <h1 className="m-0 font-display text-3xl sm:text-5xl font-bold text-white">Verified basket details will appear here.</h1>
            <p className="m-0 max-w-2xl leading-relaxed text-muted">This preview hides seeded baskets, simulated prices, and unverified grades. Real receipts and market data will be available once live publishing is enabled.</p>
            <Link href="/feed" className="liquid-glow-btn inline-flex min-h-11 w-fit items-center rounded-xl px-5 font-semibold text-sm">← Return to live feed</Link>
          </div>
        </main>
      </div>
    );
  }

  if (detail.error) {
    return (
      <div className="universe-page min-h-screen text-text">
        <AppNav />
        <main className="mx-auto max-w-[1280px] px-6 py-20">
          <div className="liquid-card p-8 border-red-500/30">
            <p className="font-mono text-sm text-red-300 mb-4">
              {detail.error instanceof ApiError && detail.error.status === 404
                ? "Basket not found."
                : `Couldn’t load this basket (${detail.error.message}).`}
            </p>
            <Link href="/feed" className="liquid-glow-btn rounded-xl px-5 py-2 text-xs font-bold">
              ← Return to live feed
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!detail.data) {
    return (
      <div className="universe-page min-h-screen text-text">
        <AppNav />
        <main className="mx-auto flex max-w-[1360px] flex-col gap-6 px-6 py-12">
          <Skeleton className="h-28 rounded-2xl bg-white/[0.03]" />
          <Skeleton className="h-96 rounded-2xl bg-white/[0.03]" />
        </main>
      </div>
    );
  }

  const { basket: b, event: ev, commit, grade, analogs, votes, vote_locks_at } = detail.data;
  const uniqueSources = [...new Map(detail.data.sources.map((s) => [s.source, s])).values()];
  const qByToken = new Map(quote?.legs.map((l) => [l.token, l]) ?? []);
  const votingOpen = vote_locks_at ? Date.now() < new Date(vote_locks_at).getTime() : false;

  const trade = async (token: string, q: QuoteLeg | undefined) => {
    setBlocked(null);
    try {
      const { links } = await api<{ links: { token: string; uniswap: string }[] }>(
        `/baskets/${id}/links?usdg=${size}`
      );
      const link = links.find((l) => l.token === token);
      if (link) window.open(link.uniswap, "_blank", "noopener");
      if (authToken() && q?.price) {
        await api("/me/positions", {
          method: "POST",
          body: JSON.stringify({
            basket_id: id,
            size_usdg: size,
            entry: Object.fromEntries(
              (quote?.legs ?? []).filter((l) => l.price).map((l) => [l.token, l.price])
            ),
          }),
        }).catch(() => {});
      }
    } catch (e) {
      setBlocked(
        e instanceof ApiError && e.status === 451
          ? "Stock Tokens are not available to US persons, so trade links are hidden in your region."
          : (e as Error).message
      );
    }
  };

  const castVote = async (side: "follow" | "fade") => {
    setVoteMsg(null);
    if (!authToken()) {
      setVoteMsg("Connect a wallet to vote.");
      return;
    }
    try {
      await api(`/baskets/${id}/vote`, { method: "POST", body: JSON.stringify({ side }) });
      setVote(side);
      setVoteMsg(`You voted ${side}. Graded at 9:45 ET.`);
    } catch (e) {
      setVoteMsg(
        e instanceof ApiError && e.code === "voting_locked" ? "Voting is locked." : (e as Error).message
      );
    }
  };

  return (
    <div className="universe-page min-h-screen text-text">
      <AppNav live={connected} />
      <StaleBanner stale={stale} />

      <main className="mx-auto flex max-w-[1360px] flex-col gap-8 px-6 pt-6 pb-20">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-white transition-colors"
        >
          ← Back to Live Feed
        </Link>

        {/* Headline Header */}
        <section className="flex max-w-[1000px] flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs text-hot font-bold tracking-wider">
              {b.id} · {etTime(b.created_at)} ET
            </span>
            <SeverityChip severity={ev?.severity ?? null} />
            <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-soft">
              Long · Horizon {b.horizon.replace("_", " ")}
            </span>
            {ev?.category && (
              <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 font-mono text-[11px] text-soft">
                {CATEGORY_LABEL[ev.category]}
              </span>
            )}
            <span className="rounded-full bg-hot/10 border border-hot/30 px-2.5 py-0.5 font-mono text-[11px] font-bold text-hot uppercase">
              {b.status}
            </span>
          </div>

          <h1 className="m-0 font-display text-[32px] sm:text-[44px] font-bold leading-tight text-white">
            {ev?.title}
          </h1>

          <p className="m-0 text-base sm:text-xl text-soft leading-relaxed">
            <strong className="text-white">AI Thesis:</strong> {b.thesis}
          </p>

          <p className="m-0 font-mono text-xs text-dim">
            {ev?.sourcesN ?? 1} independent source{(ev?.sourcesN ?? 1) === 1 ? "" : "s"} ·{" "}
            {uniqueSources.slice(0, 3).map((s, i) => (
              <span key={s.url}>
                {i > 0 && ", "}
                <a href={s.url} target="_blank" rel="noreferrer" className="text-hot hover:underline">
                  {s.source}
                </a>
              </span>
            ))}
            {" "}· Model {b.model_version}
          </p>
        </section>

        {/* Macro Reasoning Chain */}
        {b.why_chain.length > 0 && (
          <section aria-label="Why this basket" className="flex flex-wrap items-center gap-2.5">
            {b.why_chain.map((step, i) => (
              <span key={i} className="flex items-center gap-2.5">
                {i > 0 && <span aria-hidden="true" className="text-hot font-bold">→</span>}
                <span
                  className={`rounded-xl px-4 py-2 font-mono text-xs font-semibold ${
                    i === b.why_chain.length - 1
                      ? "liquid-pill-hot text-white"
                      : "liquid-pill text-soft"
                  }`}
                >
                  {step}
                </span>
              </span>
            ))}
          </section>
        )}

        {/* Grade Banner if graded */}
        {grade && (
          <section
            className={`liquid-card flex flex-wrap items-center gap-6 p-6 ${
              grade.hit ? "border-cool/40 bg-cool/5" : "border-hot/40 bg-hot/5"
            }`}
          >
            <span className="font-display text-3xl sm:text-4xl font-bold text-white">
              {upDown(grade.ret)}
            </span>
            <span className="font-mono text-xs text-soft">
              {upDown(grade.vsSpy)} vs SPY · Executed after slippage
            </span>
            <span
              className={`rounded-full px-3 py-1 font-mono text-xs font-bold uppercase ${
                grade.hit ? "bg-cool text-black" : "bg-hot text-black"
              }`}
            >
              {grade.hit ? "HIT" : "MISS"}
            </span>
            <span className="font-mono text-xs text-dim">
              Graded at {etTime(grade.gradedAt)} ET open
            </span>
          </section>
        )}

        {/* Sizing & Execution Table Split */}
        <div className="flex flex-wrap items-start gap-8">
          <section
            aria-label="Legs"
            className="liquid-card flex min-w-0 flex-[999_1_660px] flex-col gap-6 p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <label htmlFor="size" className="font-display text-xl font-bold text-white">
                Sizing &amp; Execution Depth
              </label>
              <span className="font-display text-2xl font-bold text-hot">
                {size.toLocaleString("en-US")} USDG
              </span>
            </div>

            <input
              id="size"
              type="range"
              min={100}
              max={5000}
              step={100}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="h-2 w-full rounded-full bg-white/10 accent-hot"
            />

            <p className="m-0 font-mono text-xs text-muted leading-relaxed">
              Quotes refresh every 10 s against pool depth. Legs exceeding the {b.max_slip_bps} bps slippage cap grey out and their weight redistributes automatically.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-left text-dim uppercase tracking-wider">
                    <th className="py-3 pr-2">Token</th>
                    <th className="p-3">Weight</th>
                    <th className="p-3">Token Price</th>
                    <th className="p-3">Fair Value</th>
                    <th className="p-3">Gap</th>
                    <th className="p-3">Slippage</th>
                    <th className="p-3">Amount</th>
                    <th className="py-3 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {b.legs.map((l) => {
                    const t = live[l.underlying_ticker];
                    const q = qByToken.get(l.underlying_ticker);
                    const off = q?.off ?? false;
                    return (
                      <tr key={l.underlying_ticker} className={off ? "opacity-40" : ""}>
                        <td className="py-3.5 pr-2 font-bold text-white">
                          {l.underlying_ticker}
                          <div className="font-sans text-[11px] text-muted font-normal">{t?.name}</div>
                        </td>
                        <td className="p-3.5 text-hot font-semibold">
                          {off ? "OUT" : `${Math.round((q?.eff_weight ?? l.weight) * 100)}%`}
                        </td>
                        <td className="p-3.5 text-white">{t?.mid ? usd(t.mid) : "—"}</td>
                        <td className="p-3.5 text-cool">{t?.fv ? usd(t.fv) : "—"}{t?.frozen ? " (frozen)" : ""}</td>
                        <td className="p-3.5">{t?.gapBps != null ? bps(t.gapBps) : "—"}</td>
                        <td className="p-3.5">{q?.slippage_bps != null ? `${q.slippage_bps} bps` : "—"}</td>
                        <td className="p-3.5 font-bold text-white">
                          {off ? "—" : `${Math.round(q?.amount_usdg ?? size * l.weight).toLocaleString("en-US")} USDG`}
                        </td>
                        <td className="py-3.5 pl-2 text-right">
                          <button
                            type="button"
                            disabled={off || b.status !== "published"}
                            onClick={() => {
                              setSelectedWeb3Token({
                                token: l.underlying_ticker,
                                name: t?.name,
                                price: t?.mid ?? undefined,
                              });
                              setWeb3ModalOpen(true);
                              void trade(l.underlying_ticker, q);
                            }}
                            className={`min-h-8 rounded-lg px-3.5 font-bold uppercase transition-all ${
                              off || b.status !== "published"
                                ? "liquid-pill text-dim cursor-not-allowed"
                                : "liquid-glow-btn text-black"
                            }`}
                          >
                            {off ? "Thin" : b.status === "published" ? "Swap" : "Closed"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {blocked && (
              <p role="alert" className="m-0 font-mono text-xs text-red-400">
                {blocked}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 font-mono text-xs text-dim">
              <span>Non-custodial routing. Opens a prefilled DEX trade in your wallet.</span>
              <span className="text-cool font-semibold">Equal latency for all traders</span>
            </div>
          </section>

          {/* Right Column Details */}
          <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-6">
            {/* Confidence Liquid Card */}
            <div className="liquid-card flex flex-col gap-3 p-6">
              <span className="font-display text-lg font-bold text-white">Confidence Score</span>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[42px] font-bold text-hot">
                  {b.confidence_calibrated.toFixed(2)}
                </span>
                <span className="font-mono text-xs text-muted">calibrated vs historical record</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-hot rounded-full"
                  style={{ width: `${b.confidence_calibrated * 100}%` }}
                />
              </div>
            </div>

            {/* Onchain Proof Liquid Card */}
            <div className="liquid-card-hot flex flex-col gap-2.5 p-6 border-cool/30">
              <span className="font-display text-lg font-bold text-cool-soft">
                Onchain Proof Ledger
              </span>
              <span className="break-all font-mono text-xs text-soft">
                Hash: {b.canonical_hash ?? "pending"}
              </span>
              {commit && (
                <span className="font-mono text-xs text-dim">
                  Committed {etTime(commit.confirmedAt)} ET · before public publish
                </span>
              )}
              {commit?.explorer_url && (
                <a
                  href={commit.explorer_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cool hover:underline pt-1"
                >
                  Verify on the network explorer →
                </a>
              )}
            </div>

            {/* Follow or Fade Voting */}
            <div className="liquid-card flex flex-col gap-4 p-6">
              <span className="font-display text-lg font-bold text-white">Follow or Fade?</span>
              <span className="text-xs text-muted leading-relaxed">
                Voting locks 30 min after basket publication. The crowd's sentiment is graded beside the AI at 9:45 ET.
              </span>
              <div className="flex gap-3">
                {(["follow", "fade"] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    disabled={!votingOpen}
                    aria-pressed={vote === side}
                    onClick={() => castVote(side)}
                    className={`min-h-10 flex-1 rounded-xl font-mono text-xs font-bold uppercase transition-all ${
                      vote === side
                        ? "liquid-pill-hot text-white shadow-[0_0_15px_rgba(255,107,0,0.3)]"
                        : "liquid-pill text-soft hover:text-white"
                    }`}
                  >
                    {side} · {votes[side] ?? 0}
                  </button>
                ))}
              </div>
              <span className="font-mono text-[11px] text-dim">
                {voteMsg ?? (votingOpen ? `Locks at ${etTime(vote_locks_at!)} ET` : "Voting closed")}
              </span>
            </div>

            {/* Past Macro Analogs */}
            <div className="liquid-card flex flex-col gap-3 p-6">
              <span className="font-display text-lg font-bold text-white">Historical Analogs</span>
              {analogs.length === 0 && (
                <span className="font-mono text-xs text-muted">
                  No similar past events logged yet. Analogs fill in as the public record grows.
                </span>
              )}
              {analogs.map((a) => (
                <div key={a.id} className="flex justify-between font-mono text-xs border-b border-white/5 pb-2">
                  <span className="text-soft truncate max-w-[200px]">{a.title}</span>
                  <span className="font-bold text-white">{a.ret == null ? "ungraded" : upDown(a.ret)}</span>
                </div>
              ))}
            </div>

            <Disclaimer />
          </aside>
        </div>
      </main>

      <BasketWeb3Modal
        isOpen={web3ModalOpen}
        onClose={() => setWeb3ModalOpen(false)}
        basketId={id}
        thesis={b.thesis}
        token={selectedWeb3Token.token}
        tokenName={selectedWeb3Token.name}
        sizeUSDG={size}
        tokenPrice={selectedWeb3Token.price}
        canonicalHash={b.canonical_hash ?? undefined}
      />
    </div>
  );
}
