// =============================================================================
// SUPABASE CLIENT - Cliente principal de Supabase
// Arquitectura de Software Profesional - Configuración de Supabase
// =============================================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// =============================================================================
// ENVIRONMENT VARIABLES - Variables de entorno
// =============================================================================

// Configuración temporal para desarrollo local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Variables de entorno de Supabase no configuradas')
}

// =============================================================================
// SUPABASE CLIENT MANAGER - Gestor de clientes de Supabase
// =============================================================================

class SupabaseClientManager {
  private static instance: SupabaseClientManager;
  private supabaseClient: ReturnType<typeof createClient<Database>> | null = null;
  private supabaseAdminClient: ReturnType<typeof createClient<Database>> | null = null;

  private constructor() {
    console.log('🔧 SupabaseClientManager: Instancia creada');
  }

  static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager();
    }
    return SupabaseClientManager.instance;
  }

  getSupabaseClient(): ReturnType<typeof createClient<Database>> {
    if (!this.supabaseClient) {
      console.log('🔧 SupabaseClientManager: Creando cliente Supabase');
      this.supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: 'estable1-auth-token'
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
    }
    return this.supabaseClient;
  }

  getSupabaseAdminClient(): ReturnType<typeof createClient<Database>> | null {
    if (!supabaseServiceKey) return null;
    
    if (!this.supabaseAdminClient) {
      console.log('🔧 SupabaseClientManager: Creando cliente Admin Supabase');
      this.supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false,
          detectSessionInUrl: false
        }
      });
    }
    return this.supabaseAdminClient;
  }
}

// =============================================================================
// SUPABASE CLIENT - Cliente tipado de Supabase (Anon Key)
// =============================================================================

export const supabase = SupabaseClientManager.getInstance().getSupabaseClient();

// =============================================================================
// SUPABASE ADMIN CLIENT - Cliente con permisos de servicio (Service Role Key)
// =============================================================================

export const supabaseAdmin = SupabaseClientManager.getInstance().getSupabaseAdminClient();

// =============================================================================
// CONNECTION MANAGER - Gestor de conexión
// =============================================================================

class ConnectionManager {
  private static instance: ConnectionManager
  private isConnected = false
  private connectionPromise: Promise<boolean> | null = null

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager()
    }
    return ConnectionManager.instance
  }

  async checkConnection(): Promise<boolean> {
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.connectionPromise = this.performConnectionCheck()
    return this.connectionPromise
  }

  private async performConnectionCheck(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('❌ Error de conexión a Supabase:', error)
        this.isConnected = false
        return false
      }
      
      console.log('✅ Conexión a Supabase establecida')
      this.isConnected = true
      return true
    } catch (error) {
      console.error('❌ Error de conexión:', error)
      this.isConnected = false
      return false
    } finally {
      this.connectionPromise = null
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  resetConnection(): void {
    this.isConnected = false
    this.connectionPromise = null
  }
}

export const connectionManager = ConnectionManager.getInstance()

// =============================================================================
// REALTIME MANAGER - Gestor de tiempo real
// =============================================================================

class RealtimeManager {
  private channels: Map<string, any> = new Map()

  subscribeToTable(table: string, callback: (payload: any) => void) {
    if (this.channels.has(table)) {
      return
    }

    const channel = supabase
      .channel(table)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe()

    this.channels.set(table, channel)
  }

  unsubscribeFromTable(table: string) {
    const channel = this.channels.get(table)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(table)
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel, table) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

export const realtimeManager = new RealtimeManager()

// =============================================================================
// EDGE FUNCTIONS MANAGER - Gestor de Edge Functions
// =============================================================================

export class EdgeFunctionsManager {
  async invoke<T = any>(
    functionName: string, 
    data?: any,
    options?: { 
      headers?: Record<string, string>
      timeout?: number 
    }
  ): Promise<T> {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        functionName,
        {
          body: data,
          headers: options?.headers
        }
      )
      
      if (error) {
        throw new Error(`Error en función ${functionName}: ${error.message}`)
      }
      
      return result as T
    } catch (error) {
      console.error(`❌ Error ejecutando ${functionName}:`, error)
      throw error
    }
  }

  // Funciones específicas del dominio
  async updateIncidentStatus(
    incidentId: string, 
    newStatus: string, 
    resolvedAt?: string
  ) {
    return this.invoke('update-incident-status', {
      incident_id: incidentId,
      new_status: newStatus,
      resolved_at: resolvedAt
    })
  }

  async updateRequirementStatus(
    requirementId: string, 
    newStatus: string, 
    deliveredAt?: string
  ) {
    return this.invoke('update-requirement-status', {
      requirement_id: requirementId,
      new_status: newStatus,
      delivered_at: deliveredAt
    })
  }

  async generateReport(
    type: 'incidents' | 'requirements' | 'users',
    format: 'pdf' | 'excel' | 'csv' | 'json',
    dateRange: { start: string; end: string }
  ) {
    return this.invoke('generate-report', {
      type,
      format,
      date_range: dateRange
    })
  }

  async uploadFile(
    file: File,
    metadata: {
      incidentId?: string
      requirementId?: string
      uploadedBy: string
    }
  ) {
    return this.invoke('upload-file', {
      file,
      ...metadata
    })
  }

  async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) {
    return this.invoke('send-notification', {
      user_id: userId,
      title,
      message,
      type
    })
  }
}

export const edgeFunctions = new EdgeFunctionsManager()

// =============================================================================
// EXPORTS - Exportaciones principales
// =============================================================================

export default supabase 