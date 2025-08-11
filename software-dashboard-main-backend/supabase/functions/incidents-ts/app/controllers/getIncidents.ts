/**
 * GET /incidents-ts/
 * Lista incidencias con filtros y paginación. Protegido por Auth.
 * Parámetros (query): status, priority, type, assignedTo, createdBy,
 * department, dateFrom, dateTo, search, page, limit.
 */
import type { Context } from 'hono'
import { adminClient } from "@shared/clients.ts"
import { getAuthUser } from "@shared/auth.ts"
import { problem } from "@shared/errors.ts"

export async function getIncidents(c: Context) {
  try {
    const supa = adminClient()
    const user = await getAuthUser(c.req.raw, supa)
    if (!user) return problem(c, 401, 'Unauthorized')

    const status = c.req.query('status')
    const priority = c.req.query('priority')
    const type = c.req.query('type')
    const assignedTo = c.req.query('assignedTo')
    const createdBy = c.req.query('createdBy')
    const department = c.req.query('department')
    const dateFrom = c.req.query('dateFrom')
    const dateTo = c.req.query('dateTo')
    const search = c.req.query('search')

    const requestedLimit = Number(c.req.query('limit') ?? 20)
    const limit = Math.max(1, Math.min(100, requestedLimit))
    const requestedPage = Number(c.req.query('page') ?? 1)
    const page = Math.max(1, requestedPage)

    // Base para conteo total
    let base = supa.from('incidents_with_times').select('*', { count: 'exact' })
    if (status) base = base.eq('status', status)
    if (priority) base = base.eq('priority', priority)
    if (type) base = base.eq('type', type)
    if (assignedTo) base = base.eq('assigned_to', assignedTo)
    if (createdBy) base = base.eq('created_by', createdBy)
    if (department) base = base.eq('affected_area_name', department)
    if (dateFrom) base = base.gte('created_at', dateFrom)
    if (dateTo) base = base.lte('created_at', dateTo)
    if (search) base = base.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

    // Obtener total primero para calcular página efectiva y evitar 416
    const { count: total, error: countError } = await base.select('*', { count: 'exact', head: true })
    if (countError) return problem(c, 500, 'QueryFailed', countError.message)
    const totalCount = total ?? 0
    const lastPage = Math.max(1, Math.ceil(totalCount / limit))
    const pageEff = Math.min(page, lastPage)
    if (totalCount === 0) {
      return c.json({ items: [], total: 0, page: 1, limit, hasMore: false })
    }

    const offset = (pageEff - 1) * limit
    const { data, error } = await base
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) return problem(c, 500, 'QueryFailed', error.message)

    const hasMore = pageEff * limit < totalCount
    return c.json({ items: data ?? [], total: totalCount, page: pageEff, limit, hasMore })
  } catch (e) {
    return problem(c, 500, 'UnhandledError', (e as Error).message)
  }
}


