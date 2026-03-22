import { NextRequest, NextResponse } from "next/server";

export interface StoredSubscription {
  subscription: PushSubscription;
  parishes: string[]; // empty array means "all parishes"
}

// In-memory store for demo (resets on server restart)
const subscriptions: StoredSubscription[] = [];

export async function POST(req: NextRequest) {
  const { subscription, parishes = [] } = await req.json();
  // Remove any existing subscription with the same endpoint
  const endpoint = (subscription as PushSubscription).endpoint;
  const idx = subscriptions.findIndex(s => s.subscription.endpoint === endpoint);
  if (idx !== -1) subscriptions.splice(idx, 1);
  subscriptions.push({ subscription, parishes });
  return NextResponse.json({ ok: true });
}

export function getSubscriptions() { return subscriptions; }
