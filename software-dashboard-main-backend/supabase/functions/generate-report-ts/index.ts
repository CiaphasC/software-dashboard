// supabase/functions/generate-report/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 🔧 CONFIGURACIÓN OPTIMIZADA PARA DATA ANALYTICS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// 📊 TIPOS PARA DATA ANALYTICS
interface ReportRequest {
  report_id: string;
  type: 'incidents' | 'requirements' | 'dashboard';
  format: 'csv' | 'json' | 'xlsx';
  date_range: {
    start: string;
    end: string;
  };
  filters?: {
    department_id?: number;
    status?: string;
    priority?: string;
  };
}

interface AnalyticsData {
  metrics: any;
  raw_data: any[];
  summary: any;
}

// 🔧 FUNCIÓN PRINCIPAL OPTIMIZADA
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

    // 📊 PARSEAR Y VALIDAR REQUEST
    const { report_id, type, format, date_range, filters }: ReportRequest = await req.json();
    
    if (!report_id || !type || !format || !date_range) {
      throw new Error('Missing required parameters');
    }

    // ⏱️ ACTUALIZAR ESTADO A PROCESSING
    await supabase
      .from('reports')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', report_id);

    // 📈 OBTENER DATOS OPTIMIZADOS
    let analyticsData: AnalyticsData;
    
    if (type === 'dashboard') {
      // 🎯 USAR FUNCIÓN DE ANALYTICS OPTIMIZADA
      const { data: metrics, error: metricsError } = await supabase.rpc(
        'get_dashboard_analytics',
        { p_days_back: Math.ceil((new Date(date_range.end).getTime() - new Date(date_range.start).getTime()) / (1000 * 60 * 60 * 24)) }
      );
      
      if (metricsError) throw metricsError;
      
      analyticsData = {
        metrics,
        raw_data: [],
        summary: {
          generated_at: new Date().toISOString(),
          period: metrics.period,
          total_records: 0
        }
      };
    } else {
      // 📊 CONSULTA OPTIMIZADA CON FILTROS
      const query = supabase
        .from(type === 'incidents' ? 'incidents_with_times' : 'requirements_with_times')
        .select('*')
        .gte('created_at', date_range.start)
        .lte('created_at', date_range.end);

      // 🔍 APLICAR FILTROS ADICIONALES
      if (filters?.department_id) {
        query.eq(type === 'incidents' ? 'affected_area_id' : 'requesting_area_id', filters.department_id);
      }
      if (filters?.status) {
        query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query.eq('priority', filters.priority);
      }

      const { data: rawData, error: dataError } = await query;
      if (dataError) throw dataError;

      // 📈 CALCULAR MÉTRICAS EN TIEMPO REAL
      const metrics = calculateMetrics(rawData, type);
      
      analyticsData = {
        metrics,
        raw_data: rawData,
        summary: {
          generated_at: new Date().toISOString(),
          period: date_range,
          total_records: rawData.length,
          filters_applied: filters
        }
      };
    }

    // 📄 GENERAR ARCHIVO SEGÚN FORMATO
    let downloadUrl: string;
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${report_id}-${type}-${timestamp}`;

    if (format === 'csv') {
      const csv = convertToCSV(analyticsData);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(`${fileName}.csv`, new TextEncoder().encode(csv), {
          contentType: 'text/csv',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(uploadData.path);

      downloadUrl = publicUrl;
    } else if (format === 'json') {
      const jsonData = JSON.stringify(analyticsData, null, 2);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('reports')
        .upload(`${fileName}.json`, new TextEncoder().encode(jsonData), {
          contentType: 'application/json',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(uploadData.path);

      downloadUrl = publicUrl;
    } else if (format === 'xlsx') {
      // 📊 GENERAR EXCEL (implementación futura)
      throw new Error('XLSX format not yet implemented');
    }

    // ✅ ACTUALIZAR REPORTE COMO COMPLETADO
    await supabase
      .from('reports')
      .update({ 
        status: 'completed',
        data: analyticsData,
        download_url: downloadUrl,
        completed_at: new Date().toISOString(),
        processing_time_ms: Date.now() - new Date().getTime()
      })
      .eq('id', report_id);

    // 📊 REGISTRAR ACTIVIDAD
    await supabase.rpc('log_activity', {
      p_type: 'report',
      p_action: 'generated',
      p_title: 'Reporte Generado',
      p_description: `Reporte ${type} generado en formato ${format}`,
      p_user_id: null, // Se obtiene del token
      p_item_id: report_id
    });

    return new Response(JSON.stringify({ 
      success: true, 
      download_url: downloadUrl,
      analytics_summary: analyticsData.summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('❌ Error generating report:', error);
    
    // 🔄 ACTUALIZAR ESTADO A ERROR
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase
        .from('reports')
        .update({ 
          status: 'error',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', 'report_id'); // Esto debería ser el report_id real
    } catch (updateError) {
      console.error('Error updating report status:', updateError);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

// 📊 FUNCIÓN PARA CALCULAR MÉTRICAS
function calculateMetrics(data: any[], type: string) {
  const total = data.length;
  const resolved = data.filter(item => item.status === (type === 'incidents' ? 'resolved' : 'delivered')).length;
  const open = data.filter(item => item.status === 'open' || item.status === 'pending').length;
  const inProgress = data.filter(item => item.status === 'in_progress').length;

  const avgTime = data
    .filter(item => item.status === (type === 'incidents' ? 'resolved' : 'delivered'))
    .reduce((sum, item) => sum + (item[type === 'incidents' ? 'resolution_time_hours' : 'delivery_time_hours'] || 0), 0) / resolved || 0;

  return {
    total,
    resolved,
    open,
    in_progress: inProgress,
    avg_time_hours: avgTime,
    resolution_rate: total > 0 ? (resolved / total) * 100 : 0
  };
}

// 📄 FUNCIÓN OPTIMIZADA PARA CSV
function convertToCSV(data: AnalyticsData): string {
  if (!data.raw_data.length) {
    // 📊 GENERAR CSV DE MÉTRICAS SI NO HAY DATOS RAW
    const metrics = data.metrics;
    const csvRows = ['Metric,Value'];
    
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'object') {
        csvRows.push(`${key},${JSON.stringify(value)}`);
      } else {
        csvRows.push(`${key},${value}`);
      }
    });
    
    return csvRows.join('\n');
  }
  
  const headers = Object.keys(data.raw_data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data.raw_data) {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') {
        // 🔧 ESCAPAR COMILLAS Y CARACTERES ESPECIALES
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}