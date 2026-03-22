import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getSubscriptions } from "../subscribe/route";

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:admin@nwa.gov.jm",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  const { title, body, url } = await req.json();
  const subs = getSubscriptions();
  const payload = JSON.stringify({ title, body, url });
  const results = await Promise.allSettled(
    subs.map(sub => webpush.sendNotification(sub as any, payload))
  );
  const sent = results.filter(r => r.status === "fulfilled").length;
  return NextResponse.json({ sent, total: subs.length });
}
