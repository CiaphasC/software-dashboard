// supabase/functions/get-catalogs-ts/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 🔧 CONFIGURACIÓN PARA CATÁLOGOS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
  'Content-Type': 'application/json'
};

// 📊 TIPOS PARA CATÁLOGOS
interface Department {
  id: number;
  name: string;
  short_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CatalogsResponse {
  departments: Department[];
  roles: Role[];
  success: boolean;
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

    // 📊 OBTENER DEPARTAMENTOS ACTIVOS
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (deptError) {
      throw new Error(`Error obteniendo departamentos: ${deptError.message}`);
    }

    // 🔐 OBTENER ROLES ACTIVOS
    const { data: roles, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (roleError) {
      throw new Error(`Error obteniendo roles: ${roleError.message}`);
    }

    // 📈 LOG DE ACTIVIDAD
    await supabase
      .from('recent_activities')
      .insert({
        type: 'catalog',
        action: 'viewed',
        title: 'Catálogos consultados',
        description: `Usuario ${user.email} consultó catálogos de departamentos y roles`,
        user_id: user.id,
        item_id: 'catalogs'
      });

    // ✅ RESPUESTA EXITOSA
    const response: CatalogsResponse = {
      departments: departments || [],
      roles: roles || [],
      success: true
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: corsHeaders,
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error en get-catalogs:', error);

    const errorResponse: CatalogsResponse = {
      departments: [],
      roles: [],
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