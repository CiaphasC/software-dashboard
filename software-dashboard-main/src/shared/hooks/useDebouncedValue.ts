import { useEffect, useMemo, useRef, useState } from 'react'

export function useDebouncedValue<T>(value: T, delayMs: number = 300, options?: { leading?: boolean }) {
  const [debounced, setDebounced] = useState(value)
  const timerRef = useRef<number | null>(null)
  const firstRef = useRef(true)

  useEffect(() => {
    if (options?.leading && firstRef.current) {
      firstRef.current = false
      setDebounced(value)
      return
    }
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setDebounced(value), delayMs)
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
  }, [value, delayMs, options?.leading])

  return useMemo(() => debounced, [debounced])
}

