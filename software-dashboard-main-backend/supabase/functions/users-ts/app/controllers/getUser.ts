/**
 * GET /users-ts/:id
 * Devuelve un usuario por id desde la vista `profiles_with_roles`.
 * Incluye datos enriquecidos de rol y departamento.
 */
import type { Context } from 'hono'
import { problem } from '@shared/errors.ts'
import { toUserDTO } from '@shared/transformers.ts'

export async function getUser(c: Context) {
  const supa = c.get('supa')
  const id = c.req.param('id')

  const { data, error } = await supa
    .from('profiles_with_roles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return problem(c, 404, 'NotFound', error.message)
  }

  return c.json(toUserDTO(data))
}