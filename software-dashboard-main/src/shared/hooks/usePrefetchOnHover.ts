import { useRef } from 'react'
import { prefetchManager } from '@/shared/prefetch/PrefetchManager'

export function usePrefetchOnHover(intention: Parameters<typeof prefetchManager.prefetch>[0]) {
  const controllerRef = useRef<AbortController | null>(null)
  // cleanup al desmontar
  // no altera arquitectura; evita trabajo residual
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => () => controllerRef.current?.abort(), [])

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

