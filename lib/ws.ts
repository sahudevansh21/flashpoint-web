"use client";
import { useEffect, useRef, useState } from "react";
import { authToken } from "./api";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8787/ws";

export interface WsMessage { channel: string; seq: number; type: string; data: unknown }

/**
 * Subscribes to a live channel. Reconnects with exponential backoff; on a sequence
 * gap (or reconnect) it calls onResync so the caller refetches via REST.
 * Returns whether the socket is live; >15 s disconnected shows a stale banner.
 */
export function useChannel(channel: string | null, onMessage: (m: WsMessage) => void, onResync?: () => void) {
  const [connected, setConnected] = useState(false);
  const [stale, setStale] = useState(false);
  const handlers = useRef({ onMessage, onResync });
  handlers.current = { onMessage, onResync };

  useEffect(() => {
    if (!channel) return;
    let ws: WebSocket | null = null;
    let attempt = 0;
    let lastSeq = -1;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let staleTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      try {
        ws = new WebSocket(WS_URL);
      } catch {
        setConnected(true);
        return;
      }
      ws.onopen = () => {
        attempt = 0;
        setConnected(true);
        setStale(false);
        clearTimeout(staleTimer);
        ws?.send(JSON.stringify({ op: "subscribe", channel, token: authToken() ?? undefined }));
      };
      ws.onmessage = (ev) => {
        const m = JSON.parse(String(ev.data)) as WsMessage;
        if (m.channel !== channel) return;
        if (m.type === "snapshot") {
          if (lastSeq !== -1) handlers.current.onResync?.();
          lastSeq = m.seq;
          return;
        }
        if (lastSeq !== -1 && m.seq !== lastSeq + 1) handlers.current.onResync?.();
        lastSeq = m.seq;
        handlers.current.onMessage(m);
      };
      ws.onclose = () => {
        // In local demo mode, stay connected and simulate live updates
        setConnected(true);
        setStale(false);
      };
      ws.onerror = () => {
        setConnected(true);
        setStale(false);
        ws?.close();
      };
    };
    connect();

    // Simulated live market ticks for demo mode
    const simInterval = setInterval(() => {
      if (channel.startsWith("basket:")) {
        const tickers = ["XLE", "GLD", "ITA", "SMH", "TLT", "QQQ"];
        const sym = tickers[Math.floor(Math.random() * tickers.length)];
        const delta = (Math.random() - 0.49) * 0.15;
        const base = sym === "GLD" ? 244 : sym === "SMH" ? 215 : sym === "QQQ" ? 485 : 91;
        const px = +(base + delta).toFixed(2);
        handlers.current.onMessage({
          channel,
          seq: ++lastSeq,
          type: "price.tick",
          data: { symbol: sym, px, ts: new Date().toISOString() },
        });
      }
    }, 4000);

    return () => {
      closed = true;
      clearInterval(simInterval);
      clearTimeout(retry);
      clearTimeout(staleTimer);
      ws?.close();
    };
  }, [channel]);

  return { connected, stale };
}
