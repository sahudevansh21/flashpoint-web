import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Space_Grotesk } from "next/font/google";
import { SiteAtmosphere } from "@/components/SiteAtmosphere";
import { ScrollLiftObserver } from "@/components/ScrollLiftObserver";
import { FlashpointPrivyProvider } from "@/lib/privy";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-space-grotesk" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Flashpoint · Overnight market intelligence", template: "%s · Flashpoint" },
  description: "Flashpoint turns market-moving headlines into transparent, liquidity-weighted ETF baskets and grades every signal in public.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#211710", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body suppressHydrationWarning className="min-h-screen">
        <FlashpointPrivyProvider>
          <SiteAtmosphere />
          <ScrollLiftObserver />
          <div className="site-content">{children}</div>
        </FlashpointPrivyProvider>
      </body>
    </html>
  );
}
