import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

const kv = new Redis(process.env.REDIS_URL!);

export interface StoredSubscription {
  subscription: PushSubscription;
  parishes: string[]; // empty array means "all parishes"
}

const KV_KEY = "push_subscriptions";

async function kvGet(): Promise<StoredSubscription[]> {
  const raw = await kv.get(KV_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as StoredSubscription[];
}

async function kvSet(data: StoredSubscription[]): Promise<void> {
  await kv.set(KV_KEY, JSON.stringify(data));
}

export async function POST(req: NextRequest) {
  const { subscription, parishes = [] } = await req.json();
  const endpoint = (subscription as PushSubscription).endpoint;

  const stored = await kvGet();
  const filtered = stored.filter(s => s.subscription.endpoint !== endpoint);
  filtered.push({ subscription, parishes });
  await kvSet(filtered);

  return NextResponse.json({ ok: true });
}

export async function getSubscriptions(): Promise<StoredSubscription[]> {
  return kvGet();
}
