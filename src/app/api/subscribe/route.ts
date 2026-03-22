import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo (resets on server restart)
const subscriptions: PushSubscription[] = [];

export async function POST(req: NextRequest) {
  const sub = await req.json();
  subscriptions.push(sub);
  return NextResponse.json({ ok: true });
}

export function getSubscriptions() { return subscriptions; }
