import type { InventorySnapshot } from "./types";

const SNAPSHOT_KEY = "inventory:snapshot:latest";
const HISTORY_PREFIX = "inventory:snapshot:date:";

type KvLike = {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<unknown>;
  keys?(pattern: string): Promise<string[]>;
};

let memoryStore: Record<string, unknown> = {};
const memoryKv: KvLike = {
  async get<T>(key: string) {
    return (memoryStore[key] as T | undefined) ?? null;
  },
  async set(key: string, value: unknown) {
    memoryStore[key] = value;
    return "OK";
  },
  async keys(pattern: string) {
    const re = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return Object.keys(memoryStore).filter((k) => re.test(k));
  }
};

let _kv: KvLike | null = null;

async function getKv(): Promise<KvLike> {
  if (_kv) return _kv;
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const mod = await import("@vercel/kv");
      _kv = mod.kv as unknown as KvLike;
      return _kv;
    } catch {
      // fall back
    }
  }
  _kv = memoryKv;
  return _kv;
}

export async function getLatestSnapshot(): Promise<InventorySnapshot | null> {
  const kv = await getKv();
  return kv.get<InventorySnapshot>(SNAPSHOT_KEY);
}

export async function saveSnapshot(snapshot: InventorySnapshot): Promise<void> {
  const kv = await getKv();
  await kv.set(SNAPSHOT_KEY, snapshot);
  await kv.set(HISTORY_PREFIX + snapshot.date, snapshot);
}

export async function getSnapshotByDate(date: string): Promise<InventorySnapshot | null> {
  const kv = await getKv();
  return kv.get<InventorySnapshot>(HISTORY_PREFIX + date);
}
