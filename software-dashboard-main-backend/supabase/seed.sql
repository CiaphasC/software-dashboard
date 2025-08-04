/* ===============================================================
   SEED: Datos iniciales del sistema
   fecha:   2025-08-01
   autor:   Sistema de Gestión
   =============================================================== */

-- Script para crear el primer usuario administrador del sistema
-- NOTA: Este script solo crea el perfil, el usuario en auth.users debe crearse manualmente
-- o usando la API de Supabase Auth desde el frontend

DO $$
DECLARE
  admin_role_id bigint;
  admin_dept_id bigint;
BEGIN
  -- Verificar si ya existe un admin
  IF EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE r.name = 'admin' AND p.is_active = true
  ) THEN
    RAISE NOTICE '✅ Ya existe un usuario administrador en el sistema';
    RETURN;
  END IF;

  -- Obtener el ID del rol admin
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin' AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ Error: No se encontró el rol admin';
  END IF;

  -- Obtener el ID del departamento Gerencia
  SELECT id INTO admin_dept_id FROM public.departments WHERE name = 'Gerencia';
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ Error: No se encontró el departamento Gerencia';
  END IF;

  RAISE NOTICE '⚠️  IMPORTANTE: El usuario administrador debe crearse manualmente';
  RAISE NOTICE '📧 Email: admin@empresa.com';
  RAISE NOTICE '🔑 Contraseña: admin123';
  RAISE NOTICE '🔧 Usa la API de Supabase Auth para crear el usuario en auth.users';
  RAISE NOTICE '📋 Rol ID: %', admin_role_id;
  RAISE NOTICE '🏢 Departamento ID: %', admin_dept_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ Error en seed: %', SQLERRM;
END $$; 