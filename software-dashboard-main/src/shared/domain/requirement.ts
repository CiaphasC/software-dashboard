// =============================================================================
// DOMAIN TYPES - Requerimientos
// =============================================================================

export type RequirementStatus = 'pending' | 'in_progress' | 'completed' | 'delivered' | 'closed' | string
export type RequirementPriority = 'low' | 'medium' | 'high' | 'critical' | string
export type RequirementType = 'document' | 'equipment' | 'service' | 'other' | string

export interface RequirementDomain {
  id: string
  title: string
  description: string
  status: RequirementStatus
  priority: RequirementPriority
  type: RequirementType
  createdAt: string
  estimatedDeliveryDate?: string | null
  requestingAreaName?: string | null
  creatorName?: string | null
}

export interface RequirementMetricsDomain {
  totalRequirements: number
  pendingRequirements: number
  inProgressRequirements: number
  completedRequirements: number
  deliveredRequirements: number
}

export interface RequirementListResult<TItem = RequirementDomain> {
  items: TItem[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

