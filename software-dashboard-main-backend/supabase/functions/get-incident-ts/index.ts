// supabase/functions/get-incident-ts/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
  filters?: {
    status?: string;
    priority?: string;
    type?: string;
    assignedTo?: string;
    createdBy?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
  };
};

type ActionBody = {
  action: 'list' | 'metrics';
  params?: ListParams;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No autorizado')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Usuario no autenticado')
    }

    const body = await req.json() as ActionBody
    const action = body.action

    if (action === 'list') {
      const { page = 1, limit = 20, search, filters } = body.params || {}

      let query = supabase
        .from('incidents_with_times')
        .select('*', { count: 'exact' })

      // Filtros
      if (filters) {
        if (filters.status) query = query.eq('status', filters.status)
        if (filters.priority) query = query.eq('priority', filters.priority)
        if (filters.type) query = query.eq('type', filters.type)
        if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
        if (filters.createdBy) query = query.eq('created_by', filters.createdBy)
        if (filters.department) query = query.eq('affected_area_name', filters.department)
        if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
        if (filters.dateTo) query = query.lte('created_at', filters.dateTo)
      }

      // Búsqueda
      if (search && search.trim().length > 0) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      // Orden por fecha desc
      query = query.order('created_at', { ascending: false })

      // Paginación
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query
      if (error) throw error

      const total = count || 0
      const hasMore = page * limit < total

      return new Response(JSON.stringify({
        success: true,
        data: {
          items: data || [],
          total,
          page,
          limit,
          hasMore,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'metrics') {
      // Métricas basadas en TODAS las incidencias (no solo la página)
      const base = supabase.from('incidents').select('*', { count: 'exact', head: true })

      const [totalRes, openRes, inProgRes, resolvedRes, closedRes] = await Promise.all([
        base,
        supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'closed'),
      ])

      const totalIncidents = totalRes.count || 0
      const openIncidents = openRes.count || 0
      const inProgressIncidents = inProgRes.count || 0
      const resolvedIncidents = resolvedRes.count || 0
      const closedIncidents = closedRes.count || 0

      return new Response(JSON.stringify({
        success: true,
        data: {
          totalIncidents,
          openIncidents,
          inProgressIncidents,
          resolvedIncidents,
          closedIncidents,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ success: false, error: 'Acción no soportada' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: (error as Error).message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})