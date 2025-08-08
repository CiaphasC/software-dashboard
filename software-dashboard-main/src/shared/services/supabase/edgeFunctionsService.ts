// =============================================================================
// EDGE FUNCTIONS SERVICE - Servicio para comunicación con Edge Functions
// Arquitectura de Software Profesional - Comunicación con Edge Functions
// =============================================================================

import { supabase } from './client';
import { HttpClient } from '@/shared/services/http/httpClient';

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
  private async callEdgeFunction<T = any>(functionName: string, data: any): Promise<T> {
    const token = await this.getAuthToken();
    const res = await this.http.request<EdgeFunctionResponse<T>>(`/${functionName}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: data,
      timeoutMs: 30000,
      retries: 2,
      retryDelayMs: 300,
    })
    if (!res.ok) throw new Error(res.data?.error || `Error en ${functionName}`)
    if (!res.data?.success) throw new Error(res.data?.error || `Error en ${functionName}`)
    return res.data.data as T
  }

  // Streaming NDJSON de Edge Function
  async streamFunction<T = any>(functionName: string, data: any, onMessage: (chunk: T) => void): Promise<void> {
    const token = await this.getAuthToken();
    await this.http.stream<T>(`/${functionName}`, {
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
    filters?: any;
  }): Promise<{ items: any[]; total: number; page: number; limit: number; hasMore: boolean; }> {
    const data = await this.callEdgeFunction('get-incident-ts', {
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
    const data = await this.callEdgeFunction('get-incident-ts', { action: 'metrics' });
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
  async listRequirements(params: { page?: number; limit?: number; search?: string; filters?: any }): Promise<{ items: any[]; total: number; page: number; limit: number; hasMore: boolean; }> {
    try {
      // Intentar edge function simétrica a incidents
      const data = await this.callEdgeFunction('get-requirement-ts', { action: 'list', params });
      return data;
    } catch {
      // Fallback directo a Supabase
      const page = params.page ?? 1; const limit = params.limit ?? 10; const offset = (page - 1) * limit;
      let query = supabase.from('requirements_with_times').select('*', { count: 'exact' });
      const f = params.filters || {};
      if (f.status) query = query.eq('status', f.status);
      if (f.priority) query = query.eq('priority', f.priority);
      if (f.type) query = query.eq('type', f.type);
      if (f.assignedTo) query = query.eq('assigned_to', f.assignedTo);
      if (f.createdBy) query = query.eq('created_by', f.createdBy);
      if (f.department) query = query.eq('requesting_area_name', f.department);
      if (f.dateFrom) query = query.gte('created_at', f.dateFrom);
      if (f.dateTo) query = query.lte('created_at', f.dateTo);
      if (params.search) query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
      query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
      const { data, count, error } = await query;
      if (error) throw error;
      const total = count || 0; const hasMore = page * limit < total;
      return { items: data || [], total, page, limit, hasMore };
    }
  }

  async getRequirement(id: string): Promise<any | null> {
    const { data } = await supabase.from('requirements_with_times').select('*').eq('id', id).single();
    return data ?? null;
  }

  async deleteRequirement(id: string): Promise<void> {
    const { error } = await supabase.from('requirements').delete().eq('id', id);
    if (error) throw error;
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
    const functionName = itemType === 'incident' ? 'update-incident-ts' : 'update-requirement-ts';
    return this.callEdgeFunction(functionName, {
      [`${itemType}_id`]: itemId,
      action: 'get_permissions'
    });
  }

  /**
   * USERS - Métodos estandarizados
   */
  async listUsers(params?: { page?: number; limit?: number; search?: string; role?: string }): Promise<{ items: any[]; total: number; page: number; limit: number; hasMore: boolean; }> {
    const page = params?.page ?? 1; const limit = params?.limit ?? 20;
    try {
      const all = await this.callEdgeFunction<any[]>('get-users-ts', { search: params?.search, role: params?.role });
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

  async getUser(id: string): Promise<any | null> {
    const { data } = await supabase.from('profiles').select('id, name, email, role_name, department_id, is_active').eq('id', id).single();
    return data ?? null;
  }

  async updateUser(id: string, updates: Partial<{ name: string; role_name: string; department_id: number; is_active: boolean }>): Promise<any> {
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