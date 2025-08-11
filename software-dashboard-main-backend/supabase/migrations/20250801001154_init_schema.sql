/* ===============================================================
   SUPABASE  ·  ESQUEMA PRINCIPAL DEL SISTEMA DE GESTIÓN
   fecha:   2025-08-01
   autor:   Sistema de Gestión
   lic:     Apache-2.0
   =============================================================== */

-- 0 ───────────────────  EXTENSIONES ÚTILES  ─────────────────────
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "uuid-ossp";     -- uuid_generate_v4()

/* ----------------------------------------------------------------
   1.  CATÁLOGO DE DEPARTAMENTOS  (para el combo del formulario)
   ---------------------------------------------------------------- */
create table if not exists public.departments (
  id          bigserial primary key,
  name        text unique not null,
  short_name  text unique not null,  -- Abreviatura del departamento
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(), -- Fecha y hora automática de creación
  updated_at  timestamptz not null default now()  -- Fecha y hora automática de última actualización
);

-- Insertar todos los departamentos con sus abreviaturas
insert into public.departments (name, short_name) values
('Tecnología de la Información', 'TI'),
('Recursos Humanos', 'RRHH'),
('Contabilidad', 'CONTABILIDAD'),
('Finanzas', 'FINANZAS'),
('Marketing', 'MARKETING'),
('Ventas', 'VENTAS'),
('Operaciones', 'OPERACIONES'),
('Legal', 'LEGAL'),
('Administración', 'ADMINISTRACION'),
('Logística', 'LOGISTICA'),
('Producción', 'PRODUCCION'),
('Calidad', 'CALIDAD'),
('Mantenimiento', 'MANTENIMIENTO'),
('Seguridad', 'SEGURIDAD'),
('Gerencia', 'GERENCIA'),
('Otro', 'OTRO'),
('Sistemas', 'SISTEMAS')
on conflict (name) do nothing;

comment on table  public.departments is 'Catálogo editable de áreas/departamentos';

/* ----------------------------------------------------------------
   2.  CATÁLOGO DE ROLES  (para gestión de permisos)
   ---------------------------------------------------------------- */
create table if not exists public.roles (
  id          bigserial primary key,
  name        text unique not null,
  description text,
  permissions jsonb not null default '[]',  -- Array de permisos
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(), -- Fecha y hora automática de creación
  updated_at  timestamptz not null default now()  -- Fecha y hora automática de última actualización
);

-- Insertar roles por defecto
insert into public.roles (name, description, permissions) values
('admin', 'Administrador del sistema', '["*"]'),
('technician', 'Técnico de soporte', '["incidents.read", "incidents.write", "requirements.read", "requirements.write", "reports.read"]'),
('requester', 'Solicitante', '["incidents.read", "incidents.create", "requirements.read", "requirements.create"]')
on conflict (name) do nothing;

comment on table public.roles is 'Catálogo de roles y permisos del sistema';

/* ----------------------------------------------------------------
   3.  TABLA DE PERFILES  (datos extendidos del usuario)
   ---------------------------------------------------------------- */
create table public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,

  name                text not null,
  email               text not null,        -- copia para búsquedas rápidas
  department_id       bigint references public.departments(id),  -- FK al departamento
  role_id             bigint not null references public.roles(id),
  role_name           text not null default 'requester'
                      check (role_name in ('admin','technician','requester')),

  is_active           boolean not null default false,  -- "Usuario Activo"
  is_email_verified   boolean not null default false,  -- copia de auth.users
  requested_role      text default 'requester',
  last_login_at       timestamptz,

  avatar_url          text,

  created_at          timestamptz not null default now(), -- Fecha y hora automática de creación
  updated_at          timestamptz not null default now(), -- Fecha y hora automática de última actualización

  constraint profiles_email_unique unique(email)
);

comment on table  public.profiles is 'Información ampliada de auth.users';
comment on column public.profiles.is_active is 'Si es false, el login se bloquea';

/* ----------------------------------------------------------------
   4.  SOLICITUDES DE REGISTRO  (usuarios externos que quieren registrarse)
   ---------------------------------------------------------------- */
create table public.registration_requests (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email             text not null,
  password          text not null,  -- 🔑 AGREGADO: Campo para almacenar contraseña
  department_id     bigint not null references public.departments(id),  -- FK al departamento
  requested_role    text not null default 'requester'
                    check (requested_role in ('admin','technician','requester')),
  status            text not null default 'pending'
                    check (status in ('pending','approved','rejected')),
  
  approved_by       uuid references public.profiles(id),
  approved_at       timestamptz,
  rejection_reason  text,
  
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  
  constraint registration_requests_email_unique unique(email)
);

comment on table public.registration_requests is 'Solicitudes de registro de usuarios externos';

/* ----------------------------------------------------------------
   5.  INCIDENCIAS  (tickets de soporte)
   ---------------------------------------------------------------- */
create table public.incidents (
  id                        uuid primary key default gen_random_uuid(),
  title                     text not null,
  description               text not null,
  type                      text not null 
                            check (type in ('technical','software','hardware','network','other')),
  priority                  text not null default 'medium'
                            check (priority in ('low','medium','high','urgent')),
  status                    text not null default 'open'
                            check (status in ('open','pending','in_progress','completed','delivered','closed')),
  
  affected_area_id          bigint not null references public.departments(id),  -- FK al departamento
  assigned_to               uuid references public.profiles(id),
  created_by                uuid not null references public.profiles(id),
  
  estimated_resolution_date timestamptz,
  
  -- Campos para los tres rangos de tiempo específicos
  review_started_at         timestamptz, -- Cuando se inicia la revisión (in_progress)
  resolved_at               timestamptz, -- Cuando se completa/resuelve
  
  -- Campos para cálculo automático de tiempos
  response_time_hours       numeric(10,2), -- Tiempo desde creación hasta inicio de revisión
  review_time_hours         numeric(10,2), -- Tiempo desde inicio de revisión hasta resolución
  resolution_time_hours     numeric(10,2), -- Tiempo total desde creación hasta resolución
  
  last_modified_by          uuid references public.profiles(id), -- Usuario que realizó la última modificación
  last_modified_at          timestamptz, -- Fecha y hora de la última modificación manual
  
  created_at                timestamptz not null default now(), -- Fecha y hora automática de creación
  updated_at                timestamptz not null default now()  -- Fecha y hora automática de última actualización
);

comment on table public.incidents is 'Tickets de soporte técnico';

/* ----------------------------------------------------------------
   6.  REQUERIMIENTOS  (solicitudes de recursos)
   ---------------------------------------------------------------- */
