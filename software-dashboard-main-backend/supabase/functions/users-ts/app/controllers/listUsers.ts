/**
 * GET /users-ts
 * Lista usuarios con filtros y paginación.
 * Parámetros de consulta: search, role, page, limit
 * Regla: respuesta paginada con conteo exacto (HEAD) y orden por created_at desc.
 */
import type { Context } from 'hono'
import { problem } from '@shared/errors.ts'
import { toUserDTO } from '@shared/transformers.ts'

export async function listUsers(c: Context) {
  const supa = c.get('supa')

  const search = c.req.query('search') || undefined
  const role = c.req.query('role') || undefined
  const requestedLimit = Number(c.req.query('limit') ?? 20)
  const limit = Math.max(1, Math.min(100, requestedLimit))
  const requestedPage = Number(c.req.query('page') ?? 1)
  const page = Math.max(1, requestedPage)

  let base = supa.from('profiles_with_roles').select('*', { count: 'exact' })
  if (role) base = base.eq('role_name', role)
  if (search) base = base.or(`name.ilike.%${search}%,email.ilike.%${search}%`) // OR + ILIKE (PostgREST). :contentReference[oaicite:1]{index=1}

  // Conteo (HEAD)
  const { count, error: countError } = await base.select('*', { count: 'exact', head: true })
  if (countError) return problem(c, 500, 'QueryFailed', countError.message)

  const total = count ?? 0
  if (total === 0) return c.json({ items: [], total: 0, page: 1, limit, hasMore: false })

  const lastPage = Math.max(1, Math.ceil(total / limit))
  const pageEff = Math.min(page, lastPage)
  const offset = (pageEff - 1) * limit

  const { data, error } = await base
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) return problem(c, 500, 'QueryFailed', error.message)

  const hasMore = pageEff * limit < total
  const items = (data ?? []).map(toUserDTO)

  return c.json({ items, total, page: pageEff, limit, hasMore })
}