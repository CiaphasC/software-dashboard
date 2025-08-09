import { getCached, setCached, getInflight, setInflight, isStale } from './cache/memoryCache'

export interface FetcherOptions {
  // TTL fuerte (tras esto, no se sirve cache)
  hardTtlMs?: number
  // TTL suave (stale): tras esto, se puede servir cache pero disparar revalidación background
  staleTtlMs?: number
  // Revalidaciones
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  intervalMs?: number
}

export async function fetchWithCache<T>(key: string, fetchFn: () => Promise<T>, opts: FetcherOptions = {}): Promise<T> {
  const cached = getCached<T>(key)
  const stale = isStale(key)
  if (cached !== undefined && stale === false) {
    return cached
  }

  const inflight = getInflight<T>(key)
  if (inflight) return inflight

  const p = fetchFn()
  setInflight(key, p)
  const hardTtl = opts.hardTtlMs ?? 30_000
  const staleTtl = opts.staleTtlMs
  const result = await p
  setCached(key, result, hardTtl, staleTtl)
  return result
}

// SWR helpers (opt-in): listeners globales para focus/reconnect
const focusListeners = new Map<string, () => void>()
const reconnectListeners = new Map<string, () => void>()

function onWindowFocus() {
  focusListeners.forEach((fn) => fn())
}
function onWindowReconnect() {
  reconnectListeners.forEach((fn) => fn())
}

if (typeof window !== 'undefined') {
  window.addEventListener('focus', onWindowFocus)
  window.addEventListener('online', onWindowReconnect)
}

export function swrGet<T>(key: string, fetchFn: () => Promise<T>, opts: FetcherOptions = {}) {
  let stopped = false
  let intervalId: number | undefined

  const revalidate = async () => {
    try {
      await fetchWithCache(key, fetchFn, opts)
    } catch {
      // silencioso: la próxima lectura volverá a intentar
    }
  }

  if (opts.revalidateOnFocus) {
    focusListeners.set(key, revalidate)
  }
  if (opts.revalidateOnReconnect) {
    reconnectListeners.set(key, revalidate)
  }
  if (opts.intervalMs && opts.intervalMs > 0) {
    intervalId = window.setInterval(revalidate, opts.intervalMs)
  }

  const get = async (): Promise<T> => {
    const cached = getCached<T>(key)
    const stale = isStale(key)
    if (cached !== undefined) {
      // servir inmediato y revalidar si está stale
      if (stale) revalidate()
      return cached
    }
    // no hay cache: obtener y cachear
    return fetchWithCache(key, fetchFn, opts)
  }

  const stop = () => {
    if (opts.revalidateOnFocus) focusListeners.delete(key)
    if (opts.revalidateOnReconnect) reconnectListeners.delete(key)
    if (intervalId) window.clearInterval(intervalId)
    stopped = true
  }

  return { get, stop }
}

