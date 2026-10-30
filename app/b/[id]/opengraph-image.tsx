import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Flashpoint basket receipt";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

interface D {
  basket: { thesis: string; legs: { underlying_ticker: string; weight: number }[]; canonical_hash: string | null };
  event: { title: string; severity: number | null } | null;
  grade: { ret: number; vsSpy: number; hit: boolean } | null;
}

/** Receipt card for X and Telegram: one per basket, win or loss. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let d: D | null = null;
  try { const r = await fetch(`${API}/v1/baskets/${id}`); if (r.ok) d = (await r.json()) as D; } catch { /* render fallback */ }
  const g = d?.grade;
  const sign = (x: number) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(2)}%`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0d1017", color: "#f3f0e9", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, fontWeight: 700 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#ff8a3d", display: "flex" }} />
          {`Flashpoint ${g ? "· graded at the open" : "· live basket"}`}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.15 }}>{d?.event?.title ?? "Flashpoint basket"}</div>
          <div style={{ fontSize: 28, color: "#c9cfda" }}>{d?.basket.thesis ?? ""}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 14 }}>
            {(d?.basket.legs ?? []).map((l) => (
              <div key={l.underlying_ticker} style={{ display: "flex", border: "2px solid #343c50", borderRadius: 12, padding: "10px 16px", fontSize: 28 }}>
                {`${l.underlying_ticker} ${Math.round(l.weight * 100)}%`}
              </div>
            ))}
          </div>
          {g ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <div style={{ fontSize: 76, fontWeight: 700, color: g.ret >= 0 ? "#ffb27f" : "#7db8ff" }}>{`${sign(g.ret)} ${g.ret >= 0 ? "up" : "down"}`}</div>
              <div style={{ fontSize: 26, color: "#c9cfda" }}>{`${sign(g.vsSpy)} vs SPY · ${g.hit ? "Hit" : "Miss"}`}</div>
            </div>
          ) : (
            <div style={{ fontSize: 24, color: "#7db8ff" }}>{`committed ${d?.basket.canonical_hash?.slice(0, 12) ?? ""}…`}</div>
          )}
        </div>
      </div>
    ),
    size,
  );
}
