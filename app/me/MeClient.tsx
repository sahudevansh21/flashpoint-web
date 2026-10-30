"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { Disclaimer } from "@/components/bits";
import { ApiError, api, authToken, useApi } from "@/lib/api";
import { CATEGORY_LABEL, upDown } from "@/lib/format";
import type { TriggerRule } from "@/lib/types";

interface User {
  id: string;
  wallet: string | null;
  tier: string;
  minSeverity: number;
  sectors: string[];
  channels: { telegram?: string; push?: boolean; email?: boolean };
  quietHours: { from: string; to: string } | null;
}
interface Trigger {
  id: string;
  nlText: string;
  compiledRule: TriggerRule;
  active: boolean;
}
interface Position {
  id: string;
  basket_id: string;
  thesis: string;
  size_usdg: number;
  pnl_pct: number;
  status: string;
}

const SECTORS = [
  "geopolitics_energy",
  "conflict_defense",
  "semis_export",
  "monetary_policy",
  "trade_tariffs",
  "china_macro",
  "crypto_regulation",
  "health_policy",
];

export function MeClient() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => setSignedIn(Boolean(authToken())), []);

  const user = useApi<User>(signedIn ? "/me" : null);
  const trig = useApi<Trigger[]>(signedIn ? "/me/triggers" : null);
  const pos = useApi<Position[]>(signedIn ? "/me/positions" : null, 15_000);
  const [text, setText] = useState("Ping me on chip export news above severity 3");
  const [rule, setRule] = useState<TriggerRule | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const save = async (patch: Partial<User>) => {
    if (!user.data) return;
    user.setData({ ...user.data, ...patch });
    await api("/me", { method: "PUT", body: JSON.stringify(patch) }).catch(
      (e) => setMsg((e as Error).message)
    );
  };

  const compile = async () => {
    setMsg(null);
    try {
      setRule(
        (
          await api<{ rule: TriggerRule }>("/me/triggers/compile", {
            method: "POST",
            body: JSON.stringify({ text }),
          })
        ).rule
      );
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const saveTrigger = async () => {
    if (!rule) return;
    try {
      await api("/me/triggers", {
        method: "POST",
        body: JSON.stringify({ text, rule }),
      });
      setRule(null);
      setMsg("Trigger saved successfully.");
      void trig.reload();
    } catch (e) {
      setMsg(
        e instanceof ApiError && e.code === "pro_required"
          ? "Custom triggers are a Pro feature (USDG or token)."
          : (e as Error).message
      );
    }
  };

  const enablePush = async () => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      setMsg("This browser doesn’t support web push.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setMsg("Notifications were not allowed.");
      return;
    }
    await navigator.serviceWorker.register("/sw.js");
    await save({ channels: { ...user.data?.channels, push: true } });
  };

  if (signedIn === false) {
    return (
      <div className="universe-page fp-alerts-page min-h-screen text-text">
        <AppNav />
      <main className="fp-subpage-main mx-auto flex max-w-[760px] flex-col gap-6 px-6 py-24 text-center">
          <div className="liquid-card flex flex-col items-center gap-4 p-10 border-white/10">
            <span className="font-mono text-xs font-semibold tracking-widest text-hot uppercase">
              AUTHENTICATION REQUIRED
            </span>
            <h1 className="m-0 font-display text-[36px] font-bold text-white">
              Alerts &amp; Custom Triggers
            </h1>
            <p className="text-muted text-base max-w-[500px] leading-relaxed">
              Connect your non-custodial wallet (top right) to configure instant alert channels, severity thresholds, watched sectors, and compile plain-English macro rules.
            </p>
            <Link href="/feed" className="liquid-glow-btn mt-2 rounded-xl px-6 py-2.5 text-xs font-bold">
              ← Return to Live Feed
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const u = user.data;

  return (
    <div className="universe-page fp-alerts-page min-h-screen text-text">
      <AppNav />

      <main className="fp-subpage-main mx-auto flex max-w-[1360px] flex-col gap-8 px-6 pt-8 pb-20">
        <div className="fp-subpage-hero flex flex-col gap-2 border-b border-white/[0.08] pb-6">
          <span className="font-mono text-xs font-semibold tracking-widest text-hot uppercase">
            NOTIFICATION DISPATCH &amp; MACRO RULES
          </span>
          <h1 className="m-0 font-display text-[34px] sm:text-[42px] font-bold tracking-tight text-white">
            Alert Channels &amp; AI Triggers
          </h1>
          <p className="m-0 text-sm sm:text-base text-muted max-w-[620px]">
            Choose where Flashpoint reaches you. All alerts dispatch onchain at the identical millisecond for everyone.
          </p>
        </div>

        {msg && (
          <div className="liquid-pill-hot p-4 rounded-xl font-mono text-xs font-semibold">
            {msg}
          </div>
        )}

        <div className="flex flex-wrap items-start gap-8">
          <div className="flex min-w-0 flex-[999_1_660px] flex-col gap-6">
            {/* Delivery Channels */}
            <section aria-label="Channels" className="liquid-card flex flex-col gap-5 p-7">
              <h2 className="m-0 font-display text-xl font-bold text-white">
                Dispatch Channels
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                <div className="flex flex-col">
                  <strong className="text-white font-semibold">Telegram Alert Bot</strong>
                  <span className="text-xs text-muted">Direct notification to your Telegram username</span>
                </div>
                <input
                  id="tg"
                  defaultValue={u?.channels.telegram ?? ""}
                  placeholder="@username"
                  onBlur={(e) => save({ channels: { ...u?.channels, telegram: e.target.value } })}
                  className="min-h-10 rounded-xl border border-white/10 bg-black/50 px-3 font-mono text-xs text-white placeholder:text-dim focus:border-hot"
                />
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <div className="flex flex-col">
                  <strong className="text-white font-semibold">Browser Push Notifications</strong>
                  <span className="text-xs text-muted">Lock-screen notifications with audio alert</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(u?.channels.push)}
                  onClick={() => (u?.channels.push ? save({ channels: { ...u.channels, push: false } }) : enablePush())}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer ${
                    u?.channels.push ? "bg-hot" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                      u?.channels.push ? "left-5.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                <div className="flex flex-col">
                  <strong className="text-white font-semibold">Morning Email Scorecard</strong>
                  <span className="text-xs text-muted">9:45 ET open receipt digest and P/L summary</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(u?.channels.email)}
                  onClick={() => save({ channels: { ...u?.channels, email: !u?.channels.email } })}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer ${
                    u?.channels.email ? "bg-hot" : "bg-white/15"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                      u?.channels.email ? "left-5.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Severity and Sectors Filter */}
            <section aria-label="Filters" className="liquid-card flex flex-col gap-5 p-7">
              <h2 className="m-0 font-display text-xl font-bold text-white">
                Severity &amp; Sector Scope
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                <span className="text-sm text-soft">Minimum Severity Threshold</span>
                <div role="group" aria-label="Minimum severity" className="flex gap-2">
                  {[3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={u?.minSeverity === n}
                      onClick={() => save({ minSeverity: n })}
                      className={`min-h-8 rounded-lg px-3.5 font-mono text-xs font-bold transition-all ${
                        u?.minSeverity === n
                          ? "liquid-pill-hot text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                          : "liquid-pill text-muted hover:text-white"
                      }`}
                    >
                      {n}+
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
                <span className="text-sm text-soft">Watched Sector Themes</span>
                <div className="flex flex-wrap gap-2">
                  {SECTORS.map((s) => {
                    const on = u?.sectors.includes(s) ?? false;
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={on}
                        onClick={() =>
                          save({
                            sectors: on
                              ? u!.sectors.filter((x) => x !== s)
                              : [...(u?.sectors ?? []), s],
                          })
                        }
                        className={`min-h-8 rounded-full px-3.5 font-mono text-xs uppercase tracking-wider transition-all ${
                          on
                            ? "liquid-pill-hot font-bold text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                            : "liquid-pill text-muted hover:text-white"
                        }`}
                      >
                        {CATEGORY_LABEL[s]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                <span className="text-sm text-soft">Quiet Hours (Local Time)</span>
                <div className="flex items-center gap-3 font-mono text-xs text-muted">
                  <label className="flex items-center gap-1.5">
                    From
                    <input
                      type="time"
                      defaultValue={u?.quietHours?.from ?? "23:00"}
                      onBlur={(e) =>
                        save({
                          quietHours: {
                            from: e.target.value,
                            to: u?.quietHours?.to ?? "07:00",
                          },
                        })
                      }
                      className="rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-white"
                    />
                  </label>
                  <label className="flex items-center gap-1.5">
                    To
                    <input
                      type="time"
                      defaultValue={u?.quietHours?.to ?? "07:00"}
                      onBlur={(e) =>
                        save({
                          quietHours: {
                            from: u?.quietHours?.from ?? "23:00",
                            to: e.target.value,
                          },
                        })
                      }
                      className="rounded-lg border border-white/10 bg-black/50 px-2 py-1 text-white"
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* Plain English Triggers */}
            <section aria-label="Custom triggers" className="liquid-card-hot flex flex-col gap-4 p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hot/30 pb-3">
                <h2 className="m-0 font-display text-xl font-bold text-white">
                  Plain-English AI Triggers
                </h2>
                <span className="rounded-full bg-hot/20 border border-hot/40 px-2.5 py-0.5 font-mono text-xs font-bold text-hot-soft">
                  Pro Feature
                </span>
              </div>

              <label htmlFor="trigger" className="text-sm text-soft">
                Describe the exact macroeconomic conditions or news events you want alerted on:
              </label>

              <div className="flex flex-wrap gap-2.5">
                <input
                  id="trigger"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-11 flex-[1_1_300px] rounded-xl border border-hot/30 bg-black/60 px-4 font-sans text-sm text-white placeholder:text-dim focus:border-hot"
                />
                <button
                  type="button"
                  onClick={compile}
                  className="liquid-glow-btn rounded-xl px-5 py-2.5 text-xs font-bold text-black"
                >
                  Compile Rule →
                </button>
              </div>

              {rule && (
                <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs">
                  <span className="text-muted">Claude compiled the following deterministic rule schema:</span>
                  <pre className="m-0 overflow-x-auto text-hot-soft">{JSON.stringify(rule, null, 2)}</pre>
                  <button
                    type="button"
                    onClick={saveTrigger}
                    className="liquid-glow-btn self-start rounded-xl px-4 py-2 font-bold text-xs"
                  >
                    Confirm &amp; Save Trigger
                  </button>
                </div>
              )}

              {trig.data?.filter((t) => t.active).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-4 border-t border-hot/20 pt-3 text-sm font-sans"
                >
                  <span className="text-white font-medium">{t.nlText}</span>
                  <button
                    type="button"
                    onClick={async () => {
                      await api(`/me/triggers/${t.id}`, { method: "DELETE" });
                      void trig.reload();
                    }}
                    className="liquid-pill px-3 py-1 font-mono text-xs text-hot-soft hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </section>
          </div>

          {/* Right Sidebar */}
          <aside className="flex min-w-0 flex-[1_1_340px] flex-col gap-6">
            {/* Tracked Positions */}
            <div className="liquid-card flex flex-col gap-3.5 p-6">
              <span className="font-display text-lg font-bold text-white">Tracked Overnight Baskets</span>
              {pos.data?.length === 0 && (
                <span className="font-mono text-xs text-muted leading-relaxed">
                  Tap “Swap in Wallet” on any live basket and it is automatically tracked here against your quoted DEX entry.
                </span>
              )}
              {pos.data?.map((p) => (
                <Link
                  key={p.id}
                  href={`/b/${p.basket_id}`}
                  className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 border border-white/5 text-xs font-mono hover:border-white/20 transition-colors"
                >
                  <span className="text-soft truncate max-w-[180px]">{p.thesis}</span>
                  <span className={`font-bold ${p.pnl_pct >= 0 ? "text-hot" : "text-cool"}`}>
                    {upDown(p.pnl_pct, 1)}
                  </span>
                </Link>
              ))}
              <span className="font-mono text-[11px] text-dim border-t border-white/5 pt-2">
                Simulated execution with realistic slippage. Scorecard receipt issued at 9:45 ET.
              </span>
            </div>

            {/* Plan Tier Liquid Card */}
            <div className="liquid-card flex flex-col gap-3.5 p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-display text-lg font-bold text-white">Membership Tier</span>
                <span className="font-mono text-xs font-bold text-hot uppercase">
                  {u?.tier === "pro" ? "Pro Plan" : "Free Plan"}
                </span>
              </div>
              <div className="flex flex-col gap-2 font-mono text-xs">
                {[
                  ["Live feed, baskets & scorecard", "Free"],
                  ["Telegram & web push alerts", "Free"],
                  ["Custom plain-English triggers", "Pro"],
                  ["Historical analogs & Night Replay", "Pro"],
                  ["Agent API key access", "Pro"],
                ].map(([f, t]) => (
                  <div key={f} className="flex justify-between text-soft">
                    <span>{f}</span>
                    <span className={t === "Pro" ? "text-hot font-bold" : "text-cool font-bold"}>
                      {t}
                    </span>
                  </div>
                ))}
              </div>
              <span className="font-mono text-[11px] text-dim border-t border-white/5 pt-2">
                No tier or token holder receives baskets before the public. Equal-latency guarantee.
              </span>
            </div>

            <Disclaimer />
          </aside>
        </div>
      </main>
    </div>
  );
}
