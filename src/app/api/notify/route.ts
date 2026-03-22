import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getSubscriptions } from "../subscribe/route";

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@nwa.gov.jm",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  const { title, body, url, parish } = await req.json();
  const all = getSubscriptions();

  // Filter: if parish specified, include subscribers for that parish or "all parishes" (empty array)
  const targets = parish
    ? all.filter(s => s.parishes.length === 0 || s.parishes.includes(parish))
    : all;

  const payload = JSON.stringify({ title, body, url });
  const results = await Promise.allSettled(
    targets.map(s => webpush.sendNotification(s.subscription as any, payload))
  );
  const sent = results.filter(r => r.status === "fulfilled").length;
  return NextResponse.json({ sent, total: targets.length });
}
