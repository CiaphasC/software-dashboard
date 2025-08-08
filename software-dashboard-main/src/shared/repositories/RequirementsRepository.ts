import { edgeFunctionsService } from '@/shared/services/supabase'
import type { RequirementWithUsers } from '@/shared/services/supabase/types'
import type { RequirementDomain, RequirementListResult, RequirementMetricsDomain } from '@/shared/domain/requirement'

export interface RequirementQuery {
  page?: number
  limit?: number
  search?: string
  filters?: Record<string, any>
}

function mapToDomain(r: RequirementWithUsers): RequirementDomain {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    status: r.status,
    priority: r.priority,
    type: r.type,
    createdAt: r.created_at,
    estimatedDeliveryDate: (r as any).estimated_delivery_date ?? null,
    requestingAreaName: (r as any).requesting_area_name ?? null,
    creatorName: (r as any).creator_name ?? null,
  }
}

export class RequirementsRepository {
  async list(query: RequirementQuery = {}): Promise<RequirementListResult> {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const res = await edgeFunctionsService.listRequirements({ page, limit, search: query.search, filters: query.filters })
    return { items: (res.items || []).map(mapToDomain), total: res.total, page: res.page, limit: res.limit, hasMore: res.hasMore }
  }

  async metrics(): Promise<RequirementMetricsDomain> {
    return edgeFunctionsService.getRequirementMetrics()
  }

  async get(id: string): Promise<RequirementDomain | null> {
    const item = await edgeFunctionsService.getRequirement(id)
    return item ? mapToDomain(item) : null
  }
}

export const requirementsRepository = new RequirementsRepository()

