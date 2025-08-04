// supabase/functions/real-time-analytics/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 🔧 CONFIGURACIÓN OPTIMIZADA PARA REAL-TIME ANALYTICS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
  'Content-Type': 'application/json'
};

// 📊 TIPOS PARA REAL-TIME ANALYTICS
interface AnalyticsRequest {
  type: 'dashboard' | 'incidents' | 'requirements' | 'performance';
  time_range: '1h' | '24h' | '7d' | '30d' | 'custom';
  custom_start?: string;
  custom_end?: string;
  department_id?: number;
  include_trends?: boolean;
}

interface RealTimeMetrics {
  current_period: any;
  previous_period: any;
  trends: any;
  alerts: any[];
  last_updated: string;
}

// 🔧 FUNCIÓN PRINCIPAL PARA REAL-TIME ANALYTICS
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 🔐 VALIDACIÓN DE AUTENTICACIÓN
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 📊 PARSEAR REQUEST
    const { type, time_range, custom_start, custom_end, department_id, include_trends = true }: AnalyticsRequest = await req.json();
    
    if (!type || !time_range) {
      throw new Error('Missing required parameters');
    }

    // ⏱️ CALCULAR RANGOS DE TIEMPO
    const now = new Date();
    let currentStart: Date;
    let currentEnd: Date = now;
    let previousStart: Date;
    let previousEnd: Date;

    switch (time_range) {
      case '1h':
        currentStart = new Date(now.getTime() - 60 * 60 * 1000);
        previousStart = new Date(currentStart.getTime() - 60 * 60 * 1000);
        previousEnd = currentStart;
        break;
      case '24h':
        currentStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        previousStart = new Date(currentStart.getTime() - 24 * 60 * 60 * 1000);
        previousEnd = currentStart;
        break;
      case '7d':
        currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousEnd = currentStart;
        break;
      case '30d':
        currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStart = new Date(currentStart.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousEnd = currentStart;
        break;
      case 'custom':
        if (!custom_start || !custom_end) {
          throw new Error('Custom time range requires start and end dates');
        }
        currentStart = new Date(custom_start);
        currentEnd = new Date(custom_end);
        const duration = currentEnd.getTime() - currentStart.getTime();
        previousStart = new Date(currentStart.getTime() - duration);
        previousEnd = currentStart;
        break;
      default:
        throw new Error('Invalid time range');
    }

    // 📈 OBTENER MÉTRICAS EN TIEMPO REAL
    let realTimeMetrics: RealTimeMetrics;

    if (type === 'dashboard') {
      // 🎯 DASHBOARD COMPLETO
      const [currentMetrics, previousMetrics, alerts] = await Promise.all([
        getDashboardMetrics(supabase, currentStart, currentEnd, department_id),
        getDashboardMetrics(supabase, previousStart, previousEnd, department_id),
        getSystemAlerts(supabase)
      ]);

      realTimeMetrics = {
        current_period: currentMetrics,
        previous_period: previousMetrics,
        trends: include_trends ? calculateTrends(currentMetrics, previousMetrics) : null,
        alerts,
        last_updated: now.toISOString()
      };
    } else if (type === 'incidents') {
      // 📊 MÉTRICAS DE INCIDENCIAS
      const [currentMetrics, previousMetrics] = await Promise.all([
        getIncidentMetrics(supabase, currentStart, currentEnd, department_id),
        getIncidentMetrics(supabase, previousStart, previousEnd, department_id)
      ]);

      realTimeMetrics = {
        current_period: currentMetrics,
        previous_period: previousMetrics,
        trends: include_trends ? calculateTrends(currentMetrics, previousMetrics) : null,
        alerts: [],
        last_updated: now.toISOString()
      };
    } else if (type === 'requirements') {
      // 📋 MÉTRICAS DE REQUERIMIENTOS
      const [currentMetrics, previousMetrics] = await Promise.all([
        getRequirementMetrics(supabase, currentStart, currentEnd, department_id),
        getRequirementMetrics(supabase, previousStart, previousEnd, department_id)
      ]);

      realTimeMetrics = {
        current_period: currentMetrics,
        previous_period: previousMetrics,
        trends: include_trends ? calculateTrends(currentMetrics, previousMetrics) : null,
        alerts: [],
        last_updated: now.toISOString()
      };
    } else if (type === 'performance') {
      // ⚡ MÉTRICAS DE RENDIMIENTO
      const [currentMetrics, previousMetrics] = await Promise.all([
        getPerformanceMetrics(supabase, currentStart, currentEnd, department_id),
        getPerformanceMetrics(supabase, previousStart, previousEnd, department_id)
      ]);

      realTimeMetrics = {
        current_period: currentMetrics,
        previous_period: previousMetrics,
        trends: include_trends ? calculateTrends(currentMetrics, previousMetrics) : null,
        alerts: [],
        last_updated: now.toISOString()
      };
    } else {
      throw new Error('Invalid analytics type');
    }

    // 📊 REGISTRAR CONSULTA DE ANALYTICS
    await supabase.rpc('log_activity', {
      p_type: 'analytics',
      p_action: 'viewed',
      p_title: 'Analytics Consultados',
      p_description: `Analytics ${type} consultados para rango ${time_range}`,
      p_user_id: null, // Se obtiene del token
      p_item_id: null
    });

    return new Response(JSON.stringify(realTimeMetrics), {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error in real-time analytics:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

// 📊 FUNCIÓN PARA OBTENER MÉTRICAS DEL DASHBOARD
async function getDashboardMetrics(supabase: any, startDate: Date, endDate: Date, departmentId?: number) {
  const daysBack = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const { data: metrics, error } = await supabase.rpc('get_dashboard_analytics', {
    p_days_back: daysBack
  });
  
  if (error) throw error;
  return metrics;
}

// 📊 FUNCIÓN PARA OBTENER MÉTRICAS DE INCIDENCIAS
async function getIncidentMetrics(supabase: any, startDate: Date, endDate: Date, departmentId?: number) {
  const { data: metrics, error } = await supabase.rpc('get_incident_metrics', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_department_id: departmentId
  });
  
  if (error) throw error;
  return metrics;
}

// 📊 FUNCIÓN PARA OBTENER MÉTRICAS DE REQUERIMIENTOS
async function getRequirementMetrics(supabase: any, startDate: Date, endDate: Date, departmentId?: number) {
  const { data: metrics, error } = await supabase.rpc('get_requirement_metrics', {
    p_start_date: startDate.toISOString(),
    p_end_date: endDate.toISOString(),
    p_department_id: departmentId
  });
  
  if (error) throw error;
  return metrics;
}

// ⚡ FUNCIÓN PARA OBTENER MÉTRICAS DE RENDIMIENTO
async function getPerformanceMetrics(supabase: any, startDate: Date, endDate: Date, departmentId?: number) {
  // 📈 CONSULTAS OPTIMIZADAS PARA RENDIMIENTO
  const [incidentMetrics, requirementMetrics, userActivity] = await Promise.all([
    getIncidentMetrics(supabase, startDate, endDate, departmentId),
    getRequirementMetrics(supabase, startDate, endDate, departmentId),
    getUserActivityMetrics(supabase, startDate, endDate)
  ]);

  return {
    incidents: incidentMetrics,
    requirements: requirementMetrics,
    user_activity: userActivity,
    system_performance: {
      avg_response_time: calculateAvgResponseTime(incidentMetrics),
      resolution_efficiency: calculateResolutionEfficiency(incidentMetrics),
      user_satisfaction: calculateUserSatisfaction(incidentMetrics, requirementMetrics)
    }
  };
}

// 👥 FUNCIÓN PARA MÉTRICAS DE ACTIVIDAD DE USUARIOS
async function getUserActivityMetrics(supabase: any, startDate: Date, endDate: Date) {
  const { data, error } = await supabase
    .from('recent_activities')
    .select('user_id, type, action, timestamp')
    .gte('timestamp', startDate.toISOString())
    .lte('timestamp', endDate.toISOString());

  if (error) throw error;

  const uniqueUsers = new Set(data.map(item => item.user_id)).size;
  const activityByType = data.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return {
    total_activities: data.length,
    unique_users: uniqueUsers,
    activity_by_type: activityByType,
    avg_activities_per_user: data.length / uniqueUsers || 0
  };
}

// 🚨 FUNCIÓN PARA OBTENER ALERTAS DEL SISTEMA
async function getSystemAlerts(supabase: any) {
  const alerts = [];
  const now = new Date();

  // 🔍 VERIFICAR INCIDENCIAS CRÍTICAS SIN RESOLVER
  const { data: criticalIncidents } = await supabase
    .from('incidents')
    .select('id, title, priority, created_at')
    .eq('status', 'open')
    .eq('priority', 'critical')
    .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

  if (criticalIncidents && criticalIncidents.length > 0) {
    alerts.push({
      type: 'critical_incidents',
      message: `${criticalIncidents.length} incidencias críticas sin resolver`,
      count: criticalIncidents.length,
      items: criticalIncidents
    });
  }

  // 🔍 VERIFICAR REQUERIMIENTOS VENCIDOS
  const { data: overdueRequirements } = await supabase
    .from('requirements')
    .select('id, title, priority, estimated_delivery_date')
    .in('status', ['pending', 'in_progress'])
    .lt('estimated_delivery_date', now.toISOString());

  if (overdueRequirements && overdueRequirements.length > 0) {
    alerts.push({
      type: 'overdue_requirements',
      message: `${overdueRequirements.length} requerimientos vencidos`,
      count: overdueRequirements.length,
      items: overdueRequirements
    });
  }

  // 🔍 VERIFICAR SOLICITUDES PENDIENTES
  const { data: pendingRegistrations } = await supabase
    .from('registration_requests')
    .select('id, name, email, created_at')
    .eq('status', 'pending');

  if (pendingRegistrations && pendingRegistrations.length > 5) {
    alerts.push({
      type: 'pending_registrations',
      message: `${pendingRegistrations.length} solicitudes de registro pendientes`,
      count: pendingRegistrations.length,
      items: pendingRegistrations.slice(0, 5) // Solo mostrar las primeras 5
    });
  }

  return alerts;
}

// 📈 FUNCIÓN PARA CALCULAR TENDENCIAS
function calculateTrends(current: any, previous: any) {
  const trends = {};
  
  Object.keys(current).forEach(key => {
    if (typeof current[key] === 'number' && typeof previous[key] === 'number') {
      const change = current[key] - previous[key];
      const percentage = previous[key] > 0 ? (change / previous[key]) * 100 : 0;
      
      trends[key] = {
        change,
        percentage,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    }
  });
  
  return trends;
}

// ⚡ FUNCIONES AUXILIARES PARA MÉTRICAS DE RENDIMIENTO
function calculateAvgResponseTime(incidentMetrics: any) {
  return incidentMetrics.avg_resolution_time_hours || 0;
}

function calculateResolutionEfficiency(incidentMetrics: any) {
  const total = incidentMetrics.total_incidents || 0;
  const resolved = incidentMetrics.resolved_incidents || 0;
  return total > 0 ? (resolved / total) * 100 : 0;
}

function calculateUserSatisfaction(incidentMetrics: any, requirementMetrics: any) {
  // 🎯 CÁLCULO SIMPLIFICADO DE SATISFACCIÓN
  const totalItems = (incidentMetrics.total_incidents || 0) + (requirementMetrics.total_requirements || 0);
  const resolvedItems = (incidentMetrics.resolved_incidents || 0) + (requirementMetrics.delivered_requirements || 0);
  
  return totalItems > 0 ? (resolvedItems / totalItems) * 100 : 0;
} 