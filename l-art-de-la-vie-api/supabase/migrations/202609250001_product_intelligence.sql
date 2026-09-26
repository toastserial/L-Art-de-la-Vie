-- Datos enriquecidos del catálogo y control de uso del análisis fotográfico.
-- El análisis se solicita únicamente desde la app móvil, pero los datos
-- confirmados por el usuario se comparten con POS y tienda web.

alter table public.products
  add column if not exists description text,
  add column if not exists specifications jsonb not null default '{}'::jsonb;

alter table public.products
  drop constraint if exists products_specifications_object;

alter table public.products
  add constraint products_specifications_object
  check (jsonb_typeof(specifications) = 'object');

create table if not exists public.product_vision_usage (
  store_id uuid not null references public.stores(id) on delete cascade,
  billing_month date not null,
  analysis_count integer not null default 0 check (analysis_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (store_id, billing_month)
);

alter table public.product_vision_usage enable row level security;

revoke all privileges on public.product_vision_usage from public, anon, authenticated;
grant all privileges on public.product_vision_usage to service_role;
