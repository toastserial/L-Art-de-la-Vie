-- Acceso del personal por correo. Google/Supabase autentica la identidad,
-- pero solamente los correos de esta lista reciben membresía de la tienda.
create table public.staff_access_allowlist (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and position('@' in email) > 1),
  role public.store_role not null default 'cashier',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, email)
);

create trigger staff_access_allowlist_set_updated_at before update on public.staff_access_allowlist
for each row execute function public.set_updated_at();

-- Conserva acceso para las cuentas que ya eran miembros antes de esta migración.
insert into public.staff_access_allowlist (store_id, email, role)
select sm.store_id, lower(u.email), sm.role
from public.store_members sm
join auth.users u on u.id = sm.user_id
where u.email is not null
on conflict (store_id, email) do update set role = excluded.role, active = true;

create or replace function public.sync_staff_allowlist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    delete from public.store_members sm
    using auth.users u
    where sm.store_id = old.store_id
      and sm.user_id = u.id
      and lower(u.email) = old.email;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  if new.active then
    insert into public.store_members (store_id, user_id, role)
    select new.store_id, u.id, new.role
    from auth.users u
    where lower(u.email) = new.email
    on conflict (store_id, user_id) do update set role = excluded.role;
  end if;
  return new;
end;
$$;

create trigger staff_allowlist_membership_sync
after insert or update or delete on public.staff_access_allowlist
for each row execute function public.sync_staff_allowlist();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles as existing_profile (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do update
  set full_name = case
    when existing_profile.full_name is null or btrim(existing_profile.full_name) = '' or position('@' in existing_profile.full_name) > 0
      then excluded.full_name
    else existing_profile.full_name
  end;

  insert into public.store_members (store_id, user_id, role)
  select access.store_id, new.id, access.role
  from public.staff_access_allowlist access
  where access.active and access.email = lower(new.email)
  on conflict (store_id, user_id) do update set role = excluded.role;

  return new;
end;
$$;

alter table public.staff_access_allowlist enable row level security;
revoke all privileges on public.staff_access_allowlist from anon, authenticated;
revoke execute on function public.sync_staff_allowlist() from public, anon, authenticated;
grant all privileges on public.staff_access_allowlist to service_role;
