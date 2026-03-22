"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed silently
      });
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isInstalled || dismissed || !installPrompt) return null;

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
    }
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div
      style={{ backgroundColor: "#003876" }}
      className="w-full text-white flex items-center justify-between gap-3 px-4 py-2 text-sm"
      role="banner"
    >
      <span>Install the NWA app for offline access and alerts</span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          style={{ backgroundColor: "#f4c430", color: "#003876" }}
          className="font-semibold px-3 py-1 rounded text-xs"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-white opacity-70 hover:opacity-100 font-bold text-base leading-none"
          aria-label="Dismiss install banner"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
