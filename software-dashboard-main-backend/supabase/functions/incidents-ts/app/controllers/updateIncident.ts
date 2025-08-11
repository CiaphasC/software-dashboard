/**
 * PATCH /incidents-ts/:id
 * Actualiza campos permitidos de una incidencia. Requiere admin/technician.
 * Notas:
 * - Técnicos: solo incidencias 'open', no pueden cambiar estado ni área afectada.
 * - Se registran cambios y se emite evento realtime (best-effort).
 */
import type { Context } from 'hono'
import { adminClient } from "@shared/clients.ts"
import { getAuthUser, ensureAdminOrTechnician } from "@shared/auth.ts"
import { problem } from "@shared/errors.ts"
import { IncidentUpdateSchema } from "@schemas/incident.schema.ts"

export async function updateIncident(c: Context) {
  try {
    const supa = adminClient()
    const user = await getAuthUser(c.req.raw, supa)
    await ensureAdminOrTechnician(supa, user.id)

    const id = c.req.param('id')
    if (!id) return problem(c, 400, 'BadRequest', 'missing id')

    const json = await c.req.json()
    const parsed = IncidentUpdateSchema.safeParse(json)
    if (!parsed.success) return problem(c, 400, 'ValidationError', parsed.error.format())

    const { title, description, priority, type, assignedTo, departmentId, ...rest } = parsed.data
    const updatePayload: Record<string, unknown> = {
      last_modified_at: new Date().toISOString(),
    }
    if (title !== undefined) updatePayload.title = title
    if (description !== undefined) updatePayload.description = description
    if (priority !== undefined) updatePayload.priority = priority
    if (type !== undefined) updatePayload.type = type
    if (assignedTo !== undefined) updatePayload.assigned_to = assignedTo
    if (departmentId !== undefined) updatePayload.affected_area_id = departmentId

    // Si el usuario es técnico, aplicar restricciones adicionales similares a la función antigua
    const { data: profile } = await supa.from('profiles').select('role_name').eq('id', user.id).single()
    if (profile?.role_name === 'technician') {
      const { data: currentIncident } = await supa.from('incidents').select('status, affected_area_id').eq('id', id).single()
      if (!currentIncident || currentIncident.status !== 'open') {
        return problem(c, 403, 'Forbidden', 'Solo puedes editar incidencias en estado abierto')
      }
      if (departmentId !== undefined && departmentId !== currentIncident.affected_area_id) {
        return problem(c, 403, 'Forbidden', 'Los técnicos no pueden cambiar el área afectada')
      }
      if (rest && (rest as any).status) {
        return problem(c, 403, 'Forbidden', 'Los técnicos no pueden cambiar el estado de las incidencias')
      }
    }

    const { data, error } = await supa
      .from('incidents')
      .update({ ...updatePayload, last_modified_by: user.id })
      .eq('id', id)
      .select('id, status')
      .single()
    if (error) return problem(c, 500, 'UpdateFailed', error.message)
    // Broadcast realtime (best-effort)
    try {
      await supa.channel('incidents').send({
        type: 'broadcast',
        event: 'incident_updated',
        payload: { id, updated_by: user.id, changes: updatePayload }
      })
    } catch (_) {}

    // Log de actividad (best-effort)
    try {
      await supa.rpc('log_activity', {
        p_user_id: user.id,
        p_action: 'incident_updated',
        p_details: JSON.stringify({ incident_id: id, changes: updatePayload })
      })
    } catch (_) {}

    return c.json({ ok: true, id: data.id })
  } catch (e) {
    return problem(c, 500, 'UnhandledError', (e as Error).message)
  }
}


