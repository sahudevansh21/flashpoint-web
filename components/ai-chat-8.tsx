"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Mic, MicOff, Send, Volume2, Sparkles, Radio, Check, RefreshCw, X, Play, Pause, ChevronRight, Bell, Shield, ArrowUpRight } from "lucide-react";

export interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isVoice?: boolean;
  audioDuration?: string;
  compiledTrigger?: {
    category: string;
    severityMin: number;
    targetTokens: string[];
    channels: string[];
    status: "active" | "draft";
  };
  basketPreview?: {
    id: string;
    title: string;
    severity: number;
    legs: { symbol: string; weight: number }[];
    confidence: number;
  };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender: "ai",
    text: "Welcome to Flashpoint AI Voice Terminal. I monitor overnight wires, calculate ETF fair-value drift, and compile plain-English macro triggers. Tap the microphone or type below.",
    timestamp: "16:02 ET",
  },
  {
    id: "msg-2",
    sender: "user",
    text: "Ping me if Middle East crude shipping risk creates more than 150 bps fair value drift on rXLE.",
    timestamp: "16:04 ET",
    isVoice: true,
    audioDuration: "0:06",
  },
  {
    id: "msg-3",
    sender: "ai",
    text: "Compiled natural-language rule for Geopolitics & Energy. When rXLE diverges >150 bps from synthetic fair value, you will receive an instant Push & Telegram alert with prefilled DEX swap links.",
    timestamp: "16:04 ET",
    compiledTrigger: {
      category: "geopolitics_energy",
      severityMin: 3,
      targetTokens: ["rXLE", "rXOP", "rGLD"],
      channels: ["Web Push", "Telegram"],
      status: "active",
    },
    basketPreview: {
      id: "bsk-001",
      title: "Tanker attacked near Strait of Hormuz; maritime insurers pause coverage",
      severity: 4,
      legs: [
        { symbol: "rXLE", weight: 45 },
        { symbol: "rGLD", weight: 30 },
        { symbol: "rITA", weight: 25 },
      ],
      confidence: 68,
    },
  },
];

const SUGGESTIONS = [
  "Ping me on chip export news above severity 3",
  "Summarize overnight fair-value drift on tech ETFs",
  "Alert if 10Y Treasury yield drops 10 bps before 9:30 AM",
  "Generate morning voice brief for today's market open",
];

