-- Cuentas de compradores. No pertenecen a store_members y no tienen acceso al POS.
create table public.customer_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text check (phone is null or length(phone) <= 30),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.customer_accounts(user_id) on delete cascade,
  label text not null check (length(trim(label)) between 1 and 60),
  city text not null check (length(trim(city)) between 1 and 100),
  address text not null check (length(trim(address)) between 1 and 400),
  reference text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customer_addresses_user_idx on public.customer_addresses(user_id, created_at desc);
alter table public.customer_accounts enable row level security;
alter table public.customer_addresses enable row level security;

-- La app usa Supabase únicamente para Auth; los datos pasan por Express.
revoke all privileges on public.customer_accounts, public.customer_addresses from anon, authenticated;
grant all privileges on public.customer_accounts, public.customer_addresses to service_role;

create trigger customer_accounts_set_updated_at before update on public.customer_accounts
for each row execute function public.set_updated_at();
create trigger customer_addresses_set_updated_at before update on public.customer_addresses
for each row execute function public.set_updated_at();
