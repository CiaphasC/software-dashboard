/**
 * PATCH /users-ts/:id
 * Actualiza parcialmente el perfil del usuario y, opcionalmente, su contraseña en Auth.
 * Reglas:
 *  - Solo campos presentes son modificados (partial update).
 *  - Si cambia `department` o `role`, se resuelven a sus IDs mediante servicio.
 *  - Si `password` está presente, se actualiza vía `auth.admin.updateUserById`.
 *  - Devuelve el perfil enriquecido desde `profiles_with_roles`.
 */
import type { Context } from 'hono'
import type { UpdateUserInput } from '@schemas/user.schema.ts'
import { problem } from '@shared/errors.ts'
import { UserService } from '@services/user.service.ts'

export async function updateUser(c: Context) {
  const supa = c.get('supa')
  const id = c.req.param('id')
  const { name, email, role, department, isActive, password } = c.get('dto') as UpdateUserInput

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name
  if (email !== undefined) updates.email = email
  if (isActive !== undefined) updates.is_active = isActive

  const service = new UserService(supa)
  if (department) {
    try {
      updates.department_id = await service.findDepartmentId(department)
    } catch (e) {
      return problem(c, 400, 'ValidationError', (e as Error).message)
    }
  }
  if (role) {
    try {
      updates.role_id = await service.findRoleIdByName(role)
      updates.role_name = role
    } catch (e) {
      return problem(c, 400, 'ValidationError', (e as Error).message)
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error: profErr } = await supa.from('profiles').update(updates).eq('id', id)
    if (profErr) return problem(c, 400, 'UpdateFailed', profErr.message)
  }

  if (password) {
    const { error: passErr } = await supa.auth.admin.updateUserById(id, { password })
    if (passErr) return problem(c, 400, 'UpdateFailed', passErr.message)
  }

  const { data, error } = await supa.from('profiles_with_roles').select('*').eq('id', id).single()
  if (error) return problem(c, 500, 'QueryFailed', error.message)
  return c.json({ success: true, user: data })
}