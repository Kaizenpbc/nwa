"use client";

import { useEffect, useState } from "react";
import { PARISHES } from "@/data/mock";

const STORAGE_KEY = "nwa_push_parishes";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}

export default function PushNotificationBell() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedParishes, setSelectedParishes] = useState<string[]>([]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setSupported(true);
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          if (sub) {
            setSubscribed(true);
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) setSelectedParishes(JSON.parse(saved));
          }
        })
        .catch(() => {});
    }
  }, []);

  const toggleParish = (parish: string) => {
    setSelectedParishes(prev =>
      prev.includes(parish) ? prev.filter(p => p !== parish) : [...prev, parish]
    );
  };

  const openEditor = () => {
    // Reload saved preferences before opening
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSelectedParishes(JSON.parse(saved));
    setShowSelector(true);
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        alert("Notifications are blocked. Please enable them in your browser settings and try again.");
        return;
      }
      if (permission !== "granted") {
        alert("Please allow notifications to receive road alerts.");
        return;
      }

      const swReady = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Service worker timed out")), 20000)
        ),
      ]);

      // Unsubscribe existing subscription first so we get a fresh one
      const existing = await (swReady as ServiceWorkerRegistration).pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Push key not configured");

      const sub = await Promise.race([
        (swReady as ServiceWorkerRegistration).pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Push subscription timed out — check browser notification settings")), 15000)
        ),
      ]);

      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, parishes: selectedParishes }),
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedParishes));
      setSubscribed(true);
      setShowSelector(false);
    } catch (err) {
      console.error("Push subscription failed:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Could not set up alerts: ${msg}\n\nVisit the Road Closures page to see current alerts.`);
    } finally {
      setLoading(false);
    }
  };

  const parishLabel = selectedParishes.length === 0
    ? "All parishes"
    : selectedParishes.length === 1
      ? selectedParishes[0]
      : `${selectedParishes.length} parishes`;

  const ParishSelector = () => (
    <div className="mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-64">
      <p className="text-sm font-semibold text-gray-800 mb-1">Select parishes to watch</p>
      <p className="text-xs text-gray-500 mb-3">Leave all unchecked to receive alerts for every parish.</p>
      <div className="max-h-48 overflow-y-auto space-y-1">
        {PARISHES.map(parish => (
          <label key={parish} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
            <input
              type="checkbox"
              checked={selectedParishes.includes(parish)}
              onChange={() => toggleParish(parish)}
              className="accent-blue-700"
            />
            {parish}
          </label>
        ))}
      </div>
      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{ backgroundColor: "#003876" }}
        className="mt-3 w-full py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-60 hover:opacity-90 transition-opacity"
      >
        {loading ? "Setting up…" : "Confirm & Subscribe"}
      </button>
      <button
        onClick={() => setShowSelector(false)}
        className="mt-1.5 w-full py-1 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors"
      >
        Cancel
      </button>
    </div>
  );

  if (subscribed) {
    return (
      <div className="fixed bottom-20 left-6 z-[9997]">
        {showSelector && <ParishSelector />}
        <div className="flex items-center gap-1 rounded-full shadow-lg overflow-hidden text-sm font-medium">
          <div className="flex items-center gap-1.5 pl-3 pr-2 py-2 bg-green-600 text-white">
            🔔 Alerts On ✓
          </div>
          <button
            onClick={openEditor}
            className="px-2 py-2 bg-green-700 text-white hover:bg-green-800 transition-colors text-xs"
            title={`Watching: ${parishLabel}`}
          >
            ✏️
          </button>
        </div>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="fixed bottom-20 left-6 z-[9997]">
        <a
          href="/closures"
          style={{ backgroundColor: "#003876" }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-white shadow-lg hover:opacity-90 transition-opacity"
        >
          🔔 Get Road Alerts
        </a>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-6 z-[9997]">
      {showSelector && <ParishSelector />}
      <button
        onClick={() => setShowSelector(v => !v)}
        style={{ backgroundColor: "#003876" }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-white shadow-lg hover:opacity-90 transition-opacity"
      >
        🔔 Get Road Alerts
      </button>
    </div>
  );
}