create table public.requirements (
  id                        uuid primary key default gen_random_uuid(),
  title                     text not null,
  description               text not null,
  type                      text not null 
                            check (type in ('document','equipment','service','other')),
  priority                  text not null default 'medium'
                            check (priority in ('low','medium','high','urgent')),
  status                    text not null default 'pending'
                            check (status in ('open','pending','in_progress','delivered','completed','closed')),
  
  requesting_area_id        bigint not null references public.departments(id),  -- FK al departamento
  assigned_to               uuid references public.profiles(id),
  created_by                uuid not null references public.profiles(id),
  
  estimated_delivery_date   timestamptz,
  
  -- Campos para los tres rangos de tiempo específicos
  review_started_at         timestamptz, -- Cuando se inicia la revisión (in_progress)
  delivered_at              timestamptz, -- Cuando se entrega
  
  -- Campos para cálculo automático de tiempos
  response_time_hours       numeric(10,2), -- Tiempo desde creación hasta inicio de revisión
  review_time_hours         numeric(10,2), -- Tiempo desde inicio de revisión hasta entrega
  delivery_time_hours       numeric(10,2), -- Tiempo total desde creación hasta entrega
  
  last_modified_by          uuid references public.profiles(id), -- Usuario que realizó la última modificación
  last_modified_at          timestamptz, -- Fecha y hora de la última modificación manual
  
  created_at                timestamptz not null default now(), -- Fecha y hora automática de creación
  updated_at                timestamptz not null default now()  -- Fecha y hora automática de última actualización
);

comment on table public.requirements is 'Solicitudes de recursos y servicios';

/* ----------------------------------------------------------------
   7.  ADJUNTOS  (archivos adjuntos)
   ---------------------------------------------------------------- */
create table public.attachments (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  url           text not null,
  size          bigint not null,
  type          text not null,
  uploaded_at   timestamptz not null default now(),
  uploaded_by   uuid not null references public.profiles(id),
  
  -- Referencias polimórficas
  incident_id   uuid references public.incidents(id) on delete cascade,
  requirement_id uuid references public.requirements(id) on delete cascade,
  
  -- Constraint para asegurar que solo una referencia
  constraint attachment_reference check (
    (incident_id is not null and requirement_id is null) or
    (incident_id is null and requirement_id is not null)
  )
);

comment on table public.attachments is 'Archivos adjuntos a incidencias y requerimientos';

/* ----------------------------------------------------------------
   8.  ACTIVIDADES RECIENTES  (log de actividades)
   ---------------------------------------------------------------- */
create table public.recent_activities (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('incident','requirement','user')),
  action      text not null check (action in ('created','updated','resolved','closed','approved','rejected','deleted')),
  title       text not null,
  description text not null,
  timestamp   timestamptz not null default now(),
  user_id     uuid not null references public.profiles(id),
  item_id     uuid not null,
  
  created_at  timestamptz not null default now()
);

comment on table public.recent_activities is 'Log de actividades del sistema';

/* ----------------------------------------------------------------
   8.1. HISTORIAL DE CAMBIOS DE ESTADO  (auditoría de estados)
   ---------------------------------------------------------------- */
create table public.status_history (
  id          uuid primary key default gen_random_uuid(),
  item_type   text not null check (item_type in ('incident','requirement')),
  item_id     uuid not null,
  old_status  text,
  new_status  text not null,
  changed_by  uuid not null references public.profiles(id),
  changed_at  timestamptz not null default now(),
  notes       text
);

-- Índices para optimizar consultas
create index idx_status_history_item on public.status_history(item_type, item_id);
create index idx_status_history_changed_at on public.status_history(changed_at);
create index idx_status_history_changed_by on public.status_history(changed_by);

comment on table public.status_history is 'Historial de cambios de estado para auditoría';

/* ----------------------------------------------------------------
   9.  NOTIFICACIONES  (sistema de notificaciones)
   ---------------------------------------------------------------- */
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  message     text not null,
  type        text not null,
  priority    text not null default 'medium'
              check (priority in ('low','medium','high','urgent')),
  is_read     boolean not null default false,
  
  created_at  timestamptz not null default now()
);

comment on table public.notifications is 'Sistema de notificaciones';

/* ----------------------------------------------------------------
   10. REPORTES  (generación de reportes)
   ---------------------------------------------------------------- */
create table public.reports (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  type          text not null,
  format        text not null check (format in ('pdf','excel','csv','json')),
  date_range    jsonb not null,  -- {start: date, end: date}
  data          jsonb not null,   -- datos del reporte
  status        text not null default 'pending'
                check (status in ('pending','processing','completed','failed')),
  download_url  text,
  
  created_by    uuid not null references public.profiles(id),
  created_at    timestamptz not null default now()
);

comment on table public.reports is 'Reportes generados del sistema';

/* ----------------------------------------------------------------
   11. TRIGGERS PARA updated_at
   ---------------------------------------------------------------- */
create or replace function public.set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Aplicar trigger a todas las tablas que tienen updated_at
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger trg_roles_updated
  before update on public.roles
  for each row execute procedure public.set_updated_at();

create trigger trg_departments_updated
  before update on public.departments
  for each row execute procedure public.set_updated_at();

create trigger trg_registration_requests_updated
  before update on public.registration_requests
  for each row execute procedure public.set_updated_at();

create trigger trg_incidents_updated
  before update on public.incidents
  for each row execute procedure public.set_updated_at();

create trigger trg_requirements_updated
  before update on public.requirements
  for each row execute procedure public.set_updated_at();

/* ----------------------------------------------------------------
   12. SINCRONIZACIÓN AUTOMÁTICA DESDE auth.users
   ---------------------------------------------------------------- */
create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  default_role_id bigint;
begin
  -- Obtener el ID del rol por defecto (requester)
  select id into default_role_id from public.roles where name = 'requester';
  
  if (tg_op = 'INSERT') then          -- nuevo usuario Auth → crea perfil
    insert into public.profiles (id, name, email, is_email_verified, is_active, role_id, role_name)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name',
               split_part(new.email, '@', 1)),   -- fallback: alias del email
      new.email,
      new.email_confirmed_at is not null,
      false,                                    -- lo habilitará un admin
      default_role_id,
      'requester'
    )
    on conflict (id) do nothing;

  elsif (tg_op = 'UPDATE') then       -- cambio de email o verificación
    update public.profiles
       set email              = new.email,
           is_email_verified  = new.email_confirmed_at is not null,
           updated_at         = now()
     where id = new.id;
  end if;

  return new;
end $$;

