/**
 * GET /incidents-ts/metrics/summary
 * Devuelve métricas agregadas de incidencias por estado.
 */
import type { Context } from 'hono'
import { adminClient } from "@shared/clients.ts"
import { getAuthUser } from "@shared/auth.ts"
import { problem } from "@shared/errors.ts"

export async function getIncidentMetrics(c: Context) {
  try {
    const supa = adminClient()
    const user = await getAuthUser(c.req.raw, supa)
    const base = supa.from('incidents')
    const [totalRes, openRes, inProgRes, resolvedRes, closedRes] = await Promise.all([
      base.select('*', { count: 'exact', head: true }),
      base.select('*', { count: 'exact', head: true }).eq('status', 'open'),
      base.select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
      base.select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
      base.select('*', { count: 'exact', head: true }).eq('status', 'closed'),
    ])
    return c.json({
      totalIncidents: totalRes.count || 0,
      openIncidents: openRes.count || 0,
      inProgressIncidents: inProgRes.count || 0,
      resolvedIncidents: resolvedRes.count || 0,
      closedIncidents: closedRes.count || 0,
    })
  } catch (e) {
    return problem(c, 500, 'UnhandledError', (e as Error).message)
  }
}


