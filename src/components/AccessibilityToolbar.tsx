"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Config ───────────────────────────────────────────────────────────────────

const TOGGLES: ToggleConfig[] = [
  {
    key: "highContrast",
    label: "High Contrast",
    description: "Dark background with high-contrast text",
    htmlClass: "a11y-contrast",
  },
  {
    key: "largerText",
    label: "Larger Text",
    description: "Increase font size by 20%",
    htmlClass: "a11y-large-text",
  },
  {
    key: "pauseAnimations",
    label: "Pause Animations",
    description: "Stop all motion and transitions",
    htmlClass: "a11y-pause-animations",
  },
  {
    key: "highlightLinks",
    label: "Highlight Links",
    description: "Outline and underline all links",
    htmlClass: "a11y-highlight-links",
  },
  {
    key: "grayscale",
    label: "Grayscale",
    description: "Remove all colour from the page",
    htmlClass: "a11y-grayscale",
  },
];

const STORAGE_KEY = "nwa-a11y-prefs";

type PrefsState = Record<ToggleKey, boolean>;

const DEFAULT_PREFS: PrefsState = {
  highContrast: false,
  largerText: false,
  pauseAnimations: false,
  highlightLinks: false,
  grayscale: false,
};

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadPrefs(): PrefsState {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: PrefsState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota errors
  }
}

// ─── Apply / remove HTML classes ─────────────────────────────────────────────

function syncHtmlClasses(prefs: PrefsState) {
  const root = document.documentElement;
  TOGGLES.forEach(({ key, htmlClass }) => {
    root.classList.toggle(htmlClass, prefs[key]);
  });
}

// ─── Accessibility person icon (universal symbol) ─────────────────────────────

function A11yIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="3.5" r="2" />
      <path d="M17 7.5H7a1 1 0 000 2h3.5v2.3l-2.8 5.6a1 1 0 001.8.9L11.9 14h.2l2.4 4.3a1 1 0 001.8-.9l-2.8-5.6V9.5H17a1 1 0 000-2z" />
    </svg>
  );
}

// ─── Pill toggle switch ───────────────────────────────────────────────────────

function PillToggle({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        backgroundColor: checked ? "#f4c430" : "#d1d5db",
        outlineColor: "#f4c430",
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
      <span className="sr-only">{checked ? "On" : "Off"}</span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AccessibilityToolbar() {
  const [prefs, setPrefs] = useState<PrefsState>(DEFAULT_PREFS);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Hydrate from localStorage and apply classes on mount
  useEffect(() => {
    const stored = loadPrefs();
    setPrefs(stored);
    syncHtmlClasses(stored);
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  function handleToggle(key: ToggleKey, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
    syncHtmlClasses(next);
  }

  function handleReset() {
    setPrefs(DEFAULT_PREFS);
    savePrefs(DEFAULT_PREFS);
    syncHtmlClasses(DEFAULT_PREFS);
  }

  const activeCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div style={{ position: "fixed", top: "50%", transform: "translateY(-50%)", right: 0, zIndex: 9998, display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: "12px" }}>
      {/* Expanded panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Accessibility options"
          className="w-72 rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: "#ffffff", border: "2px solid #003876" }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: "#003876" }}
          >
            <div className="flex items-center gap-2">
              <A11yIcon size={20} className="text-yellow-400" />
              <span className="text-white font-semibold text-sm tracking-wide">
                Accessibility
              </span>
            </div>
            {activeCount > 0 && (
              <button
                onClick={handleReset}
                className="text-xs text-blue-200 hover:text-white underline transition-colors"
                aria-label="Reset all accessibility options"
              >
                Reset all
              </button>
            )}
          </div>

          {/* Toggle list */}
          <ul className="divide-y divide-gray-100">
            {TOGGLES.map((toggle) => (
              <li key={toggle.key}>
                <label
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  htmlFor={`a11y-${toggle.key}`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 block">
                      {toggle.label}
                    </span>
                    <span className="text-xs text-gray-500 block mt-0.5 leading-tight">
                      {toggle.description}
                    </span>
                  </div>
                  <PillToggle
                    id={`a11y-${toggle.key}`}
                    checked={prefs[toggle.key]}
                    onChange={(v) => handleToggle(toggle.key, v)}
                  />
                </label>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div
            className="px-4 py-2 text-center"
            style={{ background: "#f7f8fa", borderTop: "1px solid #e5e7eb" }}
          >
            <span className="text-[10px] text-gray-400 tracking-wide uppercase">
              NWA Accessibility Widget
            </span>
          </div>
        </div>
      )}

      {/* Floating trigger button — right-edge tab style */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          open
            ? "Close accessibility options"
            : `Accessibility options${activeCount > 0 ? ` (${activeCount} active)` : ""}`
        }
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          padding: "12px 8px",
          background: "#003876",
          color: "#ffffff",
          borderRadius: "8px 0 0 8px",
          width: "48px",
          border: "none",
          cursor: "pointer",
          boxShadow: "-2px 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <A11yIcon size={26} />
        <span className="text-[9px] font-semibold leading-tight text-center" style={{ color: "#f4c430" }}>
          A11Y
        </span>
        {activeCount > 0 && (
          <span
            className="absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: "#f4c430", color: "#003876" }}
            aria-hidden="true"
          >
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}
