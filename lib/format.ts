export const pct = (x: number, digits = 2) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(digits)}%`;
/** Never use colour alone for up and down: always a sign and a word. */
export const upDown = (x: number, digits = 2) => `${pct(x, digits)} ${x >= 0 ? "up" : "down"}`;
export const bps = (x: number) => `${x >= 0 ? "+" : "−"}${Math.abs(x)} bps ${x >= 0 ? "above" : "below"}`;
export const usd = (x: number, digits = 2) => `$${x.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
export const short = (h: string | null | undefined, n = 6) => (h ? `${h.slice(0, n + 2)}…${h.slice(-4)}` : "—");

export function etTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: false });
}

export function etDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });
}

export const CATEGORY_LABEL: Record<string, string> = {
  geopolitics_energy: "Energy",
  conflict_defense: "Defense",
  semis_export: "Semis",
  monetary_policy: "Rates",
  trade_tariffs: "Trade",
  china_macro: "China",
  crypto_regulation: "Crypto",
  health_policy: "Health",
  earnings_megacap: "Earnings",
  other: "Other",
};
