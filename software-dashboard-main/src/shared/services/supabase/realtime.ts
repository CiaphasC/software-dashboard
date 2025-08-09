import { supabase } from '@/shared/services/supabase/client'

type PostgrestInsertPayload<T> = {
  eventType: 'INSERT'
  new: T
}

type PostgrestUpdatePayload<T> = {
  eventType: 'UPDATE'
  new: T
}

type PostgrestDeletePayload<T> = {
  eventType: 'DELETE'
  old: T & { id: string }
}

export type RealtimeHandlers<T> = {
  onInsert?: (row: T) => void
  onUpdate?: (row: T) => void
  onDelete?: (row: { id: string }) => void
  /** ignorar eventos de esta misma sesión (best-effort) */
  ignoreSession?: boolean
}

export function subscribeTable<T extends { id: string }>(table: string, handlers: RealtimeHandlers<T>) {
  const channel = supabase.channel(`realtime:${table}`)

  const safe = (fn?: (...args: any[]) => void) => (...args: any[]) => {
    try { fn?.(...args) } catch { /* noop */ }
  }

  channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table }, (payload: PostgrestInsertPayload<T>) => {
    safe(handlers.onInsert)(payload.new)
  })
  channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table }, (payload: PostgrestUpdatePayload<T>) => {
    safe(handlers.onUpdate)(payload.new)
  })
  channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table }, (payload: PostgrestDeletePayload<T>) => {
    safe(handlers.onDelete)({ id: payload.old.id })
  })

  channel.subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

