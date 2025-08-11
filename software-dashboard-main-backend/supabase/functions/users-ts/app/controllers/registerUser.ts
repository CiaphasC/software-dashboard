/**
 * POST /users-ts/register
 * Crea una solicitud de registro pública (sin autenticación).
 * Reglas:
 *  - Evita duplicados por email tanto en `profiles` como en `registration_requests` (status pending).
 *  - Resuelve `department` a `department_id` mediante servicio.
 *  - Registra actividad informativa para auditoría.
 */
import type { Context } from 'hono'
import type { RegisterUserInput } from '@schemas/user.schema.ts'
import { problem } from '@shared/errors.ts'
import { UserService } from '@services/user.service.ts'

export async function registerUser(c: Context) {
  const supa = c.get('supa')
  const { name, email, password, department, requestedRole } = c.get('dto') as RegisterUserInput

  const { data: exists } = await supa.from('profiles').select('email').eq('email', email).maybeSingle()
  if (exists) return problem(c, 409, 'Conflict', 'Email ya registrado')

  const { data: pending } = await supa
    .from('registration_requests')
    .select('email')
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle()
  if (pending) return problem(c, 409, 'Conflict', 'Solicitud pendiente existente')

  const service = new UserService(supa)
  let deptId: number
  try {
    deptId = await service.findDepartmentId(department)
  } catch (e) {
    return problem(c, 400, 'ValidationError', (e as Error).message)
  }

  const { data, error } = await supa
    .from('registration_requests')
    .insert({
      name,
      email,
      password, // considera migrar a flujo sin almacenar password
      department_id: deptId,
      requested_role: requestedRole,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return problem(c, 400, 'InsertFailed', error.message)

  await supa.rpc('log_activity', {
    p_type: 'registration',
    p_action: 'requested',
    p_title: 'Nueva solicitud de registro',
    p_description: `Usuario ${email} solicitó registro como ${requestedRole}`,
    p_item_id: data.id,
  })

  return c.json({ success: true, message: 'Solicitud de registro creada' }, 201)
}