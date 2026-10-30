import type { Metadata } from "next";
import { BasketClient } from "./BasketClient";
import { LIVE_DATA_READY } from "@/lib/launch";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  if (!LIVE_DATA_READY) return { title: "Basket preview · Flashpoint" };
  const { id } = await params;
  try {
    const res = await fetch(`${API}/v1/baskets/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Basket" };
    const d = (await res.json()) as { basket: { thesis: string }; event: { title: string } | null };
    return { title: d.event?.title ?? "Basket", description: d.basket.thesis };
  } catch {
    return { title: "Basket" };
  }
}

export default async function BasketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BasketClient id={id} />;
}
