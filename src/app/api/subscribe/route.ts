import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

let _kv: Redis | null = null;
function getKv(): Redis {
  if (!_kv) {
    _kv = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      enableOfflineQueue: false,
      retryStrategy: () => null, // don't retry connections
    });
    _kv.on("error", (err) => console.error("[redis]", err.message));
  }
  return _kv;
}

export interface StoredSubscription {
  subscription: PushSubscription;
  parishes: string[]; // empty array means "all parishes"
}

const KV_KEY = "push_subscriptions";

async function kvGet(): Promise<StoredSubscription[]> {
  const raw = await getKv().get(KV_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as StoredSubscription[];
}

async function kvSet(data: StoredSubscription[]): Promise<void> {
  await getKv().set(KV_KEY, JSON.stringify(data));
}

export async function POST(req: NextRequest) {
  const { subscription, parishes = [] } = await req.json();
  const endpoint = (subscription as PushSubscription).endpoint;

  try {
    const stored = await kvGet();
    const filtered = stored.filter(s => s.subscription.endpoint !== endpoint);
    filtered.push({ subscription, parishes });
    await kvSet(filtered);
  } catch (err) {
    console.error("[subscribe] Redis unavailable, subscription not persisted:", err);
  }

  return NextResponse.json({ ok: true });
}

export async function getSubscriptions(): Promise<StoredSubscription[]> {
  try {
    return await kvGet();
  } catch {
    return [];
  }
}
