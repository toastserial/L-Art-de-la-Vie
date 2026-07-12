-- Asigna el primer usuario existente como propietario y prepara futuros perfiles.
do $$
declare
  first_user_id uuid;
begin
  if not exists (select 1 from public.store_members) then
    select id into first_user_id from auth.users order by created_at asc limit 1;
    if first_user_id is not null then
      insert into public.profiles (id, full_name)
      select u.id, coalesce(u.raw_user_meta_data ->> 'full_name', u.email)
      from auth.users u where u.id = first_user_id
      on conflict (id) do nothing;
      insert into public.store_members (store_id, user_id, role)
      values ('00000000-0000-0000-0000-000000000001', first_user_id, 'owner')
      on conflict do nothing;
    end if;
  end if;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email));

  -- Solo el primer usuario obtiene propiedad automática.
  if not exists (select 1 from public.store_members) then
    insert into public.store_members (store_id, user_id, role)
    values ('00000000-0000-0000-0000-000000000001', new.id, 'owner');
  end if;
  return new;
end;
$$;
