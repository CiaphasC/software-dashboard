/**
 * POST /incidents-ts/:id/status
 * Cambia el estado de una incidencia. Requiere admin/technician.
 * Reglas:
 * - Estados permitidos: open | in_progress | resolved | closed.
 * - resolved/closed establecen resolved_at automáticamente.
 */
import type { Context } from 'hono'
import { adminClient } from "@shared/clients.ts"
import { getAuthUser, ensureAdminOrTechnician } from "@shared/auth.ts"
import { problem } from "@shared/errors.ts"

export async function updateIncidentStatus(c: Context) {
  try {
    const supa = adminClient()
    const user = await getAuthUser(c.req.raw, supa)
    await ensureAdminOrTechnician(supa, user.id)

    const id = c.req.param('id')
    const { status } = await c.req.json()
    if (!id || !status) return problem(c, 400, 'BadRequest', 'missing id/status')

    const validStatuses = ["open", "in_progress", "resolved", "closed"]
    if (!validStatuses.includes(String(status))) return problem(c, 400, 'ValidationError', 'status inválido')

    const updateData: Record<string, unknown> = { status, last_modified_at: new Date().toISOString(), last_modified_by: user.id }
    if (["resolved", "closed"].includes(String(status))) updateData.resolved_at = new Date().toISOString()

    const { data, error } = await supa
      .from('incidents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error) return problem(c, 500, 'UpdateFailed', error.message)

    // Log de actividad (best-effort)
    try {
      await supa.rpc('log_activity', {
        p_user_id: user.id,
        p_action: 'incident_status_changed',
        p_details: JSON.stringify({ incident_id: id, new_status: status, resolved_at: (updateData as any).resolved_at })
      })
    } catch (_) {}

    // Broadcast realtime (best-effort)
    try {
      await supa.channel('incidents').send({
        type: 'broadcast',
        event: 'incident_status_updated',
        payload: { incident_id: id, new_status: status, updated_by: user.id, resolved_at: (updateData as any).resolved_at }
      })
    } catch (_) {}

    return c.json({ ok: true, id: data.id, status: data.status })
  } catch (e) {
    return problem(c, 500, 'UnhandledError', (e as Error).message)
  }
}


