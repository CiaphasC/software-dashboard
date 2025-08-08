import { getCached, setCached, getInflight, setInflight } from './cache/memoryCache'

export interface FetcherOptions {
  ttlMs?: number
}

export async function fetchWithCache<T>(key: string, fetchFn: () => Promise<T>, opts: FetcherOptions = {}): Promise<T> {
  const cached = getCached<T>(key)
  if (cached !== undefined) return cached

  const inflight = getInflight<T>(key)
  if (inflight) return inflight

  const p = fetchFn()
  setInflight(key, p)
  const ttl = opts.ttlMs ?? 30_000
  const result = await p
  setCached(key, result, ttl)
  return result
}

