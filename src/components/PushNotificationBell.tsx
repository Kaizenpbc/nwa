"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    ) {
      setSupported(true);
      // Check if already subscribed
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          if (sub) setSubscribed(true);
        })
        .catch(() => {});
    }
  }, []);

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

      // Wait for service worker with a timeout
      const swReady = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Service worker timed out")), 8000)
        ),
      ]);

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Push key not configured");

      const sub = await (swReady as ServiceWorkerRegistration).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      setSubscribed(true);
    } catch (err) {
      console.error("Push subscription failed:", err);
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Could not set up alerts: ${msg}\n\nVisit the Road Closures page to see current alerts.`);
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="fixed bottom-20 left-6 z-[9997]">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-green-600 text-white shadow-lg">
          🔔 Alerts On ✓
        </div>
      </div>
    );
  }

  // Fallback for unsupported browsers: link to closures page
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
      <button
        onClick={handleSubscribe}
        disabled={loading}
        style={{ backgroundColor: "#003876" }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-white shadow-lg disabled:opacity-60 hover:opacity-90 transition-opacity"
      >
        🔔 {loading ? "Setting up…" : "Get Road Alerts"}
      </button>
    </div>
  );
}
