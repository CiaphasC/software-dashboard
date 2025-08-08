import { useRef } from 'react'
import { prefetchManager } from '@/shared/prefetch/PrefetchManager'

export function usePrefetchOnHover(intention: Parameters<typeof prefetchManager.prefetch>[0]) {
  const controllerRef = useRef<AbortController | null>(null)

  const onPointerEnter = () => {
    if (controllerRef.current) controllerRef.current.abort()
    controllerRef.current = new AbortController()
    prefetchManager.prefetch(intention, controllerRef.current.signal)
  }

  const onPointerLeave = () => {
    controllerRef.current?.abort()
  }

  const onFocus = onPointerEnter
  const onBlur = onPointerLeave

  return { onPointerEnter, onPointerLeave, onFocus, onBlur }
}

