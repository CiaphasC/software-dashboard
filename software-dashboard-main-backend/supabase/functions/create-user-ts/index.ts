import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 🔧 CONFIGURACIÓN PARA CREACIÓN DE USUARIOS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

// 📊 TIPOS PARA CREACIÓN DE USUARIOS
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  isActive?: boolean;
}

interface CreateUserResponse {
  success: boolean;
  user?: any;
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
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verificar que el usuario esté autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      throw new Error('Usuario no autenticado');
    }

    // Verificar que el usuario sea admin
    const { data: isAdminResult, error: isAdminError } = await supabase.rpc('is_admin', {
      u: user.id
    });

    if (isAdminError || !isAdminResult) {
      throw new Error('Acceso denegado: se requieren permisos de administrador');
    }

    // 📝 OBTENER DATOS DE LA REQUEST
    const { name, email, password, role, department, isActive = true }: CreateUserRequest = await req.json();

    if (!name || !email || !password || !role || !department) {
      throw new Error('Faltan campos requeridos');
    }

    // 🔍 VERIFICAR QUE EL EMAIL NO EXISTA
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // 🔍 VERIFICAR QUE NO HAYA SOLICITUD PENDIENTE
    const { data: existingRequest } = await supabase
      .from('registration_requests')
      .select('email')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      throw new Error('Ya existe una solicitud pendiente para este email');
    }

    // 🔍 OBTENER ROLE_ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', role)
      .single();

    if (roleError || !roleData) {
      throw new Error(`Rol ${role} no encontrado`);
    }

    // 🔍 OBTENER DEPARTMENT_ID
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('id')
      .eq('short_name', department)
      .single();

    if (deptError || !deptData) {
      throw new Error(`Departamento ${department} no encontrado`);
    }

    // 👤 CREAR USUARIO EN AUTH.USERS
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name
      }
    });

    if (authError) {
      throw new Error(`Error creando usuario: ${authError.message}`);
    }

    // 📝 ACTUALIZAR PERFIL CON DATOS ADICIONALES
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        role_id: roleData.id,
        role_name: role,
        department_id: deptData.id,
        is_active: isActive,
        is_email_verified: true
      })
      .eq('id', authUser.user.id)
      .select()
      .single();

    if (profileError) {
      // Si falla la actualización del perfil, eliminar el usuario creado
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error(`Error actualizando perfil: ${profileError.message}`);
    }

    // 📈 LOG DE ACTIVIDAD
    await supabase
      .from('recent_activities')
      .insert({
        type: 'user',
        action: 'created',
        title: 'Usuario creado',
        description: `Administrador ${user.email} creó el usuario ${email}`,
        user_id: user.id,
        item_id: authUser.user.id
      });

    // ✅ RESPUESTA EXITOSA
    const response: CreateUserResponse = {
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
        name: name,
        role: role,
        department: department,
        isActive: isActive
      }
    };

    return new Response(JSON.stringify(response), { headers: corsHeaders, status: 200 });

  } catch (error) {
    console.error('❌ Error en create-user:', error);
    const errorResponse: CreateUserResponse = {
      success: false,
      error: error.message
    };
    return new Response(JSON.stringify(errorResponse), { headers: corsHeaders, status: 400 });
  }
}); 