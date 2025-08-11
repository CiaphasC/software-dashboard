/* ============================================================================
   SEED - Datos iniciales coherentes con el proyecto (sin crear admin)
   - Crea usuarios de ejemplo: Técnico y Solicitante (auth.users + profiles)
   - Inserta una incidencia y un requerimiento de demostración vinculados
   - Idempotente: si existen por email/título, no duplica
   - Dependencias: extensiones uuid/pgcrypto; roles y departments del init
   ============================================================================ */

DO $$
DECLARE
  tech_role_id bigint;
  req_role_id bigint;
  default_dept_id bigint;
  tech_user_id uuid;
  requester_user_id uuid;
BEGIN
  -- 1) Resolver roles y departamento por defecto
  SELECT id INTO tech_role_id FROM public.roles WHERE name = 'technician' AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ Seed: rol technician no encontrado';
  END IF;
  SELECT id INTO req_role_id FROM public.roles WHERE name = 'requester' AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ Seed: rol requester no encontrado';
  END IF;
  -- Usamos 'Sistemas' si existe, si no 'Gerencia'
  SELECT id INTO default_dept_id FROM public.departments WHERE name = 'Sistemas' AND is_active = true;
  IF NOT FOUND THEN
    SELECT id INTO default_dept_id FROM public.departments WHERE name = 'Gerencia' AND is_active = true;
  END IF;
  IF NOT FOUND THEN
    RAISE EXCEPTION '❌ Seed: no se encontró departamento por defecto (Sistemas/Gerencia)';
  END IF;

  -- 2) Crear Técnico (si no existe)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tech@empresa.com') THEN
    tech_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      (SELECT instance_id FROM auth.users LIMIT 1),
      tech_user_id,
      'authenticated',
      'authenticated',
      'tech@empresa.com',
      crypt('tech123', gen_salt('bf')),
      now(), NULL, NULL,
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('name','Técnico de Soporte'),
      now(), now(), '', '', '', ''
    );
    INSERT INTO public.profiles (
      id, name, email, role_id, role_name, department_id,
      is_active, is_email_verified, created_at, updated_at
    ) VALUES (
      tech_user_id, 'Técnico de Soporte', 'tech@empresa.com',
      tech_role_id, 'technician', default_dept_id,
      true, true, now(), now()
    );
    PERFORM public.log_activity('user','created','Usuario creado','Seed: técnico de soporte creado', tech_user_id, tech_user_id);
    RAISE NOTICE '✅ Usuario técnico creado: % (tech@empresa.com / tech123)', tech_user_id;
  ELSE
    SELECT id INTO tech_user_id FROM auth.users WHERE email = 'tech@empresa.com';
  END IF;

  -- 3) Crear Solicitante (si no existe)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'requester@empresa.com') THEN
    requester_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      (SELECT instance_id FROM auth.users LIMIT 1),
      requester_user_id,
      'authenticated',
      'authenticated',
      'requester@empresa.com',
      crypt('req123', gen_salt('bf')),
      now(), NULL, NULL,
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('name','Usuario Solicitante'),
      now(), now(), '', '', '', ''
    );
    INSERT INTO public.profiles (
      id, name, email, role_id, role_name, department_id,
      is_active, is_email_verified, created_at, updated_at
    ) VALUES (
      requester_user_id, 'Usuario Solicitante', 'requester@empresa.com',
      req_role_id, 'requester', default_dept_id,
      true, true, now(), now()
    );
    PERFORM public.log_activity('user','created','Usuario creado','Seed: solicitante creado', requester_user_id, requester_user_id);
    RAISE NOTICE '✅ Usuario solicitante creado: % (requester@empresa.com / req123)', requester_user_id;
  ELSE
    SELECT id INTO requester_user_id FROM auth.users WHERE email = 'requester@empresa.com';
  END IF;

  -- 4) Incidencia de ejemplo (si no existe)
  IF NOT EXISTS (SELECT 1 FROM public.incidents WHERE title = 'Incidente seed #1') THEN
    INSERT INTO public.incidents (
      id, title, description, type, priority, status,
      affected_area_id, assigned_to, created_by, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      'Incidente seed #1',
      'Equipo no enciende. Reportado por usuario solicitante.',
      'hardware', 'high', 'open',
      default_dept_id, NULL, tech_user_id, now(), now()
    );
    PERFORM public.log_activity('incident','created','Incidente creado','Seed: incidente de ejemplo creado', tech_user_id, (SELECT id FROM public.incidents WHERE title='Incidente seed #1' LIMIT 1));
  END IF;

  -- 5) Requerimiento de ejemplo (si no existe)
  IF NOT EXISTS (SELECT 1 FROM public.requirements WHERE title = 'Requerimiento seed #1') THEN
    INSERT INTO public.requirements (
      id, title, description, type, priority, status,
      requesting_area_id, assigned_to, created_by, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      'Requerimiento seed #1',
      'Solicitud de acceso a repositorio privado.',
      'access', 'medium', 'pending',
      default_dept_id, tech_user_id, requester_user_id, now(), now()
    );
    PERFORM public.log_activity('requirement','created','Requerimiento creado','Seed: requerimiento de ejemplo creado', requester_user_id, (SELECT id FROM public.requirements WHERE title='Requerimiento seed #1' LIMIT 1));
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ Error en seed: %', SQLERRM;
END $$;