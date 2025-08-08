// =============================================================================
// useInfiniteScroll - Hook genérico para scroll infinito con IntersectionObserver
// =============================================================================

import { useEffect, useRef } from 'react'

export interface UseInfiniteScrollOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  disabled?: boolean
}

export function useInfiniteScroll(onReachEnd: () => void, options: UseInfiniteScrollOptions = {}) {
  const { root = null, rootMargin = '200px', threshold = 0, disabled = false } = options
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        onReachEnd()
      }
    }, { root, rootMargin, threshold })

    observer.observe(el)
    return () => observer.disconnect()
  }, [root, rootMargin, threshold, disabled, onReachEnd])

  return { sentinelRef }
}

