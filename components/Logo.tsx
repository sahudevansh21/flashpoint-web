import Link from "next/link";
import Image from "next/image";

export function Bolt({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

export function Logo({ size = 20 }: { size?: number }) {
  return (
    <Link href="/" aria-label="Flashpoint home" className="inline-flex shrink-0 items-center">
      <Image
        src="/brand/flashpoint-wordmark.png"
        alt="Flashpoint"
        width={300}
        height={100}
        priority
        className="h-auto w-auto object-contain"
        style={{ height: size + 14, maxWidth: "min(34vw, 180px)" }}
      />
    </Link>
  );
}
