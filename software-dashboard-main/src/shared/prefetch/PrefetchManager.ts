import { prefetchRegistry } from './prefetchRegistry'

export class PrefetchManager {
  async prefetch(intention: keyof typeof prefetchRegistry, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) return
    const p = prefetchRegistry[intention]()
    if (signal) {
      signal.addEventListener('abort', () => {
        // No hay cancelación de promesas nativa; simplemente ignoramos el resultado
      }, { once: true })
    }
    await p
  }
}

export const prefetchManager = new PrefetchManager()

