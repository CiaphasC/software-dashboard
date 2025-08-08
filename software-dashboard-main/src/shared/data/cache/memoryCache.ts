// Simple in-memory cache with TTL and single-flight deduplication

type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<any>>()
const inflight = new Map<string, Promise<any>>()

export function getCached<T>(key: string): T | undefined {
  const e = store.get(key)
  if (!e) return undefined
  if (Date.now() > e.expiresAt) {
    store.delete(key)
    return undefined
  }
  return e.value as T
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function getInflight<T>(key: string): Promise<T> | undefined {
  return inflight.get(key) as Promise<T> | undefined
}

export function setInflight<T>(key: string, p: Promise<T>): void {
  inflight.set(key, p)
  p.finally(() => inflight.delete(key))
}

export function clearCache(prefix?: string): void {
  if (!prefix) return store.clear()
  for (const k of Array.from(store.keys())) {
    if (k.startsWith(prefix)) store.delete(k)
  }
}

