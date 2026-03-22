"use client";

import { useState, useEffect } from "react";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import PushNotificationBell from "@/components/PushNotificationBell";
import PwaInstall from "@/components/PwaInstall";

export default function ClientOverlays() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <PwaInstall />
      <AccessibilityToolbar />
      <WhatsAppButton />
      <PushNotificationBell />
    </>
  );
}
