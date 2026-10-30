import type { FeedEvent, Scorecard, Status, BasketDetail, LiveToken } from "./types";

/* ────────────────────────────────────────────────
   MOCK DATA — all numbers are fabricated samples.
   ──────────────────────────────────────────────── */

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86_400_000).toISOString();
const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString();
const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString();

export const MOCK_STATUS: Status = {
  market_open: false,
  next_open: new Date(Date.now() + 6 * 3_600_000).toISOString(),
  latency_p50_ms: 12400,
  now,
};

const makeLeg = (ticker: string, weight: number, addr = "0x0000000000000000000000000000000000000000") => ({
  token_symbol: `r${ticker}`,
  token_address: addr,
  underlying_ticker: ticker,
  weight,
  entry_quote_price: "1.0000",
  entry_quote_size_usdg: "1000",
  est_slippage_bps: 12,
  fair_value: "1.0012",
  fv_gap_bps: 3,
});

export const MOCK_FEED_EVENTS: FeedEvent[] = [
  {
    id: "evt-001",
    title: "Tanker attacked near the Strait of Hormuz; insurers pause Gulf coverage",
    category: "geopolitics_energy",
    severity: 4,
    sources_n: 3,
    status: "published",
    skip_reason: null,
    created_at: now,
    basket: {
      id: "bsk-001",
      event_id: "evt-001",
      created_at: now,
      published_at: now,
      thesis: "Shipping risk lifts oil and gold; defense names follow on escalation.",
      direction: "long",
      legs: [makeLeg("XLE", 0.45), makeLeg("GLD", 0.3), makeLeg("ITA", 0.25)],
      confidence: 0.72,
      confidence_calibrated: 0.68,
      horizon: "overnight",
      max_slip_bps: 200,
      model_version: "v0.3.1",
      prompt_version: "p4",
      why_chain: ["Strait of Hormuz attack", "Insurance withdrawal = supply squeeze", "Oil up → XLE", "Risk-off → GLD", "Escalation → ITA"],
      canonical_hash: "0x8f3a5d2e00000000c21e7fa4b3dc0619a5e1b6c2d8f4a3e7",
      commit_tx: "0xab12cd34ef56...",
      status: "published",
      void_reason: null,
    },
    grade: null,
  },
  {
    id: "evt-002",
    title: "Fed official hints at emergency rate pause in Asia interview",
    category: "monetary_policy",
    severity: 3,
    sources_n: 2,
    status: "published",
    skip_reason: null,
    created_at: new Date(Date.now() - 3_600_000).toISOString(),
    basket: {
      id: "bsk-002",
      event_id: "evt-002",
      created_at: new Date(Date.now() - 3_600_000).toISOString(),
      published_at: new Date(Date.now() - 3_500_000).toISOString(),
      thesis: "Dovish surprise lifts rate-sensitive duration assets; TLT and tech benefit.",
      direction: "long",
      legs: [makeLeg("TLT", 0.5), makeLeg("QQQ", 0.3), makeLeg("XLF", 0.2)],
      confidence: 0.58,
      confidence_calibrated: 0.55,
      horizon: "overnight",
      max_slip_bps: 200,
      model_version: "v0.3.1",
      prompt_version: "p4",
      why_chain: ["Fed rate pause signal", "Duration rally", "Tech re-rates higher"],
      canonical_hash: "0x4c2f8e1b00000000a92d3f5c1e8b7a6d",
      commit_tx: "0xef78ab90cd12...",
      status: "published",
      void_reason: null,
    },
    grade: null,
  },
  {
    id: "evt-003",
    title: "China halts rare-earth exports to three NATO members",
    category: "semis_export",
    severity: 5,
    sources_n: 5,
    status: "published",
    skip_reason: null,
    created_at: yesterday,
    basket: {
      id: "bsk-003",
      event_id: "evt-003",
      created_at: yesterday,
      published_at: yesterday,
      thesis: "Supply shock for semis and defense. Short-term pain, long-term reshoring.",
      direction: "long",
      legs: [makeLeg("SMH", 0.35), makeLeg("ITA", 0.35), makeLeg("GLD", 0.3)],
      confidence: 0.81,
      confidence_calibrated: 0.76,
      horizon: "overnight",
      max_slip_bps: 200,
      model_version: "v0.3.1",
      prompt_version: "p4",
      why_chain: ["Rare-earth export ban", "Semis input shortage", "Defense reliance", "Safe haven"],
      canonical_hash: "0x7d4a2e6c00000000b8f1c3d5e2a94b8c",
      commit_tx: "0x1234abcd5678...",
      status: "graded",
      void_reason: null,
    },
    grade: { basketId: "bsk-003", ret: 1.82, spyRet: 0.34, vsSpy: 1.48, hit: true, gradedAt: yesterday, exitPx: {} },
  },
  {
    id: "evt-004",
    title: "Minor earthquake reported near Yellowstone — no damage",
    category: "other",
    severity: 1,
    sources_n: 1,
    status: "skipped",
    skip_reason: "Severity 1 — below the 3+ threshold for a basket.",
    created_at: new Date(Date.now() - 7_200_000).toISOString(),
    basket: null,
    grade: null,
  },
  {
    id: "evt-005",
    title: "US bans semiconductor exports to two more Chinese firms",
    category: "trade_tariffs",
    severity: 4,
    sources_n: 4,
    status: "published",
    skip_reason: null,
    created_at: twoDaysAgo,
    basket: {
      id: "bsk-005",
      event_id: "evt-005",
      created_at: twoDaysAgo,
      published_at: twoDaysAgo,
      thesis: "Export controls tighten; US semis dip short-term, reshoring names benefit.",
      direction: "long",
      legs: [makeLeg("SMH", 0.4), makeLeg("SOXX", 0.35), makeLeg("XLI", 0.25)],
      confidence: 0.65,
      confidence_calibrated: 0.62,
      horizon: "overnight",
      max_slip_bps: 200,
      model_version: "v0.3.1",
      prompt_version: "p4",
      why_chain: ["Export ban", "Semis supply chain", "Reshoring beneficiaries"],
      canonical_hash: "0x5e3b1a9d00000000c7f2d8e4a1b6c3f5",
      commit_tx: "0xabcdef123456...",
      status: "graded",
      void_reason: null,
    },
    grade: { basketId: "bsk-005", ret: -0.45, spyRet: 0.12, vsSpy: -0.57, hit: false, gradedAt: twoDaysAgo, exitPx: {} },
  },
  {
    id: "evt-006",
    title: "Saudi Arabia announces surprise OPEC+ production cut",
    category: "geopolitics_energy",
    severity: 4,
    sources_n: 6,
    status: "published",
    skip_reason: null,
    created_at: threeDaysAgo,
    basket: {
      id: "bsk-006",
      event_id: "evt-006",
      created_at: threeDaysAgo,
      published_at: threeDaysAgo,
      thesis: "Supply cut bullish for energy, negative for consumer discretionary.",
      direction: "long",
      legs: [makeLeg("XLE", 0.55), makeLeg("XOP", 0.25), makeLeg("GLD", 0.2)],
      confidence: 0.74,
      confidence_calibrated: 0.71,
      horizon: "overnight",
      max_slip_bps: 200,
      model_version: "v0.3.1",
      prompt_version: "p4",
      why_chain: ["OPEC+ cut", "Supply squeeze", "Energy rally"],
      canonical_hash: "0x9f2c4d8a00000000e1b3a5c7d2f4e6a8",
      commit_tx: "0x987654fedcba...",
      status: "graded",
      void_reason: null,
    },
    grade: { basketId: "bsk-006", ret: 2.31, spyRet: -0.15, vsSpy: 2.46, hit: true, gradedAt: threeDaysAgo, exitPx: {} },
  },
];

