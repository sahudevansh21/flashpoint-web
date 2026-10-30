/** Wire types of the Flashpoint API (mirrors packages/core schemas). */

export interface Leg {
  token_symbol: string;
  token_address: string;
  underlying_ticker: string;
  weight: number;
  entry_quote_price: string;
  entry_quote_size_usdg: string;
  est_slippage_bps: number;
  fair_value: string;
  fv_gap_bps: number;
}

export interface Basket {
  id: string;
  event_id: string;
  created_at: string;
  published_at: string | null;
  thesis: string;
  direction: "long";
  legs: Leg[];
  confidence: number;
  confidence_calibrated: number;
  horizon: string;
  max_slip_bps: number;
  model_version: string;
  prompt_version: string;
  why_chain: string[];
  canonical_hash: string | null;
  commit_tx: string | null;
  status: "draft" | "published" | "graded" | "void";
  void_reason: string | null;
}

export interface GradeRow { basketId: string; ret: number; spyRet: number; vsSpy: number; hit: boolean; gradedAt: string; exitPx: Record<string, number> }

export interface FeedEvent {
  id: string;
  title: string;
  category: string | null;
  severity: number | null;
  sources_n: number;
  status: string;
  skip_reason: string | null;
  created_at: string;
  basket: Basket | null;
  grade: GradeRow | null;
}

export interface LiveToken {
  symbol: string; name: string; address: string; poolDepthUsdg: number;
  mid: number | null; fv: number | null; gapBps: number | null; frozen: boolean; ts: string | null;
}

export interface BasketDetail {
  basket: Basket;
  event: { id: string; title: string; category: string | null; severity: number | null; sourcesN: number } | null;
  sources: { title: string; url: string; source: string }[];
  commit: { hash: string; tx: string; dryRun: boolean; confirmedAt: string; explorer_url: string | null } | null;
  grade: GradeRow | null;
  live: Record<string, LiveToken>;
  votes: Partial<Record<"follow" | "fade", number>>;
  vote_locks_at: string | null;
  analogs: { id: string; title: string; category: string | null; ret: number | null }[];
}

export interface QuoteLeg {
  token: string; weight: number; eff_weight: number; amount_usdg: number; off: boolean;
  price?: number; mid?: number; fv?: number | null; gap_bps?: number | null; slippage_bps?: number; reason?: string;
}

export interface Scorecard {
  kpis: { graded: number; hit_rate: number | null; mean_alpha_pct: number | null; median_alpha_pct: number | null; worst_pct: number | null; voids: number };
  calibration: { range: string; n: number; hit_rate: number | null }[];
  by_category: { category: string; n: number; hit_rate: number }[];
  rows: { basket_id: string; graded_at: string; title: string; category: string | null; legs: string[]; ret_pct: number; vs_spy: number; hit: boolean; confidence: number; hash: string | null }[];
  voids: { id: string; reason: string | null; title: string; created_at: string }[];
}

export interface Status { market_open: boolean; next_open: string; latency_p50_ms: number | null; now: string }

export interface TriggerRule { categories: string[]; min_severity: number; entities: string[]; regions: string[]; channels: ("telegram" | "push" | "email")[] }
