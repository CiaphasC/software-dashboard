-- =============================================================
-- USER SAFE DELETE TRIGGER
-- Objetivo: permitir borrar usuarios (auth.users → profiles) sin
-- violar FKs, reasignando referencias NO anulables a un usuario
-- placeholder del sistema y poniendo NULL en las anulables.
-- =============================================================

-- Nota: No requerimos extensiones; evitamos dependencias como pgcrypto

-- Usuario placeholder: función que garantiza su existencia y devuelve su id
create or replace function public.get_placeholder_user()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  placeholder_id uuid;
begin
  -- 1) Placeholder por email conocido
  select id into placeholder_id from public.profiles where email = 'placeholder@system.local' limit 1;
  if placeholder_id is not null then
    return placeholder_id;
  end if;

  -- 2) Cualquier admin activo
  select id into placeholder_id from public.profiles where role_name = 'admin' and is_active = true limit 1;
  if placeholder_id is not null then
    return placeholder_id;
  end if;

  -- 3) Fallback: primer perfil existente (para no violar NOT NULL)
  select id into placeholder_id from public.profiles order by created_at asc limit 1;
  return placeholder_id;
end $$;

-- Trigger BEFORE DELETE en public.profiles
create or replace function public.before_delete_profile_cleanup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ph uuid;
begin
  ph := public.get_placeholder_user();

  -- Limpiar referencias anulables
  update public.incidents set assigned_to = null where assigned_to = old.id;
  update public.requirements set assigned_to = null where assigned_to = old.id;
  update public.registration_requests set approved_by = null where approved_by = old.id;

  -- Reasignar referencias NO anulables a placeholder
  update public.incidents set created_by = ph where created_by = old.id;
  update public.incidents set last_modified_by = ph where last_modified_by = old.id;

  update public.requirements set created_by = ph where created_by = old.id;
  update public.requirements set last_modified_by = ph where last_modified_by = old.id;

  update public.attachments set uploaded_by = ph where uploaded_by = old.id;
  update public.recent_activities set user_id = ph where user_id = old.id;
  update public.status_history set changed_by = ph where changed_by = old.id;
  update public.reports set created_by = ph where created_by = old.id;

  -- notifications tiene ON DELETE CASCADE; no acción requerida

  return old;
end $$;

drop trigger if exists trg_profiles_before_delete_cleanup on public.profiles;
create trigger trg_profiles_before_delete_cleanup
before delete on public.profiles
for each row execute procedure public.before_delete_profile_cleanup();

comment on function public.before_delete_profile_cleanup() is 'Limpia/reasigna referencias a profiles.id antes de borrarlo';
comment on function public.get_placeholder_user() is 'Devuelve un perfil existente a usar como placeholder sin crear usuarios nuevos';