export const MOCK_SCORECARD: Scorecard = {
  kpis: {
    graded: 14,
    hit_rate: 0.64,
    mean_alpha_pct: 0.0082,
    median_alpha_pct: 0.0065,
    worst_pct: -2.1,
    voids: 2,
  },
  calibration: [
    { range: "0.4–0.5", n: 3, hit_rate: 0.33 },
    { range: "0.5–0.6", n: 4, hit_rate: 0.5 },
    { range: "0.6–0.7", n: 4, hit_rate: 0.75 },
    { range: "0.7+", n: 3, hit_rate: 1.0 },
  ],
  by_category: [
    { category: "geopolitics_energy", n: 5, hit_rate: 0.8 },
    { category: "conflict_defense", n: 3, hit_rate: 0.67 },
    { category: "semis_export", n: 3, hit_rate: 0.67 },
    { category: "monetary_policy", n: 2, hit_rate: 0.5 },
    { category: "trade_tariffs", n: 1, hit_rate: 0.0 },
  ],
  rows: [
    { basket_id: "bsk-003", graded_at: yesterday, title: "China halts rare-earth exports to three NATO members", category: "semis_export", legs: ["SMH", "ITA", "GLD"], ret_pct: 1.82, vs_spy: 1.48, hit: true, confidence: 0.81, hash: "0x7d4a2e6c..." },
    { basket_id: "bsk-005", graded_at: twoDaysAgo, title: "US bans semiconductor exports to two more Chinese firms", category: "trade_tariffs", legs: ["SMH", "SOXX", "XLI"], ret_pct: -0.45, vs_spy: -0.57, hit: false, confidence: 0.65, hash: "0x5e3b1a9d..." },
    { basket_id: "bsk-006", graded_at: threeDaysAgo, title: "Saudi Arabia announces surprise OPEC+ production cut", category: "geopolitics_energy", legs: ["XLE", "XOP", "GLD"], ret_pct: 2.31, vs_spy: 2.46, hit: true, confidence: 0.74, hash: "0x9f2c4d8a..." },
  ],
  voids: [
    { id: "bsk-void-1", reason: "duplicate event", title: "Duplicate: Hormuz follow-up (same event cluster)", created_at: yesterday },
  ],
};

