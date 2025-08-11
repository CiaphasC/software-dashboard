// =============================================================================
// EDGE FUNCTIONS SERVICE - Servicio para comunicación con Edge Functions
// Arquitectura de Software Profesional - Comunicación con Edge Functions
// =============================================================================

import { supabase } from './client';
import type {
  EdgeFnEnvelope,
  EdgeUser,
  ListUsersParams,
  ListResult,
  ListIncidentsParams,
  IncidentMetrics,
  ListRequirementsParams,
  ItemDetails,
  ItemDetailsRequest,
  CatalogsData
} from './functions.types'

// =============================================================================
// TYPES - Tipos para edge functions
// =============================================================================

export interface EdgeFunctionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateIncidentData {
  title: string;
  description: string;
  type: string;
  priority: string;
  affected_area_id: string;
  assigned_to?: string | null;
}

export interface UpdateIncidentData {
  title?: string;
  description?: string;
  affected_area_id?: string;
  type?: string;
  priority?: string;
  status?: string;
  assigned_to?: string | null;
}

export interface CreateRequirementData {
  title: string;
  description: string;
  type: string;
  priority: string;
  requesting_area_id: string;
  assigned_to?: string | null;
}

export interface UpdateRequirementData {
  title?: string;
  description?: string;
  requesting_area_id?: string;
  type?: string;
  priority?: string;
  status?: string;
  assigned_to?: string | null;
}

// =============================================================================
// EDGE FUNCTIONS SERVICE - Clase principal
// =============================================================================

export class EdgeFunctionsService {
  constructor() {}

  // Helper genérico para llamar edge functions (usando supabase.functions.invoke)
  private async callEdgeFunction<TData, TBody = unknown>(functionName: string, body: TBody): Promise<TData> {
    const { data, error } = await supabase.functions.invoke<EdgeFnEnvelope<TData>>(functionName, { body: body as any })
    if (error) throw new Error(error.message)
    if (!data?.success) throw new Error(data?.error || `Error en ${functionName}`)
    return data.data as TData
  }

