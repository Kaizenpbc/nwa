import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)!,
  token: (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)!,
});

export interface StoredSubscription {
  subscription: PushSubscription;
  parishes: string[]; // empty array means "all parishes"
}

const KV_KEY = "push_subscriptions";

export async function POST(req: NextRequest) {
  const { subscription, parishes = [] } = await req.json();
  const endpoint = (subscription as PushSubscription).endpoint;

  const stored: StoredSubscription[] = (await kv.get<StoredSubscription[]>(KV_KEY)) ?? [];
  const filtered = stored.filter(s => s.subscription.endpoint !== endpoint);
  filtered.push({ subscription, parishes });
  await kv.set(KV_KEY, filtered);

  return NextResponse.json({ ok: true });
}

export async function getSubscriptions(): Promise<StoredSubscription[]> {
  return (await kv.get<StoredSubscription[]>(KV_KEY)) ?? [];
}