export const MOCK_LIVE_TOKENS: LiveToken[] = [
  { symbol: "rXLE", name: "Energy Select Sector", address: "0x...", poolDepthUsdg: 250000, mid: 91.20, fv: 91.45, gapBps: -27, frozen: false, ts: now },
  { symbol: "rGLD", name: "SPDR Gold Shares", address: "0x...", poolDepthUsdg: 320000, mid: 244.10, fv: 243.80, gapBps: 12, frozen: false, ts: now },
  { symbol: "rITA", name: "iShares US Aerospace & Defense", address: "0x...", poolDepthUsdg: 80000, mid: 133.50, fv: 134.00, gapBps: -37, frozen: false, ts: now },
  { symbol: "rSMH", name: "VanEck Semiconductor", address: "0x...", poolDepthUsdg: 180000, mid: 215.30, fv: 214.90, gapBps: 19, frozen: false, ts: now },
  { symbol: "rQQQ", name: "Invesco QQQ Trust", address: "0x...", poolDepthUsdg: 500000, mid: 484.70, fv: 485.10, gapBps: -8, frozen: false, ts: now },
  { symbol: "rTLT", name: "iShares 20+ Year Treasury", address: "0x...", poolDepthUsdg: 220000, mid: 88.60, fv: 88.42, gapBps: 20, frozen: false, ts: now },
  { symbol: "rSPY", name: "SPDR S&P 500", address: "0x...", poolDepthUsdg: 700000, mid: 585.20, fv: 585.50, gapBps: -5, frozen: false, ts: now },
  { symbol: "rXOP", name: "SPDR Oil & Gas Exploration", address: "0x...", poolDepthUsdg: 75000, mid: 138.90, fv: 141.00, gapBps: -149, frozen: false, ts: now },
];