create trigger trg_auth_users_profile
  after insert or update of email, email_confirmed_at
  on auth.users
  for each row execute procedure public.sync_profile_from_auth();

/* ----------------------------------------------------------------
   13. FUNCIONES PARA CÁLCULO AUTOMÁTICO DE TIEMPOS
   ---------------------------------------------------------------- */

-- Función para calcular tiempos de incidencia (tres rangos específicos)
create or replace function public.calculate_incident_resolution_time()
returns trigger
language plpgsql
as $$
begin
  -- Si se está actualizando el estado a 'in_progress' y se establece review_started_at
  if (tg_op = 'UPDATE' and new.status = 'in_progress' and new.review_started_at is not null) then
    -- Calcular tiempo de respuesta (desde creación hasta inicio de revisión)
    new.response_time_hours := extract(epoch from (new.review_started_at - new.created_at)) / 3600;
  end if;
  
  -- Si se está actualizando el estado a 'completed' o 'delivered' y se establece resolved_at
  if (tg_op = 'UPDATE' and new.status in ('completed', 'delivered') and new.resolved_at is not null) then
    -- Calcular tiempo de revisión (desde inicio de revisión hasta resolución)
    if new.review_started_at is not null then
      new.review_time_hours := extract(epoch from (new.resolved_at - new.review_started_at)) / 3600;
    end if;
    
    -- Calcular tiempo total de resolución (desde creación hasta resolución)
    new.resolution_time_hours := extract(epoch from (new.resolved_at - new.created_at)) / 3600;
  end if;
  
  -- Actualizar campos de auditoría
  new.last_modified_at := now();
  
  return new;
end $$;

-- Trigger para incidencias
create trigger trg_incident_resolution_time
  before update on public.incidents
  for each row execute procedure public.calculate_incident_resolution_time();

-- Función para calcular tiempos de requerimiento (tres rangos específicos)
create or replace function public.calculate_requirement_delivery_time()
returns trigger
language plpgsql
as $$
begin
  -- Si se está actualizando el estado a 'in_progress' y se establece review_started_at
  if (tg_op = 'UPDATE' and new.status = 'in_progress' and new.review_started_at is not null) then
    -- Calcular tiempo de respuesta (desde creación hasta inicio de revisión)
    new.response_time_hours := extract(epoch from (new.review_started_at - new.created_at)) / 3600;
  end if;
  
  -- Si se está actualizando el estado a 'delivered' y se establece delivered_at
  if (tg_op = 'UPDATE' and new.status = 'delivered' and new.delivered_at is not null) then
    -- Calcular tiempo de revisión (desde inicio de revisión hasta entrega)
    if new.review_started_at is not null then
      new.review_time_hours := extract(epoch from (new.delivered_at - new.review_started_at)) / 3600;
    end if;
    
    -- Calcular tiempo total de entrega (desde creación hasta entrega)
    new.delivery_time_hours := extract(epoch from (new.delivered_at - new.created_at)) / 3600;
  end if;
  
  -- Actualizar campos de auditoría
  new.last_modified_at := now();
  
  return new;
end $$;

-- Trigger para requerimientos
create trigger trg_requirement_delivery_time
  before update on public.requirements
  for each row execute procedure public.calculate_requirement_delivery_time();

  /* ----------------------------------------------------------------
   14. ROW-LEVEL SECURITY  +  POLÍTICAS
   ---------------------------------------------------------------- */

-- Habilitar RLS en todas las tablas
alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.registration_requests enable row level security;
alter table public.incidents enable row level security;
alter table public.requirements enable row level security;
alter table public.attachments enable row level security;
alter table public.recent_activities enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- Helper para saber si el usuario actual es admin
create or replace function public.is_admin(u uuid)
returns boolean language sql as
$$
  select exists(
    select 1 from public.profiles p
    join public.roles r on p.role_id = r.id
    where p.id = u and r.name = 'admin' and p.is_active = true
  );
$$;

-- Helper para saber si el usuario actual es técnico
create or replace function public.is_technician(u uuid)
returns boolean language sql as
$$
  select exists(
    select 1 from public.profiles p
    join public.roles r on p.role_id = r.id
    where p.id = u and r.name in ('admin', 'technician') and p.is_active = true
  );
$$;

-- Helper para verificar permisos específicos
create or replace function public.has_permission(u uuid, permission text)
returns boolean language sql as
$$
  select exists(
    select 1 from public.profiles p
    join public.roles r on p.role_id = r.id
    where p.id = u and p.is_active = true 
    and (r.permissions @> jsonb_build_array(permission) or r.permissions @> jsonb_build_array('*'))
  );
$$;

