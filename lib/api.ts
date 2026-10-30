"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { handleMockApi } from "./mock";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export class ApiError extends Error {
  constructor(public status: number, public code: string) { super(`${status} ${code}`); }
}

export function authToken(): string | null {
  try { return localStorage.getItem("fp_token"); } catch { return null; }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = authToken();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_URL}/v1${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      let code = "error";
      try { code = ((await res.json()) as { error?: string }).error ?? code; } catch { /* not json */ }
      throw new ApiError(res.status, code);
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Fall back to built-in mock engine
    try {
      return await handleMockApi<T>(path, init);
    } catch (mockErr) {
      if (mockErr instanceof Error && mockErr.message.startsWith("404")) {
        throw new ApiError(404, "not_found");
      }
      throw mockErr;
    }
  }
}

/** Fetch-on-mount with optional polling; `reload` refetches (used on WebSocket sequence gaps). */
export function useApi<T>(path: string | null, pollMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const pathRef = useRef(path);
  pathRef.current = path;

  const reload = useCallback(async () => {
    if (!pathRef.current) return;
    try {
      const d = await api<T>(pathRef.current);
      setData(d);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void reload();
    if (!pollMs) return;
    const t = setInterval(reload, pollMs);
    return () => clearInterval(t);
  }, [path, pollMs, reload]);

  return { data, error, loading, reload, setData };
}