export function getMockBasketDetail(id: string): BasketDetail | null {
  const ev = MOCK_FEED_EVENTS.find((e) => e.basket?.id === id);
  if (!ev || !ev.basket) return null;
  const b = ev.basket;
  const liveMap: Record<string, LiveToken> = {};
  for (const l of b.legs) {
    const tok = MOCK_LIVE_TOKENS.find((t) => t.symbol === `r${l.underlying_ticker}`);
    if (tok) liveMap[l.underlying_ticker] = tok;
  }
  return {
    basket: b,
    event: { id: ev.id, title: ev.title, category: ev.category, severity: ev.severity, sourcesN: ev.sources_n },
    sources: [
      { title: "Reuters breaking wire", url: "https://reuters.com", source: "Reuters" },
      { title: "Bloomberg terminal alert", url: "https://bloomberg.com", source: "Bloomberg" },
    ],
    commit: {
      hash: b.canonical_hash ?? "",
      tx: b.commit_tx ?? "",
      dryRun: true,
      confirmedAt: b.created_at,
      explorer_url: null,
    },
    grade: ev.grade,
    live: liveMap,
    votes: { follow: 34, fade: 12 },
    vote_locks_at: new Date(Date.now() + 1_800_000).toISOString(),
    analogs: [
      { id: "a1", title: "2024 Houthi Red Sea shipping attack", category: "geopolitics_energy", ret: 1.4 },
      { id: "a2", title: "2019 Saudi Aramco drone strike", category: "geopolitics_energy", ret: 3.2 },
    ],
  };
}

let mockUser = {
  id: "u-mock-001",
  wallet: "0x71C836eB542d99d37B8559D1E8FDbffEb39aBC12",
  tier: "pro",
  minSeverity: 3,
  sectors: ["geopolitics_energy", "semis_export", "conflict_defense"],
  channels: { push: true, email: true, telegram: "@alpha_trader" },
  quietHours: null,
};

let mockTriggers = [
  {
    id: "trig-001",
    nlText: "Ping me on chip export news above severity 3",
    compiledRule: {
      categories: ["semis_export"],
      min_severity: 3,
      entities: ["SMH", "NVDA"],
      regions: ["Asia", "US"],
      channels: ["push", "telegram"] as ("push" | "telegram" | "email")[],
    },
    active: true,
  },
  {
    id: "trig-002",
    nlText: "Alert on Middle East energy disruption",
    compiledRule: {
      categories: ["geopolitics_energy"],
      min_severity: 4,
      entities: ["XLE", "GLD"],
      regions: ["Middle East"],
      channels: ["push"] as ("push" | "telegram" | "email")[],
    },
    active: true,
  },
];

let mockPositions = [
  {
    id: "pos-001",
    basket_id: "bsk-001",
    thesis: "Shipping risk lifts oil and gold; defense names follow on escalation.",
    size_usdg: 1000,
    pnl_pct: 2.4,
    status: "open",
  },
  {
    id: "pos-002",
    basket_id: "bsk-006",
    thesis: "Supply cut bullish for energy, negative for consumer discretionary.",
    size_usdg: 2500,
    pnl_pct: 4.12,
    status: "closed",
  },
];

