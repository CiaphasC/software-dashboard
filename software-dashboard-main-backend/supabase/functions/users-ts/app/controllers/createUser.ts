/**
 * POST /users-ts
 * Crea un usuario en Supabase Auth y actualiza su perfil en `public.profiles`.
 * Reglas:
 *  - Valida rol y departamento vía servicio (evitar duplicación de lógica).
 *  - Confirma email y marca perfil como activo/verificado.
 *  - En error de perfil, realiza rollback eliminando el usuario Auth creado.
 *  - Registra actividad (no bloqueante) con detalles del actor y objetivo.
 */
import type { Context } from 'hono'
import type { CreateUserInput } from '@schemas/user.schema.ts'
import { problem } from '@shared/errors.ts'
import { UserService } from '@services/user.service.ts'

export async function createUser(c: Context) {
  const supa = c.get('supa')
  const { user, profile } = c.get('auth') // AppAuth
  const { name, email, password, role, department, isActive } = c.get('dto') as CreateUserInput

  const service = new UserService(supa)

  let roleId: number
  try {
    roleId = await service.findRoleIdByName(role)
  } catch (e) {
    return problem(c, 400, 'ValidationError', (e as Error).message)
  }

  let deptId: number
  try {
    deptId = await service.findDepartmentId(department)
  } catch (e) {
    return problem(c, 400, 'ValidationError', (e as Error).message)
  }

  const { data: created, error: createErr } = await supa.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })
  if (createErr || !created?.user) {
    return problem(c, 409, 'CreateFailed', createErr?.message ?? 'No se pudo crear el usuario')
  }

  const { error: profErr } = await supa
    .from('profiles')
    .update({
      role_id: roleId,
      role_name: role,
      department_id: deptId,
      is_active: isActive ?? true,
      is_email_verified: true,
    })
    .eq('id', created.user.id)

  if (profErr) {
    await supa.auth.admin.deleteUser(created.user.id) // compensación
    return problem(c, 400, 'ProfileUpdateFailed', profErr.message)
  }

  // Logging no bloqueante
  try {
    const actorName = profile?.name || 'Usuario'
    const actorEmail = profile?.email || user?.email || ''
    const actorRole = profile?.role_name || ''
    await supa.rpc('log_activity', {
      p_type: 'user',
      p_action: 'created',
      p_title: 'Usuario creado',
      p_description: `${actorName} (${actorEmail}) [${actorRole}] creó a ${name} (${email}) [${role}]`,
      p_user_id: user.id,
      p_item_id: created.user.id,
    })
  } catch (_) {}

  return c.json({ success: true, user: { id: created.user.id } }, 201)
}