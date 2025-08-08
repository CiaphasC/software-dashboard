// =============================================================================
// DOMAIN TYPES - Usuarios
// =============================================================================

export type UserRole = 'admin' | 'technician' | 'requester' | string

export interface UserDomain {
  id: string
  name: string
  email: string
  role: UserRole
  departmentId?: number | null
  isActive: boolean
}

export interface UserMetricsDomain {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  admins: number
  technicians: number
  requesters: number
}

export interface UserListResult<TItem = UserDomain> {
  items: TItem[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

