"use client";

import { useState, useEffect, useRef } from "react";

type ToggleKey =
  | "highContrast"
  | "largerText"
  | "pauseAnimations"
  | "highlightLinks"
  | "grayscale";

interface ToggleConfig {
  key: ToggleKey;
  label: string;
  description: string;
  htmlClass: string;
}

const TOGGLES: ToggleConfig[] = [
  { key: "highContrast", label: "High Contrast", description: "Dark background with high-contrast text", htmlClass: "a11y-contrast" },
  { key: "largerText", label: "Larger Text", description: "Increase font size by 20%", htmlClass: "a11y-large-text" },
  { key: "pauseAnimations", label: "Pause Animations", description: "Stop all motion and transitions", htmlClass: "a11y-pause-animations" },
  { key: "highlightLinks", label: "Highlight Links", description: "Outline and underline all links", htmlClass: "a11y-highlight-links" },
  { key: "grayscale", label: "Grayscale", description: "Remove all colour from the page", htmlClass: "a11y-grayscale" },
];

const STORAGE_KEY = "nwa-a11y-prefs";
type PrefsState = Record<ToggleKey, boolean>;
const DEFAULT_PREFS: PrefsState = {
  highContrast: false, largerText: false, pauseAnimations: false, highlightLinks: false, grayscale: false,
};

function loadPrefs(): PrefsState {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch { return DEFAULT_PREFS; }
}

function savePrefs(prefs: PrefsState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
}

function syncHtmlClasses(prefs: PrefsState) {
  const root = document.documentElement;
  TOGGLES.forEach(({ key, htmlClass }) => root.classList.toggle(htmlClass, prefs[key]));
}

export default function AccessibilityToolbar() {
  const [prefs, setPrefs] = useState<PrefsState>(DEFAULT_PREFS);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const stored = loadPrefs();
    setPrefs(stored);
    syncHtmlClasses(stored);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    };
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  function handleToggle(key: ToggleKey, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next); savePrefs(next); syncHtmlClasses(next);
  }

  function handleReset() {
    setPrefs(DEFAULT_PREFS); savePrefs(DEFAULT_PREFS); syncHtmlClasses(DEFAULT_PREFS);
  }

  const activeCount = Object.values(prefs).filter(Boolean).length;

  return (
    <>
      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Accessibility options"
          style={{
            position: "fixed",
            top: "50%",
            right: "52px",
            transform: "translateY(-50%)",
            zIndex: 9999,
            width: "280px",
            background: "#ffffff",
            border: "2px solid #003876",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div style={{ background: "#003876", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "14px" }}>Accessibility Options</span>
            {activeCount > 0 && (
              <button
                onClick={handleReset}
                style={{ background: "none", border: "none", color: "#f4c430", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}
                aria-label="Reset all"
              >
                Reset all
              </button>
            )}
          </div>

          {/* Toggles */}
          {TOGGLES.map((toggle) => (
            <div
              key={toggle.key}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a2e" }}>{toggle.label}</div>
                <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{toggle.description}</div>
              </div>
              <button
                role="switch"
                aria-checked={prefs[toggle.key]}
                onClick={() => handleToggle(toggle.key, !prefs[toggle.key])}
                style={{
                  position: "relative",
                  width: "44px",
                  height: "24px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  background: prefs[toggle.key] ? "#f4c430" : "#ccc",
                  flexShrink: 0,
                  marginLeft: "12px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: prefs[toggle.key] ? "22px" : "2px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                />
              </button>
            </div>
          ))}

          {/* Footer */}
          <div style={{ background: "#f7f8fa", padding: "8px 16px", textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>NWA Accessibility</span>
          </div>
        </div>
      )}

      {/* Trigger tab — fixed to middle-right edge */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? "Close accessibility options" : "Open accessibility options"}
        style={{
          position: "fixed",
          top: "50%",
          right: 0,
          transform: "translateY(-50%)",
          zIndex: 9999,
          width: "44px",
          padding: "14px 8px",
          background: "#003876",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px 0 0 8px",
          cursor: "pointer",
          boxShadow: "-2px 2px 10px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {/* Accessibility person icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="#ffffff" aria-hidden="true">
          <circle cx="12" cy="3.5" r="2" />
          <path d="M17 7.5H7a1 1 0 000 2h3.5v2.3l-2.8 5.6a1 1 0 001.8.9L11.9 14h.2l2.4 4.3a1 1 0 001.8-.9l-2.8-5.6V9.5H17a1 1 0 000-2z" />
        </svg>
        <span style={{ fontSize: "8px", fontWeight: 700, color: "#f4c430", letterSpacing: "0.05em", writingMode: "vertical-rl", textOrientation: "mixed" }}>
          A11Y
        </span>
        {activeCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              left: "-6px",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "#f4c430",
              color: "#003876",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            {activeCount}
          </span>
        )}
      </button>
    </>
  );
}
