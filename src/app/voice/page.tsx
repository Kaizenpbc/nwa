"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────

type Status = "idle" | "listening" | "thinking" | "speaking" | "error";

interface Message {
  role: "user" | "assistant";
  text: string;
}

// ── Web Speech API types ───────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

// ── Suggested prompts ──────────────────────────────────────────────────

const SUGGESTIONS = [
  "What emergencies are active right now?",
  "Any road closures in Kingston?",
  "Give me the dashboard summary",
  "What projects are in progress?",
  "Any complaints with breached SLA?",
  "Give me an overview of St. Mary",
];

// ── Status UI config ───────────────────────────────────────────────────

const STATUS_CONFIG: Record<Status, { label: string; color: string; pulse: boolean }> = {
  idle: { label: "Tap mic to speak", color: "bg-nwa-blue", pulse: false },
  listening: { label: "Listening…", color: "bg-red-500", pulse: true },
  thinking: { label: "Thinking…", color: "bg-nwa-yellow", pulse: true },
  speaking: { label: "Speaking…", color: "bg-nwa-green", pulse: true },
  error: { label: "Error — tap to retry", color: "bg-gray-400", pulse: false },
};

// ── Component ──────────────────────────────────────────────────────────

export default function VoicePage() {
  const [status, setStatus] = useState<Status>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check browser support
  useEffect(() => {
    const hasSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const hasSynth = !!window.speechSynthesis;
    setSupported(hasSpeech && hasSynth);
    if (hasSynth) synthRef.current = window.speechSynthesis;
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Speak response ──────────────────────────────────────────────────
  const speak = useCallback((text: string, onDone?: () => void) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-JM";
    utt.rate = 0.95;
    utt.pitch = 1;
    utt.onend = () => {
      setStatus("idle");
      onDone?.();
    };
    utt.onerror = () => setStatus("idle");
    setStatus("speaking");
    synthRef.current.speak(utt);
  }, []);

  // ── Query API ───────────────────────────────────────────────────────
  const query = useCallback(
    async (text: string) => {
      setStatus("thinking");
      setMessages((prev) => [...prev, { role: "user", text }]);

      try {
        const res = await fetch("/api/voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text }),
        });
        const data = await res.json();
        const answer: string = data.response ?? "Sorry, I could not process that request.";
        setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
        speak(answer);
      } catch {
        const err = "Sorry, there was a network error. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", text: err }]);
        speak(err);
        setStatus("error");
      }
    },
    [speak],
  );

  // ── Start listening ─────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (status === "listening") {
      recognitionRef.current?.stop();
      return;
    }
    if (status !== "idle" && status !== "error") return;

    // Stop any ongoing speech
    synthRef.current?.cancel();

    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return;

    const rec = new Rec();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    recognitionRef.current = rec;

    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      const text = last[0].transcript;
      setTranscript(text);
      if (last.isFinal) {
        rec.stop();
        setTranscript("");
        query(text);
      }
    };

    rec.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      setStatus("error");
      setTranscript("");
    };

    rec.onend = () => {
      setStatus((prev) => (prev === "listening" ? "idle" : prev));
    };

    setStatus("listening");
    rec.start();
  }, [status, query]);

  // ── Stop speech ─────────────────────────────────────────────────────
  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setStatus("idle");
  }, []);

  const cfg = STATUS_CONFIG[status];

  // ── Render ──────────────────────────────────────────────────────────
  if (!supported) {
    return (
      <div className="min-h-screen bg-nwa-gray flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-md">
          <div className="text-5xl mb-4">🎤</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Voice Not Supported</h1>
          <p className="text-gray-500 text-sm">
            Your browser does not support the Web Speech API. Please try Chrome or Edge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nwa-gray flex flex-col">
      {/* Header */}
      <div className="bg-nwa-blue text-white px-6 py-5 shadow-md">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold tracking-tight">NWA Voice Assistant</h1>
          <p className="text-blue-200 text-sm mt-0.5">
            Jamaica road network only &mdash; closures, emergencies, projects &amp; more
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🇯🇲</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium mb-4">
                <span>⚠️</span>
                <span>Covers Jamaica&apos;s NWA road network only</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                Tap the mic below or try one of these:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => query(s)}
                    disabled={status !== "idle"}
                    className="text-xs px-3 py-2 rounded-full border border-nwa-blue/30 text-nwa-blue bg-white hover:bg-nwa-blue/5 transition-colors disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-nwa-blue text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-xs font-semibold text-nwa-blue">NWA</span>
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}

          {/* Live transcript */}
          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm bg-nwa-blue/20 text-nwa-blue italic rounded-br-sm">
                {transcript}…
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-t border-gray-200 px-4 py-6 shadow-lg">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          {/* Status label */}
          <p className="text-sm text-gray-500">{cfg.label}</p>

          {/* Mic button */}
          <button
            onClick={status === "speaking" ? stopSpeaking : startListening}
            disabled={status === "thinking"}
            aria-label={status === "listening" ? "Stop listening" : "Start listening"}
            className={`relative w-20 h-20 rounded-full text-white text-3xl flex items-center justify-center shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${cfg.color} hover:brightness-110 active:scale-95`}
          >
            {cfg.pulse && (
              <span
                className={`absolute inset-0 rounded-full ${cfg.color} opacity-40 animate-ping`}
              />
            )}
            <span className="relative z-10">
              {status === "speaking" ? "🔇" : status === "thinking" ? "⏳" : "🎤"}
            </span>
          </button>

          {/* Clear history */}
          {messages.length > 0 && (
            <button
              onClick={() => {
                setMessages([]);
                synthRef.current?.cancel();
                setStatus("idle");
              }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors mt-1"
            >
              Clear conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