  // =============================================
  // Helper HTTP para Hono router con subrutas
  // =============================================
  private async functionsFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
    const baseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string
    if (!baseUrl) throw new Error('VITE_SUPABASE_URL no configurada')
    const url = `${baseUrl.replace(/\/$/, '')}/functions/v1/incidents-ts${path}`
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    const anonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(anonKey ? { apikey: anonKey } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers as Record<string, string> || {}),
    }
    const res = await fetch(url, { ...init, headers })
    const isJson = res.headers.get('content-type')?.includes('application/json')
    const payload = isJson ? await res.json() : await res.text()
    if (!res.ok) {
      const detail = isJson ? (payload?.detail || payload?.error || JSON.stringify(payload)) : payload
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
    }
    return payload as T
  }

  // Helper HTTP para users-ts
  private async usersFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
    const baseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string
    if (!baseUrl) throw new Error('VITE_SUPABASE_URL no configurada')
    const url = `${baseUrl.replace(/\/$/, '')}/functions/v1/users-ts${path}`
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    const anonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(anonKey ? { apikey: anonKey } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers as Record<string, string> || {}),
    }
    const res = await fetch(url, { ...init, headers })
    const isJson = res.headers.get('content-type')?.includes('application/json')
    const payload = isJson ? await res.json() : await res.text()
    if (!res.ok) {
      const detail = isJson ? (payload?.detail || payload?.error || JSON.stringify(payload)) : payload
      throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
    }
    return payload as T
  }

  // Streaming NDJSON de Edge Function
  async streamFunction<T = any>(_functionName: string, _data: any, _onMessage: (chunk: T) => void): Promise<void> {
    // Opcional: implementar si usamos streaming; por ahora, no se usa
    throw new Error('streamFunction no implementado con functions.invoke')
  }

  // =============================================================================
  // INCIDENTS - Funciones para incidencias
  // =============================================================================

  /**
   * Crear nueva incidencia
   */
  async createIncident(data: CreateIncidentData): Promise<any> {
    const body = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      departmentId: Number(data.affected_area_id),
      assignedTo: data.assigned_to ?? undefined,
    }
    return this.functionsFetch('', { method: 'POST', body: JSON.stringify(body) })
  }

  /**
   * Actualizar incidencia
   */
  async updateIncident(incidentId: string, data: UpdateIncidentData): Promise<any> {
    const body: Record<string, unknown> = {}
    if (data.title !== undefined) body.title = data.title
    if (data.description !== undefined) body.description = data.description
    if (data.type !== undefined) body.type = data.type
    if (data.priority !== undefined) body.priority = data.priority
    if (data.assigned_to !== undefined) body.assignedTo = data.assigned_to
    if (data.affected_area_id !== undefined) body.departmentId = Number(data.affected_area_id)
    // status no se actualiza por este endpoint
    return this.functionsFetch(`/${encodeURIComponent(incidentId)}`, { method: 'PATCH', body: JSON.stringify(body) })
  }

  /**
   * Actualizar estado de incidencia
   */
  async updateIncidentStatus(incidentId: string, status: string, _resolvedAt?: string): Promise<any> {
    return this.functionsFetch(`/${encodeURIComponent(incidentId)}/status`, { method: 'POST', body: JSON.stringify({ status }) })
  }

  // Lista paginada de incidencias mediante Edge Function
  async listIncidents(params: ListIncidentsParams): Promise<ListResult<Record<string, unknown>>> {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    if (params.search) q.set('search', params.search)
    const filters = (params.filters || {}) as Record<string, unknown>
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
    }
    const qs = q.toString()
    const path = qs ? `?${qs}` : ''
    return this.functionsFetch(path, { method: 'GET' })
  }

  // Métricas de incidencias mediante Edge Function
  async getIncidentMetrics(): Promise<IncidentMetrics> {
    return this.functionsFetch('/metrics/summary', { method: 'GET' })
  }

  async getIncident(id: string): Promise<Record<string, unknown>> {
    return this.functionsFetch(`/${encodeURIComponent(id)}`, { method: 'GET' })
  }

  async deleteIncident(id: string): Promise<void> {
    await this.functionsFetch(`/${encodeURIComponent(id)}`, { method: 'DELETE' })
  }

  // =============================================================================
  // REQUIREMENTS - Funciones para requerimientos
  // =============================================================================

  /**
   * Crear nuevo requerimiento
   */
  async createRequirement(data: CreateRequirementData): Promise<any> {
    return this.callEdgeFunction('create-requirement-ts', { requirementData: data });
  }

  /**
   * Actualizar requerimiento
   */
  async updateRequirement(requirementId: string, data: UpdateRequirementData): Promise<any> {
    return this.callEdgeFunction('update-requirement-ts', { 
      requirementId, 
      requirementData: data 
    });
  }

  /**
   * Actualizar estado de requerimiento
   */
  async updateRequirementStatus(requirementId: string, status: string, deliveredAt?: string): Promise<any> {
    return this.callEdgeFunction('update-requirement-status-ts', { 
      requirementId, 
      newStatus: status, 
      deliveredAt 
    });
  }

  // Lista de requerimientos (solo Edge Function)
  async listRequirements(params: ListRequirementsParams): Promise<ListResult<Record<string, unknown>>> {
    const data = await this.callEdgeFunction<ListResult<Record<string, unknown>>, { action: 'list'; params: ListRequirementsParams }>('get-requirement-ts', { action: 'list', params })
    return data
  }

  // Detalles de item (incidente o requerimiento)
  async getItemDetails(itemType: 'incident' | 'requirement', itemId: string): Promise<ItemDetails | null> {
    const data = await this.callEdgeFunction<ItemDetails, ItemDetailsRequest>('get-item-details-ts', { item_type: itemType, item_id: itemId })
    return data
  }

  // Eliminación de requerimientos: requeriría Edge Function dedicada (no implementada aquí)
  async deleteRequirement(_id: string): Promise<void> {
    throw new Error('deleteRequirement no implementado; use Edge Function dedicada')
  }

  async getRequirementMetrics(): Promise<{ totalRequirements: number; pendingRequirements: number; inProgressRequirements: number; completedRequirements: number; deliveredRequirements: number; }> {
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

  // =============================================================================
  // GENERIC - Funciones genéricas para futuras extensiones
  // =============================================================================

  /**
   * Llamar cualquier edge function genérico
   */
  async callGenericFunction<T = any>(functionName: string, data: any): Promise<T> {
    return this.callEdgeFunction<T>(functionName, data);
  }

  /**
   * Obtener permisos de renderizado (genérico)
   */
  async getRenderPermissions(itemType: 'incident' | 'requirement', itemId?: string): Promise<any> {
    if (itemType === 'incident') {
      const path = itemId ? `/${encodeURIComponent(itemId)}/permissions` : '/permissions'
      return this.functionsFetch(path, { method: 'GET' })
    }
    const functionName = 'update-requirement-ts'
    return this.callEdgeFunction(functionName, { [`${itemType}_id`]: itemId, action: 'get_permissions' })
  }

  /**
   * USERS - Métodos estandarizados
   */
  async listUsers(params?: ListUsersParams): Promise<ListResult<EdgeUser>> {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.limit) q.set('limit', String(params.limit))
    if (params?.search) q.set('search', params.search)
    if (params?.role) q.set('role', params.role)
    const qs = q.toString()
    const path = qs ? `?${qs}` : ''
    return this.usersFetch<ListResult<EdgeUser>>(path, { method: 'GET' })
  }

  async getUser(userId: string): Promise<EdgeUser | null> {
    return this.usersFetch<EdgeUser>(`/${encodeURIComponent(userId)}`, { method: 'GET' })
  }

  async updateUser(userId: string, updates: Partial<{ name: string; email: string; role: string; department: string; isActive: boolean; password: string }>): Promise<{ success: boolean; user: any }> {
    return this.usersFetch<{ success: boolean; user: any }>(`/${encodeURIComponent(userId)}`, { method: 'PATCH', body: JSON.stringify(updates) })
  }

  async deleteUser(userId: string): Promise<void> {
    await this.usersFetch<void>(`/${encodeURIComponent(userId)}`, { method: 'DELETE' })
  }

  async createUser(payload: { name: string; email: string; password: string; role: string; department: string; isActive?: boolean }): Promise<{ success: boolean; user: { id: string } }> {
    return this.usersFetch<{ success: boolean; user: { id: string } }>(``, { method: 'POST', body: JSON.stringify(payload) })
  }

  async registerUser(payload: { name: string; email: string; password: string; department: string; requestedRole: string }): Promise<{ success: boolean; message: string }> {
    return this.usersFetch<{ success: boolean; message: string }>(`/register`, { method: 'POST', body: JSON.stringify(payload) })
  }

  async getUserMetrics(): Promise<{ totalUsers: number; activeUsers: number; inactiveUsers: number; admins: number; technicians: number; requesters: number; }> {
    // No tocar la BD desde el cliente; calcular en cliente con datos disponibles si es necesario
    throw new Error('getUserMetrics no implementado en Edge; calcule métricas en cliente')
  }

  // Catálogos (departamentos y roles)
  async getCatalogs(): Promise<CatalogsData> {
    // Usar get-catalogs-ts con rutas REST para ambos catálogos
    const baseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    const anonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string
    const commonHeaders = { 'Content-Type': 'application/json', apikey: anonKey, ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) }

    const depUrl = `${baseUrl.replace(/\/$/, '')}/functions/v1/get-catalogs-ts/departments`
    const rolesUrl = `${baseUrl.replace(/\/$/, '')}/functions/v1/get-catalogs-ts/roles`

    const [depRes, rolesRes] = await Promise.all([
      fetch(depUrl, { headers: commonHeaders }),
      fetch(rolesUrl, { headers: commonHeaders })
    ])

    const depJson = await depRes.json()
    const rolesJson = await rolesRes.json()
    if (!depRes.ok) throw new Error(depJson?.error || 'Error cargando departamentos')
    if (!rolesRes.ok) throw new Error(rolesJson?.error || 'Error cargando roles')

    return { departments: depJson.departments ?? [], roles: rolesJson.roles ?? [] }
  }
}

// =============================================================================
// INSTANCE - Instancia única del servicio
// =============================================================================

export const edgeFunctionsService = new EdgeFunctionsService(); 