-- Función para crear usuario administrador
create or replace function public.create_admin_user(
  p_user_id uuid,
  p_email text,
  p_password text,
  p_name text,
  p_role_id bigint,
  p_department_id bigint
)
returns void
language plpgsql
security definer
as $$
begin
  -- Crear usuario en auth.users
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) values (
    (select instance_id from auth.users limit 1),
    p_user_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    now(),
    null,
    null,
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('name', p_name),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Crear perfil manualmente
  insert into public.profiles (
    id,
    name,
    email,
    role_id,
    role_name,
    department_id,
    is_active,
    created_at,
    updated_at
  ) values (
    p_user_id,
    p_name,
    p_email,
    p_role_id,
    'admin',
    p_department_id,
    true,
    now(),
    now()
  );
end $$;

-- Políticas para roles (solo admins pueden gestionar)
create policy "roles_admin_all"
  on public.roles for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Política para lectura pública de catálogos (necesaria para formularios de registro)
create policy "roles_public_read"
  on public.roles for select
  using (true); -- Permitir lectura pública de catálogos

-- Políticas para profiles
create policy "profiles_self_select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_admin_all"
  on public.profiles for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Políticas para registration_requests (solo admins pueden ver y gestionar)
create policy "registration_requests_public_insert"
  on public.registration_requests for insert
  with check (true); -- Permitir inserción pública para registro

create policy "registration_requests_admin_all"
  on public.registration_requests for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Políticas para incidents
create policy "incidents_own_select"
  on public.incidents for select
  using (auth.uid() = created_by or auth.uid() = assigned_to);

create policy "incidents_own_insert"
  on public.incidents for insert
  with check (auth.uid() = created_by and public.has_permission(auth.uid(), 'incidents.create'));

create policy "incidents_own_update"
  on public.incidents for update
  using (auth.uid() = created_by or auth.uid() = assigned_to)
  with check (auth.uid() = created_by or auth.uid() = assigned_to);

create policy "incidents_admin_all"
  on public.incidents for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "incidents_technician_all"
  on public.incidents for all
  using (public.is_technician(auth.uid()))
  with check (public.is_technician(auth.uid()));

-- Políticas para requirements
create policy "requirements_own_select"
  on public.requirements for select
  using (auth.uid() = created_by or auth.uid() = assigned_to);

create policy "requirements_own_insert"
  on public.requirements for insert
  with check (auth.uid() = created_by and public.has_permission(auth.uid(), 'requirements.create'));

create policy "requirements_own_update"
  on public.requirements for update
  using (auth.uid() = created_by or auth.uid() = assigned_to)
  with check (auth.uid() = created_by or auth.uid() = assigned_to);

create policy "requirements_admin_all"
  on public.requirements for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "requirements_technician_all"
  on public.requirements for all
  using (public.is_technician(auth.uid()))
  with check (public.is_technician(auth.uid()));

-- Políticas para attachments
create policy "attachments_own_select"
  on public.attachments for select
  using (auth.uid() = uploaded_by);

create policy "attachments_own_insert"
  on public.attachments for insert
  with check (auth.uid() = uploaded_by);

create policy "attachments_admin_all"
  on public.attachments for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Políticas para recent_activities (lectura pública para usuarios autenticados)
create policy "recent_activities_read_all"
  on public.recent_activities for select
  using (auth.uid() is not null);

create policy "recent_activities_admin_insert"
  on public.recent_activities for insert
  with check (public.is_admin(auth.uid()));

-- Políticas para notifications
create policy "notifications_own_select"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_own_update"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notifications_admin_insert"
  on public.notifications for insert
  with check (public.is_admin(auth.uid()));

-- Políticas para reports
create policy "reports_own_select"
  on public.reports for select
  using (auth.uid() = created_by);

create policy "reports_own_insert"
  on public.reports for insert
  with check (auth.uid() = created_by and public.has_permission(auth.uid(), 'reports.create'));

create policy "reports_admin_all"
  on public.reports for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Departamentos: lectura pública autenticada
create policy "departments_read_all"
  on public.departments for select
  using (auth.uid() is not null);

create policy "departments_admin_all"
  on public.departments for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Política para lectura pública de catálogos (necesaria para formularios de registro)
create policy "departments_public_read"
  on public.departments for select
  using (true); -- Permitir lectura pública de catálogos

/* ----------------------------------------------------------------
   15. FUNCIONES PARA GESTIÓN DE ESTADOS
   ---------------------------------------------------------------- */

-- Función para actualizar estado de incidencia con control de roles específico
create or replace function public.update_incident_status(
  p_incident_id uuid,
  p_new_status text,
  p_resolved_at timestamptz default null,
  p_user_id uuid default auth.uid(),
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  incident_record record;
  user_role text;
  old_status text;
  result jsonb;
begin
  -- Verificar permisos del usuario
  select role_name into user_role
  from public.profiles
  where id = p_user_id and is_active = true;
  
  if user_role not in ('admin', 'technician') then
    raise exception 'Solo administradores y técnicos pueden cambiar el estado de incidencias';
  end if;
  
  -- Obtener la incidencia actual
  select * into incident_record
  from public.incidents
  where id = p_incident_id;
  
  if not found then
    raise exception 'Incidencia no encontrada';
  end if;
  
  -- Guardar el estado anterior
  old_status := incident_record.status;
  
  -- Verificar permisos específicos por estado
  if p_new_status in ('pending', 'in_progress', 'completed', 'delivered', 'closed') and user_role != 'admin' then
    raise exception 'Solo administradores pueden cambiar el estado a: %', p_new_status;
  end if;
  
  -- Actualizar estado
  update public.incidents
  set status = p_new_status,
      review_started_at = case when p_new_status = 'in_progress' and review_started_at is null then now() else review_started_at end,
      resolved_at = case when p_new_status in ('completed', 'delivered') then p_resolved_at else resolved_at end,
      last_modified_by = p_user_id,
      last_modified_at = now()
  where id = p_incident_id;
  
  -- Registrar en historial de estados
  insert into public.status_history (
    item_type,
    item_id,
    old_status,
    new_status,
    changed_by,
    notes
  ) values (
    'incident',
    p_incident_id,
    old_status,
    p_new_status,
    p_user_id,
    p_notes
  );
  
  -- Registrar actividad
  perform public.log_activity(
    'incident',
    'updated',
    'Estado de incidencia actualizado',
    'Incidencia ' || incident_record.title || ' cambió de ' || old_status || ' a ' || p_new_status,
    p_user_id,
    p_incident_id
  );
  
  -- Retornar información actualizada
  select jsonb_build_object(
    'id', i.id,
    'status', i.status,
    'review_started_at', i.review_started_at,
    'resolved_at', i.resolved_at,
    'response_time_hours', i.response_time_hours,
    'review_time_hours', i.review_time_hours,
    'resolution_time_hours', i.resolution_time_hours,
    'last_modified_by', p.name,
    'last_modified_at', i.last_modified_at,
    'status_history', (
      select jsonb_agg(
        jsonb_build_object(
          'id', sh.id,
          'old_status', sh.old_status,
          'new_status', sh.new_status,
          'changed_by', up.name,
          'changed_at', sh.changed_at,
          'notes', sh.notes
        ) order by sh.changed_at desc
      )
      from public.status_history sh
      left join public.profiles up on sh.changed_by = up.id
      where sh.item_type = 'incident' and sh.item_id = p_incident_id
    )
  ) into result
  from public.incidents i
  left join public.profiles p on i.last_modified_by = p.id
  where i.id = p_incident_id;
  
  return result;
end $$;

-- Función para actualizar estado de requerimiento con control de roles específico
create or replace function public.update_requirement_status(
  p_requirement_id uuid,
  p_new_status text,
  p_delivered_at timestamptz default null,
  p_user_id uuid default auth.uid(),
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  requirement_record record;
  user_role text;
  old_status text;
  result jsonb;
begin
  -- Verificar permisos del usuario
  select role_name into user_role
  from public.profiles
  where id = p_user_id and is_active = true;
  
  if user_role not in ('admin', 'technician') then
    raise exception 'Solo administradores y técnicos pueden cambiar el estado de requerimientos';
  end if;
  
  -- Obtener el requerimiento actual
  select * into requirement_record
  from public.requirements
  where id = p_requirement_id;
  
  if not found then
    raise exception 'Requerimiento no encontrado';
  end if;
  
  -- Guardar el estado anterior
  old_status := requirement_record.status;
  
  -- Verificar permisos específicos por estado
  if p_new_status in ('pending', 'in_progress', 'completed', 'delivered', 'closed') and user_role != 'admin' then
    raise exception 'Solo administradores pueden cambiar el estado a: %', p_new_status;
  end if;
  
  -- Actualizar estado
  update public.requirements
  set status = p_new_status,
      review_started_at = case when p_new_status = 'in_progress' and review_started_at is null then now() else review_started_at end,
      delivered_at = case when p_new_status = 'delivered' then p_delivered_at else delivered_at end,
      last_modified_by = p_user_id,
      last_modified_at = now()
  where id = p_requirement_id;
  
  -- Registrar en historial de estados
  insert into public.status_history (
    item_type,
    item_id,
    old_status,
    new_status,
    changed_by,
    notes
  ) values (
    'requirement',
    p_requirement_id,
    old_status,
    p_new_status,
    p_user_id,
    p_notes
  );
  
  -- Registrar actividad
  perform public.log_activity(
    'requirement',
    'updated',
    'Estado de requerimiento actualizado',
    'Requerimiento ' || requirement_record.title || ' cambió de ' || old_status || ' a ' || p_new_status,
    p_user_id,
    p_requirement_id
  );
  
  -- Retornar información actualizada
  select jsonb_build_object(
    'id', r.id,
    'status', r.status,
    'review_started_at', r.review_started_at,
    'delivered_at', r.delivered_at,
    'response_time_hours', r.response_time_hours,
    'review_time_hours', r.review_time_hours,
    'delivery_time_hours', r.delivery_time_hours,
    'last_modified_by', p.name,
    'last_modified_at', r.last_modified_at,
    'status_history', (
      select jsonb_agg(
        jsonb_build_object(
          'id', sh.id,
          'old_status', sh.old_status,
          'new_status', sh.new_status,
          'changed_by', up.name,
          'changed_at', sh.changed_at,
          'notes', sh.notes
        ) order by sh.changed_at desc
      )
      from public.status_history sh
      left join public.profiles up on sh.changed_by = up.id
      where sh.item_type = 'requirement' and sh.item_id = p_requirement_id
    )
  ) into result
  from public.requirements r
  left join public.profiles p on r.last_modified_by = p.id
  where r.id = p_requirement_id;
  
  return result;
end $$;

/* ----------------------------------------------------------------
   16. FUNCIONES ÚTILES
   ---------------------------------------------------------------- */

-- Función para obtener métricas del dashboard
create or replace function public.get_dashboard_metrics()
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'totalIncidents', (select count(*) from public.incidents),
    'openIncidents', (select count(*) from public.incidents where status = 'open'),
    'pendingIncidents', (select count(*) from public.incidents where status = 'pending'),
    'inProgressIncidents', (select count(*) from public.incidents where status = 'in_progress'),
    'completedIncidents', (select count(*) from public.incidents where status = 'completed'),
    'deliveredIncidents', (select count(*) from public.incidents where status = 'delivered'),
    'closedIncidents', (select count(*) from public.incidents where status = 'closed'),
    'totalRequirements', (select count(*) from public.requirements),
    'pendingRequirements', (select count(*) from public.requirements where status = 'pending'),
    'deliveredRequirements', (select count(*) from public.requirements where status = 'delivered'),
    'pendingRegistrations', (select count(*) from public.registration_requests where status = 'pending'),
    'totalUsers', (select count(*) from public.profiles where is_active = true),
    'averageResponseTime', (
      select coalesce(avg(response_time_hours), 0) 
      from public.incidents 
      where response_time_hours is not null
    ),
    'averageReviewTime', (
      select coalesce(avg(review_time_hours), 0) 
      from public.incidents 
      where review_time_hours is not null
    ),
    'averageResolutionTime', (
      select coalesce(avg(resolution_time_hours), 0) 
      from public.incidents 
      where resolution_time_hours is not null
    ),
    'averageDeliveryTime', (
      select coalesce(avg(delivery_time_hours), 0) 
      from public.requirements 
      where delivery_time_hours is not null
    ),
    'topDepartments', (
      select jsonb_agg(
        jsonb_build_object('department', d.name, 'count', count)
      ) from (
        select i.affected_area_id, count(*) as count
        from public.incidents i
        group by i.affected_area_id
        order by count desc
        limit 5
      ) deps
      join public.departments d on deps.affected_area_id = d.id
    )
  ) into result;
  
  return result;
end $$;

-- Función para crear notificación
create or replace function public.create_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text default 'info',
  p_priority text default 'medium'
)
returns uuid
language plpgsql
security definer
as $$
declare
  notification_id uuid;
begin
  insert into public.notifications (user_id, title, message, type, priority)
  values (p_user_id, p_title, p_message, p_type, p_priority)
  returning id into notification_id;
  
  return notification_id;
end $$;

-- Función para registrar actividad
create or replace function public.log_activity(
  p_type text,
  p_action text,
  p_title text,
  p_description text,
  p_user_id uuid,
  p_item_id uuid
)
returns uuid
language plpgsql
security definer
as $$
declare
  activity_id uuid;
begin
  insert into public.recent_activities (type, action, title, description, user_id, item_id)
  values (p_type, p_action, p_title, p_description, p_user_id, p_item_id)
  returning id into activity_id;
  
  return activity_id;
end $$;

-- Función para cambiar rol de usuario
create or replace function public.change_user_role(
  p_user_id uuid,
  p_new_role_name text,
  p_admin_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  new_role_id bigint;
  user_record record;
begin
  -- Verificar que el admin tiene permisos
  if not public.is_admin(p_admin_id) then
    raise exception 'Solo los administradores pueden cambiar roles';
  end if;
  
  -- Obtener el ID del nuevo rol
  select id into new_role_id from public.roles where name = p_new_role_name and is_active = true;
  if not found then
    raise exception 'Rol no encontrado: %', p_new_role_name;
  end if;
  
  -- Obtener información del usuario
  select * into user_record from public.profiles where id = p_user_id;
  if not found then
    raise exception 'Usuario no encontrado';
  end if;
  
  -- Actualizar el rol
  update public.profiles
  set role_id = new_role_id,
      role_name = p_new_role_name,
      updated_at = now()
  where id = p_user_id;
  
  -- Registrar actividad
  perform public.log_activity(
    'user',
    'updated',
    'Rol de usuario cambiado',
    'Usuario ' || user_record.name || ' cambió de ' || user_record.role_name || ' a ' || p_new_role_name,
    p_admin_id,
    p_user_id
  );
  
  return true;
end $$;

-- Función para aprobar solicitud de registro
create or replace function public.approve_registration_request(
  p_request_id uuid,
  p_admin_id uuid,
  p_role_name text default 'requester'
)
returns uuid
language plpgsql
security definer
as $$
declare
  request_record record;
  role_id bigint;
begin
  -- Verificar que el admin tiene permisos
  if not public.is_admin(p_admin_id) then
    raise exception 'Solo los administradores pueden aprobar solicitudes';
  end if;
  
  -- Obtener la solicitud
  select * into request_record 
  from public.registration_requests 
  where id = p_request_id and status = 'pending';
  
  if not found then
    raise exception 'Solicitud no encontrada o ya procesada';
  end if;
  
  -- Verificar que la contraseña no esté vacía
  if request_record.password is null or request_record.password = '' then
    raise exception 'La solicitud no tiene contraseña válida';
  end if;
  
  -- Obtener el ID del rol
  select id into role_id from public.roles where name = p_role_name and is_active = true;
  if not found then
    raise exception 'Rol no encontrado: %', p_role_name;
  end if;
  
  -- 🔑 NOTA: La creación del usuario en auth.users se hace desde el frontend
  -- usando supabase.auth.admin.createUser() porque auth.users es manejada por Supabase
  
  -- Actualizar el estado de la solicitud
  update public.registration_requests
  set status = 'approved',
      approved_by = p_admin_id,
      approved_at = now(),
      updated_at = now()
  where id = p_request_id;
  
  -- Registrar actividad
  perform public.log_activity(
    'user',
    'approved',
    'Solicitud de registro aprobada',
    'Usuario ' || request_record.name || ' aprobado como ' || p_role_name,
    p_admin_id,
    p_request_id
  );
  
  return p_request_id;
end $$;

-- Función para rechazar solicitud de registro
create or replace function public.reject_registration_request(
  p_request_id uuid,
  p_admin_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
as $$
declare
  request_record record;
begin
  -- Verificar que el admin tiene permisos
  if not public.is_admin(p_admin_id) then
    raise exception 'Solo los administradores pueden rechazar solicitudes';
  end if;
  
  -- Obtener la solicitud
  select * into request_record 
  from public.registration_requests 
  where id = p_request_id and status = 'pending';
  
  if not found then
    raise exception 'Solicitud no encontrada o ya procesada';
  end if;
  
  -- Actualizar estado
  update public.registration_requests
  set status = 'rejected',
      approved_by = p_admin_id,
      approved_at = now(),
      rejection_reason = p_reason,
      updated_at = now()
  where id = p_request_id;
  
  -- Registrar actividad
  perform public.log_activity(
    'user',
    'rejected',
    'Solicitud de registro rechazada',
    'Usuario ' || request_record.name || ' rechazado: ' || p_reason,
    p_admin_id,
    p_request_id
  );
  
  return p_request_id;
end $$;

/* ----------------------------------------------------------------
   17. ÍNDICES PARA OPTIMIZACIÓN
   ---------------------------------------------------------------- */

-- Índices para búsquedas frecuentes
create index idx_incidents_status on public.incidents(status);
create index idx_incidents_priority on public.incidents(priority);
create index idx_incidents_type on public.incidents(type);
create index idx_incidents_created_by on public.incidents(created_by);
create index idx_incidents_assigned_to on public.incidents(assigned_to);
create index idx_incidents_affected_area_id on public.incidents(affected_area_id);
create index idx_incidents_created_at on public.incidents(created_at);
create index idx_incidents_resolution_time on public.incidents(resolution_time_hours);
create index idx_incidents_last_modified on public.incidents(last_modified_at);

create index idx_requirements_status on public.requirements(status);
create index idx_requirements_priority on public.requirements(priority);
create index idx_requirements_type on public.requirements(type);
create index idx_requirements_created_by on public.requirements(created_by);
create index idx_requirements_assigned_to on public.requirements(assigned_to);
create index idx_requirements_requesting_area_id on public.requirements(requesting_area_id);
create index idx_requirements_created_at on public.requirements(created_at);
create index idx_requirements_delivery_time on public.requirements(delivery_time_hours);
create index idx_requirements_last_modified on public.requirements(last_modified_at);

create index idx_profiles_role_id on public.profiles(role_id);
create index idx_profiles_role_name on public.profiles(role_name);
create index idx_profiles_department_id on public.profiles(department_id);
create index idx_profiles_is_active on public.profiles(is_active);

create index idx_roles_name on public.roles(name);
create index idx_roles_is_active on public.roles(is_active);

create index idx_registration_requests_status on public.registration_requests(status);
create index idx_registration_requests_email on public.registration_requests(email);
create index idx_registration_requests_department_id on public.registration_requests(department_id);

create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_is_read on public.notifications(is_read);
create index idx_notifications_created_at on public.notifications(created_at);

create index idx_recent_activities_type on public.recent_activities(type);
create index idx_recent_activities_timestamp on public.recent_activities(timestamp);

create index idx_attachments_incident_id on public.attachments(incident_id);
create index idx_attachments_requirement_id on public.attachments(requirement_id);

/* ----------------------------------------------------------------
   18. VISTAS ÚTILES
   ---------------------------------------------------------------- */

-- Vista para perfiles con información del rol y departamento
create or replace view public.profiles_with_roles as
select 
  p.*,
  r.name as role_display_name,
  r.description as role_description,
  r.permissions as role_permissions,
  d.name as department_name,
  d.short_name as department_short_name
from public.profiles p
join public.roles r on p.role_id = r.id
left join public.departments d on p.department_id = d.id;

comment on view public.profiles_with_roles is 'Vista que combina perfiles de usuarios con información de roles y departamentos';

-- Vista para incidencias con información del usuario y departamento
create or replace view public.incidents_with_users as
select 
  i.*,
  creator.name as creator_name,
  creator.email as creator_email,
  creator.role_name as creator_role,
  assignee.name as assignee_name,
  assignee.email as assignee_email,
  assignee.role_name as assignee_role,
  d.name as affected_area_name,
  d.short_name as affected_area_short_name
from public.incidents i
left join public.profiles creator on i.created_by = creator.id
left join public.profiles assignee on i.assigned_to = assignee.id
left join public.departments d on i.affected_area_id = d.id;

comment on view public.incidents_with_users is 'Vista que combina incidencias con información de usuarios creadores, asignados y departamentos';

-- Vista para requerimientos con información del usuario y departamento
create or replace view public.requirements_with_users as
select 
  r.*,
  creator.name as creator_name,
  creator.email as creator_email,
  creator.role_name as creator_role,
  assignee.name as assignee_name,
  assignee.email as assignee_email,
  assignee.role_name as assignee_role,
  d.name as requesting_area_name,
  d.short_name as requesting_area_short_name
from public.requirements r
left join public.profiles creator on r.created_by = creator.id
left join public.profiles assignee on r.assigned_to = assignee.id
left join public.departments d on r.requesting_area_id = d.id;

comment on view public.requirements_with_users is 'Vista que combina requerimientos con información de usuarios creadores, asignados y departamentos';

-- Vista para actividades recientes con información del usuario
create or replace view public.activities_with_users as
select 
  ra.*,
  p.name as user_name,
  p.email as user_email,
  p.role_name as user_role
from public.recent_activities ra
left join public.profiles p on ra.user_id = p.id
order by ra.timestamp desc;

comment on view public.activities_with_users is 'Vista que combina actividades recientes con información de usuarios que las realizaron';

-- Vista para solicitudes de registro con información del admin y departamento
create or replace view public.registration_requests_with_admin as
select 
  rr.*,
  admin.name as admin_name,
  admin.email as admin_email,
  d.name as department_name,
  d.short_name as department_short_name
from public.registration_requests rr
left join public.profiles admin on rr.approved_by = admin.id
left join public.departments d on rr.department_id = d.id
order by rr.created_at desc;

comment on view public.registration_requests_with_admin is 'Vista que combina solicitudes de registro con información del administrador aprobador y departamento';

-- Vista mejorada para incidencias con tiempos
create or replace view public.incidents_with_times as
select 
  i.*,
  creator.name as creator_name,
  creator.email as creator_email,
  creator.role_name as creator_role,
  assignee.name as assignee_name,
  assignee.email as assignee_email,
  assignee.role_name as assignee_role,
  d.name as affected_area_name,
  d.short_name as affected_area_short_name,
  modifier.name as last_modified_by_name,
  -- Cálculo de tiempo transcurrido
  case 
    when i.status = 'resolved' and i.resolved_at is not null then
      concat(
        floor(i.resolution_time_hours / 24), ' días, ',
        floor(mod(i.resolution_time_hours, 24)), ' horas'
      )
    when i.status in ('open', 'in_progress') then
      concat(
        floor(extract(epoch from (now() - i.created_at)) / 86400), ' días, ',
        floor(mod(extract(epoch from (now() - i.created_at)) / 3600, 24)), ' horas'
      )
    else 'N/A'
  end as time_elapsed,
  -- Tiempo restante estimado
  case 
    when i.estimated_resolution_date is not null and i.status in ('open', 'in_progress') then
      concat(
        floor(extract(epoch from (i.estimated_resolution_date - now())) / 86400), ' días, ',
        floor(mod(extract(epoch from (i.estimated_resolution_date - now())) / 3600, 24)), ' horas'
      )
    else 'N/A'
  end as time_remaining
from public.incidents i
left join public.profiles creator on i.created_by = creator.id
left join public.profiles assignee on i.assigned_to = assignee.id
left join public.profiles modifier on i.last_modified_by = modifier.id
left join public.departments d on i.affected_area_id = d.id;

comment on view public.incidents_with_times is 'Vista avanzada de incidencias con cálculos de tiempos transcurridos y restantes';

-- Vista mejorada para requerimientos con tiempos
create or replace view public.requirements_with_times as
select 
  r.*,
  creator.name as creator_name,
  creator.email as creator_email,
  creator.role_name as creator_role,
  assignee.name as assignee_name,
  assignee.email as assignee_email,
  assignee.role_name as assignee_role,
  d.name as requesting_area_name,
  d.short_name as requesting_area_short_name,
  modifier.name as last_modified_by_name,
  -- Cálculo de tiempo transcurrido
  case 
    when r.status = 'delivered' and r.delivered_at is not null then
      concat(
        floor(r.delivery_time_hours / 24), ' días, ',
        floor(mod(r.delivery_time_hours, 24)), ' horas'
      )
    when r.status in ('pending', 'in_progress') then
      concat(
        floor(extract(epoch from (now() - r.created_at)) / 86400), ' días, ',
        floor(mod(extract(epoch from (now() - r.created_at)) / 3600, 24)), ' horas'
      )
    else 'N/A'
  end as time_elapsed,
  -- Tiempo restante estimado
  case 
    when r.estimated_delivery_date is not null and r.status in ('pending', 'in_progress') then
      concat(
        floor(extract(epoch from (r.estimated_delivery_date - now())) / 86400), ' días, ',
        floor(mod(extract(epoch from (r.estimated_delivery_date - now())) / 3600, 24)), ' horas'
      )
    else 'N/A'
  end as time_remaining
from public.requirements r
left join public.profiles creator on r.created_by = creator.id
left join public.profiles assignee on r.assigned_to = assignee.id
left join public.profiles modifier on r.last_modified_by = modifier.id
left join public.departments d on r.requesting_area_id = d.id;

comment on view public.requirements_with_times is 'Vista avanzada de requerimientos con cálculos de tiempos transcurridos y restantes';

/* ----------------------------------------------------------------
   19. COMENTARIOS FINALES
   ---------------------------------------------------------------- */

comment on schema public is 'Esquema principal del sistema de gestión de incidencias y requerimientos';

-- Verificar que todo se creó correctamente
do $$
begin
  raise notice '✅ Esquema completo creado exitosamente';
  raise notice '📊 Tablas creadas: %', (
    select count(*) from information_schema.tables 
    where table_schema = 'public' and table_type = 'BASE TABLE'
  );
  raise notice '🔒 Políticas RLS configuradas';
  raise notice '📈 Índices optimizados';
  raise notice '⚙️ Funciones y vistas creadas';
  raise notice ' Sistema de roles y permisos implementado';
  raise notice '🏢 Todos los departamentos incluidos: %', (
    select string_agg(name, ', ') from public.departments
  );
  raise notice '🔗 Foreign keys configuradas para departamentos';
  raise notice '⏱️ Sistema de cálculo de tiempos implementado';
  raise notice '📊 Vistas con información de tiempos creadas';
end $$;

/* ----------------------------------------------------------------
   20. ÍNDICES COMPUESTOS PARA DATA ANALYTICS
   ---------------------------------------------------------------- */

-- Índices compuestos para consultas de analytics
create index idx_incidents_analytics_status_date 
  on public.incidents(status, created_at, priority);

create index idx_incidents_analytics_department_status 
  on public.incidents(affected_area_id, status, created_at);

create index idx_incidents_analytics_assigned_status 
  on public.incidents(assigned_to, status, created_at);

create index idx_requirements_analytics_status_date 
  on public.requirements(status, created_at, priority);

create index idx_requirements_analytics_department_status 
  on public.requirements(requesting_area_id, status, created_at);

-- Índices para métricas de tiempo
create index idx_incidents_resolution_metrics 
  on public.incidents(status, resolution_time_hours, created_at);

create index idx_requirements_delivery_metrics 
  on public.requirements(status, delivery_time_hours, created_at);

-- Índices para búsquedas de texto
create index idx_incidents_title_description 
  on public.incidents using gin(to_tsvector('spanish', title || ' ' || description));

create index idx_requirements_title_description 
  on public.requirements using gin(to_tsvector('spanish', title || ' ' || description));

-- Índices para actividades y auditoría
create index idx_activities_analytics 
  on public.recent_activities(type, action, timestamp);

create index idx_notifications_analytics 
  on public.notifications(user_id, is_read, created_at);

/* ----------------------------------------------------------------
   21. FUNCIONES DE ANALYTICS OPTIMIZADAS
   ---------------------------------------------------------------- */

-- Función para métricas de rendimiento de incidencias
create or replace function public.get_incident_metrics(
  p_start_date timestamptz default now() - interval '30 days',
  p_end_date timestamptz default now(),
  p_department_id bigint default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total_incidents', count(*),
    'resolved_incidents', count(*) filter (where status = 'resolved'),
    'open_incidents', count(*) filter (where status = 'open'),
    'in_progress_incidents', count(*) filter (where status = 'in_progress'),
    'avg_resolution_time_hours', avg(resolution_time_hours) filter (where status = 'resolved'),
    'median_resolution_time_hours', percentile_cont(0.5) within group (order by resolution_time_hours) filter (where status = 'resolved'),
    'incidents_by_priority', jsonb_object_agg(
      priority, count(*) filter (where priority = priority)
    ),
    'incidents_by_type', jsonb_object_agg(
      type, count(*) filter (where type = type)
    ),
    'department_performance', case 
      when p_department_id is null then null
      else jsonb_build_object(
        'department_id', p_department_id,
        'department_incidents', count(*) filter (where affected_area_id = p_department_id),
        'department_resolved', count(*) filter (where affected_area_id = p_department_id and status = 'resolved')
      )
    end
  ) into result
  from public.incidents
  where created_at between p_start_date and p_end_date
    and (p_department_id is null or affected_area_id = p_department_id);
  
  return result;
end $$;

-- Función para métricas de rendimiento de requerimientos
create or replace function public.get_requirement_metrics(
  p_start_date timestamptz default now() - interval '30 days',
  p_end_date timestamptz default now(),
  p_department_id bigint default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'total_requirements', count(*),
    'delivered_requirements', count(*) filter (where status = 'delivered'),
    'pending_requirements', count(*) filter (where status = 'pending'),
    'in_progress_requirements', count(*) filter (where status = 'in_progress'),
    'avg_delivery_time_hours', avg(delivery_time_hours) filter (where status = 'delivered'),
    'median_delivery_time_hours', percentile_cont(0.5) within group (order by delivery_time_hours) filter (where status = 'delivered'),
    'requirements_by_priority', jsonb_object_agg(
      priority, count(*) filter (where priority = priority)
    ),
    'requirements_by_type', jsonb_object_agg(
      type, count(*) filter (where type = type)
    ),
    'department_performance', case 
      when p_department_id is null then null
      else jsonb_build_object(
        'department_id', p_department_id,
        'department_requirements', count(*) filter (where requesting_area_id = p_department_id),
        'department_delivered', count(*) filter (where requesting_area_id = p_department_id and status = 'delivered')
      )
    end
  ) into result
  from public.requirements
  where created_at between p_start_date and p_end_date
    and (p_department_id is null or requesting_area_id = p_department_id);
  
  return result;
end $$;

-- Función para dashboard analytics consolidado
create or replace function public.get_dashboard_analytics(
  p_days_back int default 30
)
returns jsonb
language plpgsql
security definer
as $$
declare
  start_date timestamptz;
  result jsonb;
begin
  start_date := now() - (p_days_back || ' days')::interval;
  
  select jsonb_build_object(
    'period', jsonb_build_object(
      'start_date', start_date,
      'end_date', now(),
      'days_back', p_days_back
    ),
    'incidents', public.get_incident_metrics(start_date, now()),
    'requirements', public.get_requirement_metrics(start_date, now()),
    'user_activity', (
      select jsonb_build_object(
        'total_users', count(distinct user_id),
        'active_users', count(distinct user_id) filter (where timestamp >= now() - interval '7 days'),
        'activities_by_type', jsonb_object_agg(
          type, count(*) filter (where type = type)
        )
      )
      from public.recent_activities
      where timestamp >= start_date
    ),
    'system_health', jsonb_build_object(
      'pending_registrations', (
        select count(*) from public.registration_requests where status = 'pending'
      ),
      'unread_notifications', (
        select count(*) from public.notifications where is_read = false
      ),
      'recent_activities', (
        select count(*) from public.recent_activities where timestamp >= now() - interval '24 hours'
      )
    )
  ) into result;
  
  return result;
end $$;

/* ----------------------------------------------------------------
   22. MATERIALIZED VIEWS PARA REPORTES PESADOS
   ---------------------------------------------------------------- */

-- Vista materializada para reportes de incidencias (actualizada diariamente)
create materialized view if not exists public.mv_incident_reports as
select 
  date_trunc('day', i.created_at) as report_date,
  i.affected_area_id,
  d.name as department_name,
  i.status,
  i.priority,
  i.type,
  count(*) as incident_count,
  avg(i.resolution_time_hours) filter (where i.status = 'resolved') as avg_resolution_time,
  count(*) filter (where i.status = 'resolved') as resolved_count,
  count(*) filter (where i.status = 'open') as open_count,
  count(*) filter (where i.status = 'in_progress') as in_progress_count
from public.incidents i
left join public.departments d on i.affected_area_id = d.id
group by date_trunc('day', i.created_at), i.affected_area_id, d.name, i.status, i.priority, i.type;

comment on materialized view public.mv_incident_reports is 'Vista materializada para reportes de incidencias con métricas agregadas por fecha y departamento';

-- Índice para la vista materializada
create index idx_mv_incident_reports_date_dept 
  on public.mv_incident_reports(report_date, affected_area_id);

-- Función para refrescar vistas materializadas
create or replace function public.refresh_materialized_views()
returns void
language plpgsql
security definer
as $$
begin
  refresh materialized view public.mv_incident_reports;
  -- Agregar más vistas materializadas aquí según sea necesario
end $$;