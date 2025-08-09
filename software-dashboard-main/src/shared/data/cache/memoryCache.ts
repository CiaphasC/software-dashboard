// Simple in-memory cache with TTL and single-flight deduplication

type CacheEntry<T> = {
  value: T
  // Expiración fuerte: tras esto, no se sirve cache
  hardExpiresAt: number
  // Expiración suave: antes de esto, se sirve como fresh; entre suave y fuerte, se sirve stale y se revalida
  staleExpiresAt: number
}

const store = new Map<string, CacheEntry<any>>()
const inflight = new Map<string, Promise<any>>()

export function getCached<T>(key: string): T | undefined {
  const e = store.get(key)
  if (!e) return undefined
  if (Date.now() > e.hardExpiresAt) {
    store.delete(key)
    return undefined
  }
  return e.value as T
}

export function setCached<T>(key: string, value: T, hardTtlMs: number, staleTtlMs?: number): void {
  const now = Date.now()
  const stale = staleTtlMs ?? Math.floor(hardTtlMs * 0.3)
  store.set(key, { value, hardExpiresAt: now + hardTtlMs, staleExpiresAt: now + stale })
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

export function isStale(key: string): boolean | undefined {
  const e = store.get(key)
  if (!e) return undefined
  const now = Date.now()
  if (now > e.hardExpiresAt) return undefined
  return now > e.staleExpiresAt
}

