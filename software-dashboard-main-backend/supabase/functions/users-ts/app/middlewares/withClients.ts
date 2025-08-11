// =============================================================================
// MIDDLEWARE: withClients
// =============================================================================
// Propósito: Inyectar en el contexto un cliente de Supabase con credenciales de
//            SERVICE_ROLE para operaciones de backend (sin RLS), bajo la clave
//            'supa'. Este cliente debe usarse exclusivamente en Edge Functions.
// Contrato:  Deja disponible en el contexto: c.get('supa')
// Seguridad: Nunca exponer SERVICE_ROLE al cliente. Uso interno únicamente.
// =============================================================================
import type { Context, Next } from 'hono'
import { adminClient } from '@shared/clients.ts'

export async function withClients(c: Context, next: Next) {
   // Cliente con SERVICE_ROLE para lógica backend
  c.set('supa', adminClient())
  await next()
}
