import type { Metadata } from "next";
import { FeedClient } from "./FeedClient";

export const metadata: Metadata = { title: "Live feed" };

export default function FeedPage() {
  return <FeedClient />;
}
