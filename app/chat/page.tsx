import Link from "next/link";
import { AIChat8 } from "@/components/ai-chat-8";
import { AppNav } from "@/components/AppNav";

export const metadata = {
  title: "AI Voice Composer",
  description: "Voice composer with a live transcript and plain-English macro triggers for tokenized markets.",
};

export default function ChatPage() {
  return (
    <div className="universe-page fp-chat-page min-h-screen text-white flex flex-col">
      <AppNav live={true} />

      {/* Main Body */}
      <main className="fp-chat-main flex-1 mx-auto w-full max-w-[1360px] px-6 py-12 flex flex-col items-center">
        <div className="fp-chat-intro text-center max-w-3xl mb-8">
          <span className="fp-eyebrow">[ 06 ] · VOICE TO SIGNAL</span>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-hot/10 border border-hot/30 text-hot-soft text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-hot animate-ping"></span>
            Voice Composer · AI Chat 8 Live Transcript
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 font-display">
            Speak Your Overnight Macro Trade.
          </h1>
          <p className="text-muted text-base sm:text-lg leading-relaxed">
            Speak or type plain-English triggers. The AI compiles them into deterministic alert rules and checks fair value across tokenized sector ETFs.
          </p>
        </div>

        {/* AI Chat 8 Block */}
        <AIChat8 />
      </main>
    </div>
  );
}
