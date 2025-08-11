/**
 * GET /incidents-ts/:id
 * Devuelve detalles enriquecidos de una incidencia (vista incidents_with_times).
 * Autenticado. Responde 404 si no existe.
 */
import type { Context } from 'hono'
import { adminClient } from "@shared/clients.ts"
import { getAuthUser } from "@shared/auth.ts"
import { problem } from "@shared/errors.ts"

export async function getIncidentDetails(c: Context) {
  try {
    const supa = adminClient()
    const user = await getAuthUser(c.req.raw, supa)
    const id = c.req.param('id')
    if (!id) return problem(c, 400, 'BadRequest', 'missing id')

    const { data, error } = await supa
      .from('incidents_with_times')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return problem(c, 404, 'NotFound', error.message)
    return c.json(data)
  } catch (e) {
    return problem(c, 500, 'UnhandledError', (e as Error).message)
  }
}


