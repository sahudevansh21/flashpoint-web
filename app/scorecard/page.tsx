import type { Metadata } from "next";
import { ScorecardClient } from "./ScorecardClient";

export const metadata: Metadata = { title: "Public scorecard" };

export default function ScorecardPage() {
  return <ScorecardClient />;
}
