-- Categorías administrables por tienda. Conserva las categorías y productos existentes.
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 60),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, name)
);

create unique index product_categories_store_name_ci_idx
on public.product_categories (store_id, lower(btrim(name)));

insert into public.product_categories (store_id, name)
select distinct store_id, category::text
from public.products
on conflict do nothing;

alter table public.products
alter column category type text using category::text;

alter table public.products
add constraint products_store_category_fk
foreign key (store_id, category)
references public.product_categories (store_id, name)
on update cascade
on delete restrict;

create trigger product_categories_set_updated_at before update on public.product_categories
for each row execute function public.set_updated_at();

alter table public.product_categories enable row level security;
revoke all privileges on public.product_categories from anon, authenticated;
grant all privileges on public.product_categories to service_role;

