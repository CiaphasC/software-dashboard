// =============================================================================
// EDGE FUNCTIONS SERVICE - Servicio para comunicación con Edge Functions
// Arquitectura de Software Profesional - Comunicación con Edge Functions
// =============================================================================

import { supabase } from './client';
import { HttpClient } from '@/shared/services/http/httpClient';

// =============================================================================
// TYPES - Tipos para edge functions
// =============================================================================

export interface EdgeFunctionResponse<T> {
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
  private http: HttpClient
  constructor() {
    const base = (import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321') + '/functions/v1'
    this.http = new HttpClient(base)
  }
  
  // Helper para obtener el token de autenticación
  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No hay sesión activa');
    }
    return session.access_token;
  }

  // Helper genérico para llamar edge functions
  private async callEdgeFunction<TResponse>(functionName: string, data: unknown): Promise<TResponse> {
    const token = await this.getAuthToken();
    const res = await this.http.request<EdgeFunctionResponse<TResponse>>(`/${functionName}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: data,
      timeoutMs: 30000,
      retries: 2,
      retryDelayMs: 300,
    })
    if (!res.ok) throw new Error(res.data?.error || `Error en ${functionName}`)
    if (!res.data?.success) throw new Error(res.data?.error || `Error en ${functionName}`)
    return res.data.data as TResponse
  }

  // Streaming NDJSON de Edge Function
  async streamFunction<TChunk>(functionName: string, data: unknown, onMessage: (chunk: TChunk) => void): Promise<void> {
    const token = await this.getAuthToken();
    await this.http.stream<TChunk>(`/${functionName}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: data,
      onMessage,
      timeoutMs: 60000,
    })
  }

  // =============================================================================
  // INCIDENTS - Funciones para incidencias
  // =============================================================================

  /**
   * Crear nueva incidencia
   */
  async createIncident(data: CreateIncidentData): Promise<any> {
    return this.callEdgeFunction('create-incident-ts', { incidentData: data });
  }

  /**
   * Actualizar incidencia
   */
  async updateIncident(incidentId: string, data: UpdateIncidentData): Promise<any> {
    return this.callEdgeFunction('update-incident-ts', { 
      incidentId, 
      incidentData: data 
    });
  }

  /**
   * Actualizar estado de incidencia
   */
  async updateIncidentStatus(incidentId: string, status: string, resolvedAt?: string): Promise<any> {
    return this.callEdgeFunction('update-incident-status-ts', { 
      incidentId, 
      newStatus: status, 
      resolvedAt 
    });
  }

  // Lista paginada de incidencias mediante Edge Function
  async listIncidents(params: {
    page?: number;
    limit?: number;
    search?: string;
    filters?: Record<string, unknown>;
  }): Promise<{ items: unknown[]; total: number; page: number; limit: number; hasMore: boolean; }> {
    const data = await this.callEdgeFunction<{ items: unknown[]; total: number; page: number; limit: number; hasMore: boolean; }>('get-incident-ts', {
      action: 'list',
      params,
    });
    return data;
  }

  // Métricas de incidencias mediante Edge Function
  async getIncidentMetrics(): Promise<{
    totalIncidents: number;
    openIncidents: number;
    inProgressIncidents: number;
    resolvedIncidents: number;
    closedIncidents: number;
  }> {
    const data = await this.callEdgeFunction<{ totalIncidents: number; openIncidents: number; inProgressIncidents: number; resolvedIncidents: number; closedIncidents: number; }>('get-incident-ts', { action: 'metrics' });
    return data;
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

  // Lista de requerimientos (Edge Function si existe, sino fallback a vista)
  async listRequirements(params: { page?: number; limit?: number; search?: string; filters?: Record<string, unknown> }): Promise<{ items: unknown[]; total: number; page: number; limit: number; hasMore: boolean; }> {
    try {
      // Intentar edge function simétrica a incidents
      const data = await this.callEdgeFunction<{ items: unknown[]; total: number; page: number; limit: number; hasMore: boolean; }>('get-requirement-ts', { action: 'list', params });
      return data;
    } catch {
      // Fallback DAO normalizado
      const { list } = await import('@/shared/services/data/requirementsDao')
      return list(params)
    }
  }

  async getRequirement(id: string): Promise<unknown | null> {
    const { get } = await import('@/shared/services/data/requirementsDao')
    return get(id)
  }

  async deleteRequirement(id: string): Promise<void> {
    const { remove } = await import('@/shared/services/data/requirementsDao')
    return remove(id)
  }

  async getRequirementMetrics(): Promise<{ totalRequirements: number; pendingRequirements: number; inProgressRequirements: number; completedRequirements: number; deliveredRequirements: number; }> {
    const { metrics } = await import('@/shared/services/data/requirementsDao')
    return metrics()
  }

  // =============================================================================
  // GENERIC - Funciones genéricas para futuras extensiones
  // =============================================================================

  /**
   * Llamar cualquier edge function genérico
   */
  async callGenericFunction<TResponse>(functionName: string, data: unknown): Promise<TResponse> {
    return this.callEdgeFunction<TResponse>(functionName, data);
  }

  /**
   * Obtener permisos de renderizado (genérico)
   */
  async getRenderPermissions(itemType: 'incident' | 'requirement', itemId?: string): Promise<unknown> {
    const functionName = itemType === 'incident' ? 'update-incident-ts' : 'update-requirement-ts';
    return this.callEdgeFunction(functionName, {
      [`${itemType}_id`]: itemId,
      action: 'get_permissions'
    });
  }

  /**
   * USERS - Métodos estandarizados
   */
  async listUsers(params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<{ items: unknown[]; total: number; page: number; limit: number; hasMore: boolean; }> {
    const page = params?.page ?? 1; const limit = params?.limit ?? 20;
    try {
      const all = await this.callEdgeFunction<unknown[]>('get-users-ts', { search: params?.search, role: params?.role });
      const total = all.length; const start = (page - 1) * limit; const items = all.slice(start, start + limit); const hasMore = page * limit < total;
      return { items, total, page, limit, hasMore };
    } catch {
      // Fallback directo a perfiles
      let query = supabase.from('profiles').select('id, name, email, role_name, department_id, is_active').eq('is_active', true)
      if (params?.role) query = query.eq('role_name', params.role)
      if (params?.search) {
        const s = params.search
        query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%`)
      }
      const offset = (page - 1) * limit
      const { data, count, error } = await query.order('name').range(offset, offset + limit - 1)
      if (error) throw error
      const total = count || 0
      const hasMore = page * limit < total
      return { items: data || [], total, page, limit, hasMore }
    }
  }

  async getUser(id: string): Promise<unknown | null> {
    const { data } = await supabase.from('profiles').select('id, name, email, role_name, department_id, is_active').eq('id', id).single();
    return data ?? null;
  }

  async updateUser(id: string, updates: Partial<{ name: string; role_name: string; department_id: number; is_active: boolean }>): Promise<unknown> {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
    if (error) throw error; return data;
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
  }

  async getUserMetrics(): Promise<{ totalUsers: number; activeUsers: number; inactiveUsers: number; admins: number; technicians: number; requesters: number; }> {
    const [totalRes, activeRes, adminsRes, techRes, reqRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role_name', 'admin'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role_name', 'technician'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role_name', 'requester'),
    ])
    const totalUsers = totalRes.count || 0; const activeUsers = activeRes.count || 0; const inactiveUsers = totalUsers - activeUsers;
    return { totalUsers, activeUsers, inactiveUsers, admins: adminsRes.count || 0, technicians: techRes.count || 0, requesters: reqRes.count || 0 }
  }
}

// =============================================================================
// INSTANCE - Instancia única del servicio
// =============================================================================

export const edgeFunctionsService = new EdgeFunctionsService(); 