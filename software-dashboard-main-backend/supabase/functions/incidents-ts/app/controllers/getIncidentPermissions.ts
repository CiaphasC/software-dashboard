/**
 * GET /incidents-ts/permissions y GET /incidents-ts/:id/permissions
 * Determina permisos de edición/renderizado según rol y estado de la incidencia.
 */
import type { Context } from 'hono'
import { adminClient } from "@shared/clients.ts"
import { getAuthUser } from "@shared/auth.ts"
import { problem } from "@shared/errors.ts"

export async function getIncidentPermissions(c: Context) {
  try {
    const supa = adminClient()
    const user = await getAuthUser(c.req.raw, supa)

    const id = c.req.param('id')

    const { data: profile, error: profErr } = await supa
      .from('profiles')
      .select('role_name')
      .eq('id', user.id)
      .single()
    if (profErr || !profile) return problem(c, 403, 'Forbidden', 'Perfil no encontrado')

    const role = profile.role_name

    if (role === 'admin') {
      return c.json({
        allowedFields: ['title', 'description', 'type', 'priority', 'status', 'affectedArea', 'assignedTo'],
        canEditStatus: true,
        canEditArea: true,
        canEditContent: true,
        isReadOnly: false,
        message: 'Administrador con permisos completos'
      })
    }

    if (role === 'technician') {
      // Si no hay id, permisos para crear
      if (!id) {
        return c.json({
          allowedFields: ['title', 'description', 'type', 'priority', 'assignedTo'],
          canEditStatus: false,
          canEditArea: true,
          canEditContent: true,
          isReadOnly: false,
          message: 'Técnico puede crear incidencias'
        })
      }

      // Para incidencias existentes, evaluar por estado
      const { data: incident, error: incErr } = await supa
        .from('incidents')
        .select('status')
        .eq('id', id)
        .maybeSingle()
      if (incErr || !incident) return problem(c, 404, 'NotFound', 'Incidencia no encontrada')

      const isOpen = incident.status === 'open'
      return c.json({
        allowedFields: ['title', 'description', 'type', 'priority', 'assignedTo'],
        canEditStatus: false,
        canEditArea: false,
        canEditContent: isOpen,
        isReadOnly: !isOpen,
        message: isOpen ? 'Técnico puede editar contenido' : 'Técnico sin permisos para editar en este estado'
      })
    }

    return c.json({
      allowedFields: [],
      canEditStatus: false,
      canEditArea: false,
      canEditContent: false,
      isReadOnly: true,
      message: 'Usuario sin permisos'
    })
  } catch (e) {
    return problem(c, 500, 'UnhandledError', (e as Error).message)
  }
}


