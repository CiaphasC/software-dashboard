import type { Context } from 'hono'
import type { DepartmentsResponse } from "@types/api.ts"
import { adminClient } from "@shared/clients.ts"
// Import de auth removido para endpoints públicos en registro

/**
 * GET /departments
 * Devuelve departamentos activos para selects de UI y lógica de dominio.
 * Endpoint autenticado; usa el cliente de servicio con el token del usuario para respetar RLS.
 */
export async function getDepartments(c: Context) {
  const supa = adminClient()
  const { data, error } = await supa
    .from('departments')
    .select('id, name, short_name, is_active')
    .eq('is_active', true)
    .order('name')
  if (error) return c.json({ error: error.message }, 400)
  const body: DepartmentsResponse = { departments: data || [] }
  return c.json(body)
}


