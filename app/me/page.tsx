import type { Metadata } from "next";
import { MeClient } from "./MeClient";

export const metadata: Metadata = { title: "Alerts and triggers" };

export default function MePage() {
  return <MeClient />;
}