export async function handleMockApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = new URL(path.startsWith("http") ? path : `http://localhost${path}`);
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  const method = (init.method || "GET").toUpperCase();

  // Status
  if (pathname === "/status") {
    return MOCK_STATUS as T;
  }

  // Feed
  if (pathname === "/feed") {
    const sector = searchParams.get("sector");
    const severity = Number(searchParams.get("severity") || "0");
    let evs = [...MOCK_FEED_EVENTS];
    if (sector && sector !== "all") {
      evs = evs.filter((e) => e.category === sector);
    }
    if (severity > 0) {
      evs = evs.filter((e) => (e.severity ?? 0) >= severity);
    }
    return { events: evs } as T;
  }

  // Fair Value
  if (pathname === "/fairvalue") {
    return { tokens: MOCK_LIVE_TOKENS } as T;
  }

  // Scorecard
  if (pathname === "/scorecard") {
    return MOCK_SCORECARD as T;
  }

  // Basket Detail: /baskets/:id
  const basketMatch = pathname.match(/^\/baskets\/([^/]+)$/);
  if (basketMatch) {
    const bId = basketMatch[1];
    const detail = getMockBasketDetail(bId);
    if (!detail) {
      throw new Error("404 Basket not found");
    }
    return detail as T;
  }

  // Basket Quote: /baskets/:id/quote
  const quoteMatch = pathname.match(/^\/baskets\/([^/]+)\/quote$/);
  if (quoteMatch) {
    const bId = quoteMatch[1];
    const detail = getMockBasketDetail(bId);
    if (!detail) throw new Error("404 Basket not found");
    const size = Number(searchParams.get("usdg") || "1000");
    const legs = detail.basket.legs.map((l) => {
      const tok = MOCK_LIVE_TOKENS.find((t) => t.symbol === `r${l.underlying_ticker}`);
      const mid = tok?.mid ?? 100;
      const fv = tok?.fv ?? mid * 1.001;
      const gap_bps = tok?.gapBps ?? -15;
      return {
        token: l.token_address,
        weight: l.weight,
        eff_weight: l.weight,
        amount_usdg: Math.round(size * l.weight),
        off: false,
        price: mid,
        mid,
        fv,
        gap_bps,
        slippage_bps: 12 + Math.round((size / 10000) * 8),
      };
    });
    return { legs, quoted_at: new Date().toISOString() } as T;
  }

  // Basket Trade Links: /baskets/:id/links
  const linksMatch = pathname.match(/^\/baskets\/([^/]+)\/links$/);
  if (linksMatch) {
    const bId = linksMatch[1];
    const detail = getMockBasketDetail(bId);
    const links = (detail?.basket.legs || []).map((l) => ({
      token: l.token_address,
      uniswap: `https://app.uniswap.org/#/swap?outputCurrency=${l.token_address}&chain=arbitrum`,
    }));
    return { links } as T;
  }

  // Basket Vote: /baskets/:id/vote
  const voteMatch = pathname.match(/^\/baskets\/([^/]+)\/vote$/);
  if (voteMatch) {
    return { ok: true } as T;
  }

  // Auth Nonce (Privy session fallback)
  if (pathname === "/auth/nonce") {
    return {
      nonce: "0x" + Math.random().toString(16).slice(2) + "deadbeef",
      message: "Flashpoint Privy Session " + Date.now(),
    } as T;
  }

  // Auth Wallet
  if (pathname === "/auth/wallet") {
    return {
      token: "mock_jwt_token_" + Date.now(),
    } as T;
  }

  // Me Profile
  if (pathname === "/me") {
    if (method === "PUT") {
      try {
        const patch = init.body ? JSON.parse(String(init.body)) : {};
        mockUser = { ...mockUser, ...patch };
      } catch {}
      return mockUser as T;
    }
    return mockUser as T;
  }

  // Me Triggers
  if (pathname === "/me/triggers") {
    if (method === "POST") {
      try {
        const body = init.body ? JSON.parse(String(init.body)) : {};
        const newTrig = {
          id: `trig-${Date.now()}`,
          nlText: body.text || "Custom alert trigger",
          compiledRule: body.rule || { categories: ["geopolitics_energy"], min_severity: 3, entities: [], regions: [], channels: ["push"] },
          active: true,
        };
        mockTriggers.unshift(newTrig);
        return newTrig as T;
      } catch {}
    }
    return mockTriggers as T;
  }

  // Me Triggers Compile
  if (pathname === "/me/triggers/compile") {
    const body = init.body ? JSON.parse(String(init.body)) : {};
    const text = (body.text || "").toLowerCase();
    const categories: string[] = [];
    if (text.includes("chip") || text.includes("semi")) categories.push("semis_export");
    if (text.includes("oil") || text.includes("energy") || text.includes("gulf") || text.includes("hormuz")) categories.push("geopolitics_energy");
    if (text.includes("war") || text.includes("defense") || text.includes("military")) categories.push("conflict_defense");
    if (text.includes("rate") || text.includes("fed") || text.includes("powell")) categories.push("monetary_policy");
    if (categories.length === 0) categories.push("geopolitics_energy");

    const rule = {
      categories,
      min_severity: text.includes("4") ? 4 : text.includes("5") ? 5 : 3,
      entities: [],
      regions: [],
      channels: ["push", "telegram"],
    };
    return { rule } as T;
  }

  // Me Positions
  if (pathname === "/me/positions") {
    if (method === "POST") {
      try {
        const body = init.body ? JSON.parse(String(init.body)) : {};
        const newPos = {
          id: `pos-${Date.now()}`,
          basket_id: body.basket_id || "bsk-001",
          thesis: "Live paper trading basket execution",
          size_usdg: body.size_usdg || 1000,
          pnl_pct: +(Math.random() * 2 - 0.5).toFixed(2),
          status: "open",
        };
        mockPositions.unshift(newPos);
        return newPos as T;
      } catch {}
    }
    return mockPositions as T;
  }

  return {} as T;
}

