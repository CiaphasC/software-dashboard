import { edgeFunctionsService } from '@/shared/services/supabase'
import type { UserDomain, UserListResult, UserMetricsDomain } from '@/shared/domain/user'

function mapToDomain(p: any): UserDomain {
  const departmentName = p.department?.short_name || p.department?.name || p.department_short_name || p.department_name || null
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role_name,
    departmentId: p.department_id ?? p.department?.id ?? null,
    // Exponer 'department' para UI (no está en UserDomain por tipo). Lo añadimos en runtime.
    // @ts-ignore
    department: departmentName || 'Sin departamento',
    // Exponer 'lastLoginAt' para UI (no está en UserDomain por tipo). Lo añadimos en runtime.
    // @ts-ignore
    lastLoginAt: p.last_login_at ? new Date(p.last_login_at) : undefined,
    // Exponer fechas base para UI
    // @ts-ignore
    createdAt: p.created_at ? new Date(p.created_at) : undefined,
    // @ts-ignore
    updatedAt: p.updated_at ? new Date(p.updated_at) : undefined,
    isActive: p.is_active === undefined ? true : !!p.is_active,
  }
}

export class UsersRepository {
  async list(query: { page?: number; limit?: number; search?: string; role?: string } = {}): Promise<UserListResult> {
    const page = query.page ?? 1
    const limit = query.limit ?? 20
    const res = await edgeFunctionsService.listUsers({ page, limit, search: query.search, role: query.role })
    return { items: (res.items || []).map(mapToDomain), total: res.total, page: res.page, limit: res.limit, hasMore: res.hasMore }
  }

  async metrics(): Promise<UserMetricsDomain> {
    // Evitar acoplamiento directo: obtener lista completa vía Edge Function y calcular
    const { items, total } = await edgeFunctionsService.listUsers({ page: 1, limit: 10000 })
    const users = (items || []) as Array<{ role_name: string; is_active?: boolean }>
    const totalUsers = total ?? users.length
    const activeUsers = users.filter(u => u.is_active !== false).length
    const inactiveUsers = totalUsers - activeUsers
    const admins = users.filter(u => u.role_name === 'admin').length
    const technicians = users.filter(u => u.role_name === 'technician').length
    const requesters = users.filter(u => u.role_name === 'requester').length
    return { totalUsers, activeUsers, inactiveUsers, admins, technicians, requesters }
  }

  async get(id: string): Promise<UserDomain | null> {
    const item = await edgeFunctionsService.getUser(id)
    return item ? mapToDomain(item) : null
  }

  async update(id: string, updates: Partial<{ name: string; role: string; departmentId: number; isActive: boolean }>): Promise<UserDomain> {
    const payload: Record<string, unknown> = {}
    if (updates.name !== undefined) payload.name = updates.name
    if (updates.role !== undefined) payload.role = updates.role
    if (updates.departmentId !== undefined) payload.department = String(updates.departmentId)
    if (updates.isActive !== undefined) payload.isActive = updates.isActive
    const { user } = await edgeFunctionsService.updateUser(id, payload as any)
    return mapToDomain(user)
  }

  async delete(id: string): Promise<void> { await edgeFunctionsService.deleteUser(id) }
}

export const usersRepository = new UsersRepository()

