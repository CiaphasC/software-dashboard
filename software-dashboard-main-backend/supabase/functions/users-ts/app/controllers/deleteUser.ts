/**
 * DELETE /users-ts/:id
 * Borrado duro en dos fases: (1) Elimina perfil (dispara trigger BEFORE DELETE
 * para limpiar o reasignar FKs), (2) Best-effort para eliminar del Auth.
 * Reglas:
 *  - Prohíbe auto-eliminación.
 *  - Registra actividad con detalles del actor y objetivo, sin bloquear flujo.
 */
import type { Context } from 'hono'
import { problem } from '@shared/errors.ts'

export async function deleteUser(c: Context) {
  const supa = c.get('supa')
  const { user: current, profile } = c.get('auth')

  const id = c.req.param('id')
  if (id === current.id) {
    return problem(c, 403, 'Forbidden', 'No puedes eliminar tu propia cuenta')
  }

  // Info target para logging
  const { data: targetInfo } = await supa
    .from('profiles_with_roles')
    .select('name, email, role_name')
    .eq('id', id)
    .maybeSingle()

  // Intentar obtener en Auth
  const { data: got, error: getAuthErr } = await supa.auth.admin.getUserById(id)

  // Borrar perfil primero
  const { error: delProfErr } = await supa.from('profiles').delete().eq('id', id)
  if (delProfErr && delProfErr.code !== 'PGRST116') {
    return problem(c, 400, 'DeleteFailed', delProfErr.message)
  }

  // Logging (actor -> target)
  try {
    const actorName = profile?.name || 'Usuario'
    const actorEmail = profile?.email || ''
    const actorRole = profile?.role_name || ''
    const tgtName = targetInfo?.name || ''
    const tgtEmail = targetInfo?.email || ''
    const tgtRole = targetInfo?.role_name || ''
    await supa.rpc('log_activity', {
      p_type: 'user',
      p_action: 'deleted',
      p_title: 'Usuario eliminado',
      p_description: `${actorName} (${actorEmail}) [${actorRole}] eliminó a ${tgtName} (${tgtEmail}) [${tgtRole}]`,
      p_user_id: current.id,
      p_item_id: id,
    })
  } catch (_) {}

  // Luego intentar borrar en Auth si existe
  if (!getAuthErr && got?.user) {
    const { error: delErr } = await supa.auth.admin.deleteUser(id)
    if (delErr) console.error('auth.admin.deleteUser error:', delErr)
  }

  return c.json({ success: true, deleted: true })
}