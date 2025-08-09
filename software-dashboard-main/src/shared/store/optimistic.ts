// =============================================================================
// OPTIMISTIC MUTATIONS HELPER - Actualizaciones optimistas con rollback
// =============================================================================

export type ItemsState<TItem> = {
  items: TItem[]
  loading: boolean
  error: string | null
}

export type ItemsStoreAdapter<TItem, TState extends ItemsState<TItem>> = {
  get: () => TState
  set: (partial: Partial<TState> | ((s: TState) => Partial<TState>)) => void
}

export async function withOptimisticItems<TItem, TState extends ItemsState<TItem>>(
  store: ItemsStoreAdapter<TItem, TState>,
  applyOptimistic: (items: TItem[]) => TItem[],
  mutate: () => Promise<void>,
  options?: {
    onSuccess?: () => Promise<void> | void
    onError?: (error: unknown) => void
  }
): Promise<void> {
  const prev = store.get().items
  try {
    // aplicar optimismo
    store.set({ items: applyOptimistic(prev), error: null })
    await mutate()
    await options?.onSuccess?.()
  } catch (error) {
    // rollback
    store.set({ items: prev, error: (error instanceof Error ? error.message : 'Error de actualización') })
    options?.onError?.(error)
    throw error
  }
}

export function updateItemById<TItem extends { id: string }>(
  items: TItem[], id: string, updater: (current: TItem) => TItem
): TItem[] {
  return items.map((it) => (it.id === id ? updater(it) : it))
}

export function removeItemById<TItem extends { id: string }>(
  items: TItem[], id: string
): TItem[] {
  return items.filter((it) => it.id !== id)
}

export function prependPlaceholder<TItem extends { id: string }>(
  items: TItem[], placeholder: TItem
): TItem[] {
  return [placeholder, ...items]
}

