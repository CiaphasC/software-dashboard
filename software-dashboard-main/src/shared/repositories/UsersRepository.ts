import { edgeFunctionsService } from '@/shared/services/supabase'
import type { UserDomain, UserListResult, UserMetricsDomain } from '@/shared/domain/user'

function mapToDomain(p: any): UserDomain {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role_name,
    departmentId: p.department_id ?? null,
    isActive: !!p.is_active,
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
    return edgeFunctionsService.getUserMetrics()
  }

  async get(id: string): Promise<UserDomain | null> {
    const item = await edgeFunctionsService.getUser(id)
    return item ? mapToDomain(item) : null
  }

  async update(id: string, updates: Partial<{ name: string; role: string; departmentId: number; isActive: boolean }>): Promise<UserDomain> {
    const mapped = {
      name: updates.name,
      role_name: updates.role,
      department_id: updates.departmentId,
      is_active: updates.isActive,
    }
    const res = await edgeFunctionsService.updateUser(id, mapped)
    return mapToDomain(res)
  }

  async delete(id: string): Promise<void> { await edgeFunctionsService.deleteUser(id) }
}

export const usersRepository = new UsersRepository()

