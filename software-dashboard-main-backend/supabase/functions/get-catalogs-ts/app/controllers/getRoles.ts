import type { Context } from 'hono'
import type { RolesResponse } from "@types/api.ts"
import { adminClient } from "@shared/clients.ts"
// Import de auth removido para endpoints públicos en registro

/**
 * GET /roles
 * Devuelve roles activos para selects de UI y flujos de autorización.
 * Endpoint autenticado; usa el cliente de servicio con el token del usuario para respetar RLS.
 */
export async function getRoles(c: Context) {
  const supa = adminClient()
  const { data, error } = await supa
    .from('roles')
    .select('id, name, description, is_active')
    .eq('is_active', true)
    .order('name')
  if (error) return c.json({ error: error.message }, 400)
  const body: RolesResponse = { roles: data || [] }
  return c.json(body)
}


