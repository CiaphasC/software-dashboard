// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 🔧 CONFIGURACIÓN PARA REGISTRO PÚBLICO
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

// 📊 TIPOS PARA REGISTRO PÚBLICO
interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  department: string;
  requestedRole: string;
}

interface RegisterUserResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// 🔧 FUNCIÓN PRINCIPAL
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 📝 OBTENER DATOS DE LA REQUEST
    const { name, email, password, department, requestedRole }: RegisterUserRequest = await req.json();

    // ✅ VALIDACIONES BÁSICAS
    if (!name || !email || !password || !department || !requestedRole) {
      throw new Error('Todos los campos son requeridos');
    }

    // ✅ VALIDAR EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de email inválido');
    }

    // ✅ VALIDAR CONTRASEÑA
    if (password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // ✅ VALIDAR ROL SOLICITADO
    if (requestedRole !== 'requester') {
      throw new Error('Solo se permite solicitar el rol de solicitante');
    }

    // 🔐 CONECTAR A SUPABASE
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

    // 🔍 VERIFICAR QUE EL EMAIL NO EXISTA EN PROFILES
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('El email ya está registrado en el sistema');
    }

    // 🔍 VERIFICAR QUE NO HAYA SOLICITUD PENDIENTE
    const { data: existingRequest } = await supabase
      .from('registration_requests')
      .select('email')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      throw new Error('Ya existe una solicitud pendiente con este email');
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

    // 📝 CREAR SOLICITUD DE REGISTRO
    const { data: request, error: insertError } = await supabase
      .from('registration_requests')
      .insert({
        name: name,
        email: email,
        password: password, // 🔑 Almacenar contraseña temporalmente
        department_id: deptData.id,
        requested_role: requestedRole,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Error al crear solicitud: ${insertError.message}`);
    }

    // 📈 LOG DE ACTIVIDAD
    await supabase
      .from('recent_activities')
      .insert({
        type: 'registration',
        action: 'requested',
        title: 'Nueva solicitud de registro',
        description: `Usuario ${email} solicitó registro como ${requestedRole}`,
        item_id: request.id
      });

    // ✅ RESPUESTA EXITOSA
    const response: RegisterUserResponse = {
      success: true,
      message: 'Solicitud de registro enviada exitosamente. Un administrador revisará tu solicitud.'
    };

    return new Response(JSON.stringify(response), { headers: corsHeaders, status: 200 });

  } catch (error) {
    console.error('❌ Error en register-user:', error);
    const errorResponse: RegisterUserResponse = {
      success: false,
      error: error.message
    };
    return new Response(JSON.stringify(errorResponse), { headers: corsHeaders, status: 400 });
  }
});