export function AIChat8({ onClose, active = true }: { onClose?: () => void; active?: boolean } = {}) {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [transcriptError, setTranscriptError] = useState("");
  const [isPlayingBrief, setIsPlayingBrief] = useState(false);
  const [briefTime, setBriefTime] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const transcriptRef = useRef("");
  const finalTranscriptRef = useRef("");
  const recordDurationRef = useRef(0);
  const speechErrorRef = useRef(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) recognitionRef.current?.stop();
  }, [active]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    const chatBody = chatBodyRef.current;
    if (!chatBody) return;
    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [messages, liveTranscript]);

  // Audio Waveform Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      const numBars = 36;
      const barWidth = 3;
      const gap = (width - numBars * barWidth) / (numBars - 1);

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + gap);
        // If recording, animate lively frequency bars; otherwise gentle idle shimmer
        const freq = isRecording
          ? Math.sin(phase + i * 0.35) * Math.cos(phase * 0.8 + i * 0.2)
          : Math.sin(phase * 0.5 + i * 0.2) * 0.3;

        const barHeight = isRecording
          ? Math.max(6, Math.abs(freq) * (height * 0.85))
          : Math.max(4, Math.abs(freq) * (height * 0.35) + 6);

        const y = centerY - barHeight / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isRecording) {
          grad.addColorStop(0, "#ffb88a");
          grad.addColorStop(1, "#ff8a3d");
        } else {
          grad.addColorStop(0, "rgba(255, 138, 61, 0.4)");
          grad.addColorStop(1, "rgba(125, 184, 255, 0.3)");
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      phase += isRecording ? 0.15 : 0.04;
      animationFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRecording]);

  // Handle Recording Toggle (Voice Composer)
  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingAndSend();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    const SpeechRecognition = (window as SpeechWindow).SpeechRecognition ?? (window as SpeechWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscriptError("Live speech transcription is not supported in this browser. You can type your trigger instead.");
      return;
    }

    setTranscriptError("");
    speechErrorRef.current = false;
    transcriptRef.current = "";
    finalTranscriptRef.current = "";
    recordDurationRef.current = 0;
    setRecordDuration(0);
    setLiveTranscript("");
    setIsRecording(true);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      finalTranscriptRef.current += final;
      const transcript = `${finalTranscriptRef.current}${interim}`.trim();
      transcriptRef.current = transcript;
      setLiveTranscript(transcript);
    };
    recognition.onerror = (event) => {
      speechErrorRef.current = true;
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
      setTranscriptError(event.error === "not-allowed"
        ? "Microphone access is blocked. Allow microphone access or type your trigger instead."
        : "Speech recognition stopped. Please try again or type your trigger.");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;

      const transcribed = transcriptRef.current.trim();
      if (speechErrorRef.current || !transcribed) return;

      const durationStr = `0:${String(Math.max(1, recordDurationRef.current)).padStart(2, "0")}`;
      const userMsg: Message = {
        id: `msg-${Date.now()}`,
        sender: "user",
        text: transcribed,
        timestamp: "Just now",
        isVoice: true,
        audioDuration: durationStr,
      };
      setMessages((prev) => [...prev, userMsg]);
      setLiveTranscript("");
      transcriptRef.current = "";
      finalTranscriptRef.current = "";

      setTimeout(() => {
        const aiResponse: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: "ai",
          text: "Voice command recognized. Compiled trigger rule from your transcript. Review the suggested scope and tokens before relying on it.",
          timestamp: "Just now",
          compiledTrigger: {
            category: "custom_voice_trigger",
            severityMin: 3,
            targetTokens: ["rITA", "rXLI", "rGLD"],
            channels: ["Web Push", "Telegram"],
            status: "draft",
          },
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 700);
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsRecording(false);
      setTranscriptError("Could not start speech recognition. Please try again or type your trigger.");
      return;
    }

    recordIntervalRef.current = setInterval(() => {
      setRecordDuration((prev) => {
        const next = prev + 1;
        recordDurationRef.current = next;
        return next;
      });
    }, 1000);
  };

  const stopRecordingAndSend = () => {
    recognitionRef.current?.stop();
  };

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: inputText.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputText.trim();
    setInputText("");

    setTimeout(() => {
      const aiResponse: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: `Compiled custom trigger for "${query}". Your filter is now monitored against overnight wire feeds.`,
        timestamp: "Just now",
        compiledTrigger: {
          category: "custom_macro",
          severityMin: 3,
          targetTokens: ["rSMH", "rQQQ"],
          channels: ["Web Push"],
          status: "active",
        },
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 700);
  };

  // 60-Second Morning Voice Brief Simulation
  const toggleVoiceBrief = () => {
    if (isPlayingBrief) {
      setIsPlayingBrief(false);
      setBriefTime(0);
    } else {
      setIsPlayingBrief(true);
      const interval = setInterval(() => {
        setBriefTime((t) => {
          if (t >= 60) {
            clearInterval(interval);
            setIsPlayingBrief(false);
            return 0;
          }
          return t + 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="fp-chat-console flex flex-col w-full max-w-5xl mx-auto rounded-3xl border border-white/10 bg-[#0d111a]/80 backdrop-blur-2xl shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-hot to-hot-soft flex items-center justify-center text-ink font-bold shadow-lg shadow-hot/20">
            <Sparkles size={18} className="text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 id="ai-chat-8-title" className="text-base font-bold text-white tracking-wide">Flashpoint Voice & Terminal</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded-full bg-hot/15 text-hot-soft border border-hot/30">
                AI CHAT 8
              </span>
            </div>
            <p className="text-xs text-muted flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Claude 3.5 Sonnet Engine · Voice & Text Composer
            </p>
          </div>
        </div>

        {/* 60s Voice Brief Button */}
        <button
          onClick={toggleVoiceBrief}
          className={`orbit-brief-toggle flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all ${
            isPlayingBrief
              ? "bg-hot/20 border-hot text-hot-soft shadow-lg shadow-hot/25"
              : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
          }`}
        >
          {isPlayingBrief ? <Pause size={14} className="text-hot" /> : <Volume2 size={14} className="text-hot" />}
          <span>{isPlayingBrief ? `Brief Playing (${60 - briefTime}s)` : "Play Morning Voice Brief"}</span>
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close voice composer"
            autoFocus
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-hot/50 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Message Feed */}
      <div ref={chatBodyRef} className="flex-1 p-6 space-y-5 overflow-y-auto max-h-[500px] min-h-[350px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-mono text-dim">
                {msg.sender === "user" ? "Trader" : "Flashpoint AI"}
              </span>
              <span className="text-[10px] text-dim/70">· {msg.timestamp}</span>
            </div>

            <div
              className={`relative max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-hot to-amber-600 text-black font-medium"
                  : "bg-white/[0.05] border border-white/10 text-white/95"
              }`}
            >
              {/* Voice message indicator badge */}
              {msg.isVoice && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/15 text-xs font-semibold font-mono">
                  <Mic size={13} />
                  <span>Voice Prompt ({msg.audioDuration})</span>
                </div>
              )}

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Compiled Trigger Card */}
              {msg.compiledTrigger && (
                <div className="mt-3.5 pt-3 border-t border-white/10 rounded-xl bg-black/30 p-3 text-xs">
                  <div className="flex items-center justify-between text-hot-soft font-mono font-bold mb-2">
                    <span className="flex items-center gap-1.5">
                      <Shield size={13} className="text-hot" />
                      Compiled Macro Trigger Rule
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check size={12} /> ARMED ONCHAIN
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px] text-muted">
                    <div>
                      <span className="text-dim">Sector:</span> {msg.compiledTrigger.category}
                    </div>
                    <div>
                      <span className="text-dim">Min Severity:</span> {msg.compiledTrigger.severityMin}/5
                    </div>
                    <div className="col-span-2">
                      <span className="text-dim">Watched Tokens:</span>{" "}
                      {msg.compiledTrigger.targetTokens.map((t) => (
                        <span key={t} className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-white/10 text-white text-[11px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Basket Preview Card */}
              {msg.basketPreview && (
                <div className="mt-3 rounded-xl border border-hot/30 bg-hot/5 p-3.5 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-hot-soft flex items-center gap-1.5">
                      <Radio size={13} className="text-hot animate-pulse" />
                      Overnight Basket ({msg.basketPreview.id})
                    </span>
                    <span className="font-mono text-dim">Conf: {msg.basketPreview.confidence}%</span>
                  </div>
                  <p className="text-white font-medium mb-2.5">{msg.basketPreview.title}</p>
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {msg.basketPreview.legs.map((leg) => (
                      <span key={leg.symbol} className="px-2 py-0.5 rounded-md bg-white/10 text-white font-mono text-[11px]">
                        {leg.weight}% {leg.symbol}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/b/${msg.basketPreview.id}`}
                    className="inline-flex items-center gap-1 text-hot font-bold hover:underline"
                  >
                    View Execution Slip & Deep Link <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live Interim Transcript Bubble */}
        {isRecording && liveTranscript && (
          <div className="flex flex-col items-end">
            <div className="max-w-[85%] rounded-2xl p-4 bg-hot/15 border border-hot/40 text-hot-soft text-sm italic">
              <div className="flex items-center gap-2 mb-1 text-xs font-mono font-bold text-hot">
                <span className="w-2 h-2 rounded-full bg-hot animate-ping"></span>
                Transcribing Voice...
              </div>
              <p>"{liveTranscript}"</p>
            </div>
          </div>
        )}

        {transcriptError && (
          <p role="status" className="rounded-xl border border-hot/25 bg-hot/5 px-4 py-3 text-xs leading-relaxed text-hot-soft">
            {transcriptError}
          </p>
        )}

      </div>

      {/* Suggested Triggers Chips */}
      <div className="px-6 py-2.5 bg-white/[0.01] border-t border-white/5 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-dim font-mono text-[11px] shrink-0">Quick Prompts:</span>
        {SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => setInputText(sug)}
            className="shrink-0 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-[12px]"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Voice Composer & Audio Visualizer Bar */}
      <div className="p-4 border-t border-white/10 bg-[#0a0d14]/90">
        {/* Waveform Canvas & Live Recording UI */}
        <div className="flex items-center justify-between gap-4 mb-3 px-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleRecording}
              className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                isRecording
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/50 scale-105"
                  : "bg-white/10 text-hot hover:bg-white/15 hover:scale-105 border border-white/15"
              }`}
              title={isRecording ? "Stop recording and process" : "Record voice prompt"}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              {isRecording && (
                <span className="absolute -inset-1 rounded-full border-2 border-red-500 animate-ping"></span>
              )}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  {isRecording ? "Listening to Voice Input..." : "Live Audio Spectrum"}
                </span>
                {isRecording && (
                  <span className="text-[11px] font-mono text-red-400">00:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}</span>
                )}
              </div>
              <p className="text-[11px] text-dim font-mono">
                {isRecording ? "Speak clearly to compile trigger rule" : "Tap mic to speak your macro alert rule"}
              </p>
            </div>
          </div>

          {/* Audio Waveform Canvas */}
          <canvas
            ref={canvasRef}
            width={180}
            height={36}
            className="rounded-lg bg-black/40 border border-white/5 px-1"
          />
        </div>

        {/* Input Text Form */}
        <form onSubmit={handleSendText} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isRecording ? "Transcribing your voice..." : "Type plain-English trigger or ask about overnight ETF fair value..."}
            disabled={isRecording}
            className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder:text-muted focus:outline-none focus:border-hot focus:ring-1 focus:ring-hot transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="h-12 px-5 rounded-xl bg-hot text-ink font-bold text-sm flex items-center gap-1.5 hover:bg-hot-soft disabled:opacity-40 disabled:pointer-events-none transition-all shadow-lg shadow-hot/20"
          >
            <span>Compile</span>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
export default AIChat8;
