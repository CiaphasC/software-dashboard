// =============================================================================
// SUPABASE CLIENT - Cliente principal de Supabase
// Arquitectura de Software Profesional - Configuración de Supabase
// =============================================================================

import { createClient } from '@supabase/supabase-js'
import { logger } from '@/shared/utils/logger'
import type { Database } from './types'

// =============================================================================
// ENVIRONMENT VARIABLES - Variables de entorno
// =============================================================================

// Configuración de entorno: no exponer claves por defecto en cliente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Variables de entorno de Supabase no configuradas (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)')
}

// Nota: SERVICE ROLE KEY nunca debe usarse en el cliente

// =============================================================================
// SUPABASE CLIENT MANAGER - Gestor de clientes de Supabase
// =============================================================================

class SupabaseClientManager {
  private static instance: SupabaseClientManager;
  private supabaseClient: ReturnType<typeof createClient<Database>> | null = null;
  // Nota: no se expone admin client en cliente

  private constructor() {
    logger.debug('🔧 SupabaseClientManager: Instancia creada');
  }

  static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager();
    }
    return SupabaseClientManager.instance;
  }

  getSupabaseClient(): ReturnType<typeof createClient<Database>> {
    if (!this.supabaseClient) {
logger.debug('🔧 SupabaseClientManager: Creando cliente Supabase');
      // Guard de entorno: en producción/https bloquear localhost/http para evitar contenido mixto y fallos remotos
      if (!import.meta.env.DEV) {
        const isHttp = supabaseUrl.startsWith('http://');
        const isLocalhost = /localhost|127\.0\.0\.1/.test(supabaseUrl);
        if (isHttp || isLocalhost) {
          throw new Error('❌ Configuración insegura de Supabase en producción (URL local o HTTP)');
        }
      }
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

  getSupabaseAdminClient(): null { return null }
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
      const { error } = await supabase
        .from('departments')
        .select('count')
        .limit(1)
      
      if (error) {
logger.error('❌ Error de conexión a Supabase:', error)
        this.isConnected = false
        return false
      }
      
logger.info('✅ Conexión a Supabase establecida')
      this.isConnected = true
      return true
    } catch (error) {
logger.error('❌ Error de conexión:', error)
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

  subscribeToTable(tableName: string, callback: (payload: any) => void) {
    if (this.channels.has(tableName)) {
      return
    }

    const channel = supabase
      .channel(tableName)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName },
        callback
      )
      .subscribe()

    this.channels.set(tableName, channel)
  }

  unsubscribeFromTable(tableName: string) {
    const channel = this.channels.get(tableName)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(tableName)
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel) => {
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
logger.error(`❌ Error ejecutando ${functionName}:`, error)
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