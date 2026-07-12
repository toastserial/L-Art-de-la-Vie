-- Genera códigos consecutivos por tienda y categoría: DEC-001, PER-001, etc.
create table public.product_code_counters (
  store_id uuid not null references public.stores(id) on delete cascade,
  category public.product_category not null,
  last_number integer not null default 0 check (last_number >= 0),
  primary key (store_id, category)
);

alter table public.product_code_counters enable row level security;

-- Continúa desde el mayor código que ya exista en cada categoría.
insert into public.product_code_counters (store_id, category, last_number)
select
  store_id,
  category,
  coalesce(max(substring(code from '([0-9]+)$')::integer), 0)
from public.products
where code ~ '[0-9]+$'
group by store_id, category
on conflict (store_id, category) do update
set last_number = greatest(public.product_code_counters.last_number, excluded.last_number);

create or replace function public.assign_product_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  category_prefix text;
  next_number integer;
begin
  if new.code is not null and btrim(new.code) <> '' then
    return new;
  end if;

  category_prefix := case new.category
    when 'Decoración' then 'DEC'
    when 'Perfumes' then 'PER'
    when 'Carteras' then 'CAR'
    when 'Varios' then 'VAR'
  end;

  insert into public.product_code_counters (store_id, category, last_number)
  values (new.store_id, new.category, 1)
  on conflict (store_id, category) do update
    set last_number = public.product_code_counters.last_number + 1
  returning last_number into next_number;

  new.code := category_prefix || '-' || lpad(next_number::text, 3, '0');
  return new;
end;
$$;

create trigger products_assign_code
before insert on public.products
for each row execute function public.assign_product_code();

grant select on public.product_code_counters to authenticated, service_role;
