-- Los nombres visibles nunca deben mostrar un correo completo.
-- Si no existe un nombre real, se conserva solamente la parte anterior a @.
update public.profiles p
set full_name = coalesce(nullif(split_part(u.email, '@', 1), ''), 'Usuario')
from auth.users u
where p.id = u.id
  and (
    p.full_name is null
    or btrim(p.full_name) = ''
    or position('@' in p.full_name) > 0
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  display_name text;
begin
  display_name := nullif(btrim(new.raw_user_meta_data ->> 'full_name'), '');
  if display_name is null or position('@' in display_name) > 0 then
    display_name := coalesce(nullif(split_part(new.email, '@', 1), ''), 'Usuario');
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, display_name);

  if not exists (select 1 from public.store_members) then
    insert into public.store_members (store_id, user_id, role)
    values ('00000000-0000-0000-0000-000000000001', new.id, 'owner');
  end if;
  return new;
end;
$$;
