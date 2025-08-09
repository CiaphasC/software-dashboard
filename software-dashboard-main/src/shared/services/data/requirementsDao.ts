import { supabase } from '@/shared/services/supabase/client'

export interface ListParams {
  page?: number
  limit?: number
  search?: string
  filters?: Record<string, unknown>
}

export async function list(params: ListParams): Promise<{ items: unknown[]; total: number; page: number; limit: number; hasMore: boolean }> {
  const page = params.page ?? 1
  const limit = params.limit ?? 10
  const offset = (page - 1) * limit
  let query = supabase.from('requirements_with_times').select('*', { count: 'exact' })
  const f = params.filters || {}

  if (f['status']) query = query.eq('status', f['status'] as string)
  if (f['priority']) query = query.eq('priority', f['priority'] as string)
  if (f['type']) query = query.eq('type', f['type'] as string)
  if (f['assignedTo']) query = query.eq('assigned_to', f['assignedTo'] as string)
  if (f['createdBy']) query = query.eq('created_by', f['createdBy'] as string)
  if (f['department']) query = query.eq('requesting_area_name', f['department'] as string)
  if (f['dateFrom']) query = query.gte('created_at', f['dateFrom'] as string)
  if (f['dateTo']) query = query.lte('created_at', f['dateTo'] as string)
  if (params.search) query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error) throw error
  const total = count || 0
  const hasMore = page * limit < total
  return { items: data || [], total, page, limit, hasMore }
}

export async function get(id: string): Promise<unknown | null> {
  const { data } = await supabase.from('requirements_with_times').select('*').eq('id', id).single()
  return data ?? null
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('requirements').delete().eq('id', id)
  if (error) throw error
}

export async function metrics(): Promise<{ totalRequirements: number; pendingRequirements: number; inProgressRequirements: number; completedRequirements: number; deliveredRequirements: number }> {
  const [totalRes, pendingRes, inProgRes, completedRes, deliveredRes] = await Promise.all([
    supabase.from('requirements').select('*', { count: 'exact', head: true }),
    supabase.from('requirements').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('requirements').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
    supabase.from('requirements').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('requirements').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
  ])
  return {
    totalRequirements: totalRes.count || 0,
    pendingRequirements: pendingRes.count || 0,
    inProgressRequirements: inProgRes.count || 0,
    completedRequirements: completedRes.count || 0,
    deliveredRequirements: deliveredRes.count || 0,
  }
}

