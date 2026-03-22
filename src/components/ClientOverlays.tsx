"use client";

import dynamic from "next/dynamic";

const AccessibilityToolbar = dynamic(
  () => import("@/components/AccessibilityToolbar"),
  { ssr: false }
);
const WhatsAppButton = dynamic(
  () => import("@/components/WhatsAppButton"),
  { ssr: false }
);
const PushNotificationBell = dynamic(
  () => import("@/components/PushNotificationBell"),
  { ssr: false }
);
const PwaInstall = dynamic(
  () => import("@/components/PwaInstall"),
  { ssr: false }
);

export default function ClientOverlays() {
  return (
    <>
      <PwaInstall />
      <AccessibilityToolbar />
      <WhatsAppButton />
      <PushNotificationBell />
    </>
  );
}
