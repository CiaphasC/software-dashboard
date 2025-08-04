// supabase/functions/get-item-details-ts/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 🔧 CONFIGURACIÓN PARA DETALLES DE ITEMS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// 📊 TIPOS PARA DETALLES DE ITEMS
interface ItemDetailsRequest {
  item_type: 'incident' | 'requirement';
  item_id: string;
}

interface IncidentDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  created_at: string;
  updated_at: string;
  creator_name: string;
  creator_email: string;
  assignee_name?: string;
  assignee_email?: string;
  affected_area_name: string;
  resolution_time_hours?: number;
  activities: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: string;
    user_name: string;
  }>;
}

interface RequirementDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  created_at: string;
  updated_at: string;
  creator_name: string;
  creator_email: string;
  assigned_to_name?: string;
  assigned_to_email?: string;
  requesting_area_name: string;
  estimated_delivery_date?: string;
  delivered_at?: string;
  delivery_time_hours?: number;
  activities: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: string;
    user_name: string;
  }>;
}

interface ItemDetailsResponse {
  success: boolean;
  data?: IncidentDetails | RequirementDetails;
  error?: string;
}

// 🔧 FUNCIÓN PRINCIPAL
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // 🔍 OBTENER USUARIO ACTUAL
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid user');
    }

    // 📝 OBTENER PARÁMETROS DE LA REQUEST
    const { item_type, item_id }: ItemDetailsRequest = await req.json();

    if (!item_type || !item_id) {
      throw new Error('item_type and item_id are required');
    }

    let itemDetails: IncidentDetails | RequirementDetails;

    if (item_type === 'incident') {
      // 📊 OBTENER DETALLES DE INCIDENCIA (usando vista optimizada)
      const { data: incident, error: incidentError } = await supabase
        .from('incidents_with_times')
        .select('*')
        .eq('id', item_id)
        .single();

      if (incidentError || !incident) {
        throw new Error('Incident not found');
      }

      // 📈 OBTENER ACTIVIDADES DE LA INCIDENCIA
      const { data: activities, error: activitiesError } = await supabase
        .from('activities_with_users')
        .select('id, action, description, timestamp, user_name')
        .eq('item_id', item_id)
        .eq('type', 'incident')
        .order('timestamp', { ascending: false });

      if (activitiesError) {
        console.error('Error obteniendo actividades:', activitiesError);
      }

      itemDetails = {
        id: incident.id,
        title: incident.title,
        description: incident.description,
        status: incident.status,
        priority: incident.priority,
        type: incident.type,
        created_at: incident.created_at,
        updated_at: incident.updated_at,
        creator_name: incident.creator_name,
        creator_email: incident.creator_email,
        assignee_name: incident.assignee_name,
        assignee_email: incident.assignee_email,
        affected_area_name: incident.affected_area_name,
        resolution_time_hours: incident.resolution_time_hours,
        activities: activities || []
      };

    } else if (item_type === 'requirement') {
      // 📊 OBTENER DETALLES DE REQUERIMIENTO (usando vista optimizada)
      const { data: requirement, error: requirementError } = await supabase
        .from('requirements_with_users')
        .select('*')
        .eq('id', item_id)
        .single();

      if (requirementError || !requirement) {
        throw new Error('Requirement not found');
      }

      // 📈 OBTENER ACTIVIDADES DEL REQUERIMIENTO
      const { data: activities, error: activitiesError } = await supabase
        .from('activities_with_users')
        .select('id, action, description, timestamp, user_name')
        .eq('item_id', item_id)
        .eq('type', 'requirement')
        .order('timestamp', { ascending: false });

      if (activitiesError) {
        console.error('Error obteniendo actividades:', activitiesError);
      }

      itemDetails = {
        id: requirement.id,
        title: requirement.title,
        description: requirement.description,
        status: requirement.status,
        priority: requirement.priority,
        type: requirement.type,
        created_at: requirement.created_at,
        updated_at: requirement.updated_at,
        creator_name: requirement.creator_name,
        creator_email: requirement.creator_email,
        assigned_to_name: requirement.assigned_to_name,
        assigned_to_email: requirement.assigned_to_email,
        requesting_area_name: requirement.requesting_area_name,
        estimated_delivery_date: requirement.estimated_delivery_date,
        delivered_at: requirement.delivered_at,
        delivery_time_hours: requirement.delivery_time_hours,
        activities: activities || []
      };

    } else {
      throw new Error('Invalid item_type. Must be "incident" or "requirement"');
    }

    // 📈 LOG DE ACTIVIDAD
    await supabase
      .from('recent_activities')
      .insert({
        type: item_type,
        action: 'viewed',
        title: `Detalles de ${item_type === 'incident' ? 'incidencia' : 'requerimiento'} consultados`,
        description: `Usuario ${user.email} consultó detalles de ${item_type} ${item_id}`,
        user_id: user.id,
        item_id: item_id
      });

    // ✅ RESPUESTA EXITOSA
    const response: ItemDetailsResponse = {
      success: true,
      data: itemDetails
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: corsHeaders,
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error en get-item-details:', error);

    const errorResponse: ItemDetailsResponse = {
      success: false,
      error: error.message
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: corsHeaders,
        status: 400 
      }
    );
  }
}); 