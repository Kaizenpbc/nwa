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
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      setSupported(false);
      return;
    }

    // Check if already subscribed
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (sub) setSubscribed(true);
      })
      .catch(() => {});
  }, []);

  if (!supported) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Please allow notifications in your browser");
        setLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
      const sub = await reg.pushManager.subscribe({
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
