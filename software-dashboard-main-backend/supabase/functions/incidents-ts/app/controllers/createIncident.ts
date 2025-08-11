/**
 * POST /incidents-ts/
 * Crea una incidencia en estado 'open'. Requiere rol admin o technician.
 * Valida payload con Zod y verifica referencias (departamento/usuario asignado).
 */
import type { Context } from 'hono'
import { adminClient } from "@shared/clients.ts"
import { getAuthUser, ensureAdminOrTechnician } from "@shared/auth.ts"
import { problem } from "@shared/errors.ts"
import { IncidentCreateSchema } from "@schemas/incident.schema.ts"
import { IncidentService } from "@services/incident.service.ts"

export async function createIncident(c: Context) {
  try {
    const supa = adminClient()
    const user = await getAuthUser(c.req.raw, supa)
    await ensureAdminOrTechnician(supa, user.id)

    const json = await c.req.json()
    const parsed = IncidentCreateSchema.safeParse(json)
    if (!parsed.success) return problem(c, 400, 'ValidationError', parsed.error.format())
    const { title, description, departmentId, type, priority, assignedTo } = parsed.data

    const service = new IncidentService(supa)
    try { await service.ensureDepartmentExists(departmentId) } catch (e) { return problem(c, 400, 'ValidationError', (e as Error).message) }

    if (assignedTo) { try { await service.ensureAssigneeExists(assignedTo) } catch (e) { return problem(c, 400, 'ValidationError', (e as Error).message) } }

    const { data, error } = await supa
      .from('incidents')
      .insert({
        title,
        description: description ?? '',
        affected_area_id: departmentId,
        type,
        priority,
        status: 'open',
        assigned_to: assignedTo ?? null,
        created_by: user.id,
      })
      .select('*')
      .single()
    if (error) return problem(c, 500, 'InsertFailed', error.message)

    // Logging de actividad (no bloqueante)
    try {
      await supa.rpc('log_activity', {
        p_user_id: user.id,
        p_action: 'incident_created',
        p_details: JSON.stringify({ incident_id: data.id, title })
      })
    } catch (_) {}

    // Notificación si hay asignación
    if (assignedTo) {
      try {
        await supa.rpc('create_notification', {
          p_user_id: assignedTo,
          p_title: 'Nueva incidencia asignada',
          p_message: `Se te ha asignado la incidencia: ${title}`,
          p_type: 'incident',
          p_priority: priority
        })
      } catch (_) {}
    }

    // Broadcast realtime (best-effort)
    try {
      await supa.channel('incidents').send({
        type: 'broadcast',
        event: 'incident_created',
        payload: { id: data.id, title, created_by: user.id }
      })
    } catch (_) {}

    return c.json({ id: data.id, status: data.status, createdAt: data.created_at }, 201)
  } catch (e) {
    return problem(c, 500, 'UnhandledError', (e as Error).message)
  }
}


